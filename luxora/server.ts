import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { db, initDatabase } from './src/server/db';
import {
  requireAuth,
  requireRole,
  requireCsrf,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin,
  generateSecureToken,
  hashPassword,
  verifyPassword,
  validatePurchaseUrl,
  validateImageUrl,
  logAudit
} from './src/server/auth';
import { LUXORA_PRODUCTS, INITIAL_CATEGORIES } from './src/data/products';

const app = express();
app.set('trust proxy', 1);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// ----------------------------------------------------
// 1. Environment-Aware Security Headers & Middlewares
// ----------------------------------------------------
if (isProd) {
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
          imgSrc: ["'self'", "data:", "https:", "http:"],
          connectSrc: ["'self'", "https:", "http:"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      hsts: { maxAge: 31536000, includeSubDomains: true }
    })
  );
} else {
  app.use(
    helmet({
      frameguard: false,
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );
}

app.use(cookieParser());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Safe JSON parser error handler (prevents leaking internal stack traces)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({ error: 'Bad Request', message: 'Malformed JSON payload.' });
    return;
  }
  next();
});

// Ensure database initialization on serverless cold-start & standalone boot
initDatabase().catch(err => {
  console.error('[LUXORA SERVER] Database initialization background warning:', err.message);
});

// ----------------------------------------------------
// 2. Helper Functions for SQL Data Transformations
// ----------------------------------------------------
function formatProductRow(row: any, images: string[] = []) {
  let sizes: string[] = [];
  let colors: any[] = [];
  let tags: string[] = [];
  let reviews: any[] = [];

  try { sizes = typeof row.sizes === 'string' ? JSON.parse(row.sizes || '[]') : (row.sizes || []); } catch {}
  try { colors = typeof row.colors === 'string' ? JSON.parse(row.colors || '[]') : (row.colors || []); } catch {}
  try { tags = typeof row.tags === 'string' ? JSON.parse(row.tags || '[]') : (row.tags || []); } catch {}
  try { reviews = typeof row.reviews === 'string' ? JSON.parse(row.reviews || '[]') : (row.reviews || []); } catch {}

  const allImages = images.length > 0 ? images : [row.primary_image];

  return {
    id: row.product_id,
    sqlId: row.id,
    name: row.name,
    slug: row.slug,
    subtitle: row.subtitle,
    category: row.category_name || row.category,
    categoryId: row.category_id,
    gender: row.gender || 'unisex',
    collection: row.collection || 'Autumn/Winter 2026',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    discount: row.discount || 0,
    images: allImages,
    image: row.primary_image,
    sizes: sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
    colors,
    tags,
    rating: Number(row.rating || 5.0),
    reviewsCount: Number(row.reviews_count || 0),
    reviews,
    description: row.description,
    materials: row.materials,
    fitDetails: row.fit_details,
    shippingInfo: row.shipping_info,
    stockStatus: row.stock_status,
    badge: row.badge,
    isTrending: Boolean(Number(row.is_trending)),
    isNew: Boolean(Number(row.is_new)),
    isBestseller: Boolean(Number(row.is_bestseller)),
    isSale: Boolean(Number(row.is_sale)),
    isPublished: Boolean(Number(row.is_published)),
    purchaseUrl: row.purchase_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function getProductImagesMap(): Promise<Map<number, string[]>> {
  const imagesMap = new Map<number, string[]>();
  try {
    const imageRows = await db.query<{ product_id: number; image_url: string }>(
      `SELECT product_id, image_url FROM product_images ORDER BY sort_order ASC`
    );

    for (const img of imageRows) {
      if (!imagesMap.has(img.product_id)) {
        imagesMap.set(img.product_id, []);
      }
      imagesMap.get(img.product_id)!.push(img.image_url);
    }
  } catch (err) {
    console.error('[SQL IMAGES MAP ERROR]', err);
  }
  return imagesMap;
}

// ----------------------------------------------------
// 3. Public Storefront APIs (Parameterized & Escaped)
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: db.engine,
    time: new Date().toISOString()
  });
});

// CSRF Token for public/guest forms
app.get('/api/csrf-token', (req, res) => {
  const guestToken = generateSecureToken(32);
  res.json({ csrfToken: guestToken });
});

// Categories list for public navigation
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await db.query(
      `SELECT 
        c.id,
        c.name,
        c.slug,
        c.status,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_published = 1 AND p.status = 'active'
      WHERE c.status = 'active'
      GROUP BY c.id, c.name, c.slug, c.status
      ORDER BY c.id ASC`
    );

    res.json(categories);
  } catch (err: any) {
    console.error('[SQL CATEGORIES ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to fetch categories.' });
  }
});

// Public products list with filtering and search
app.get('/api/products', async (req, res) => {
  try {
    const categoryParam = req.query.category as string;
    const searchParam = req.query.q as string;
    const genderParam = req.query.gender as string;
    const sortParam = req.query.sort as string;
    const limit = Math.min(Number(req.query.limit) || 100, 100);

    let query = `
      SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.is_published = 1 AND p.status = 'active'
    `;
    const params: any[] = [];

    if (categoryParam && categoryParam !== 'all') {
      query += ` AND (LOWER(c.name) = LOWER(?) OR LOWER(c.slug) = LOWER(?))`;
      params.push(categoryParam, categoryParam);
    }

    if (genderParam && genderParam !== 'all') {
      query += ` AND (LOWER(p.gender) = LOWER(?) OR p.gender = 'unisex')`;
      params.push(genderParam);
    }

    if (searchParam && searchParam.trim()) {
      const searchTerm = `%${searchParam.trim().toLowerCase()}%`;
      query += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ? OR LOWER(p.tags) LIKE ?)`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sort order
    if (sortParam === 'price-asc') {
      query += ` ORDER BY p.price ASC`;
    } else if (sortParam === 'price-desc') {
      query += ` ORDER BY p.price DESC`;
    } else if (sortParam === 'newest') {
      query += ` ORDER BY p.created_at DESC`;
    } else if (sortParam === 'rating') {
      query += ` ORDER BY p.rating DESC`;
    } else if (sortParam === 'discount') {
      query += ` ORDER BY p.discount DESC`;
    } else {
      query += ` ORDER BY p.is_bestseller DESC, p.id ASC`;
    }

    query += ` LIMIT ?`;
    params.push(limit);

    const rows = await db.query(query, params);
    const imagesMap = await getProductImagesMap();

    const formattedProducts = rows.map(r => formatProductRow(r, imagesMap.get(r.id) || []));
    res.json(formattedProducts);
  } catch (err) {
    console.error('[SQL PRODUCTS ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to retrieve products.' });
  }
});

// Single product details
app.get('/api/products/:idOrSlug', async (req, res) => {
  try {
    const idOrSlug = req.params.idOrSlug;
    const row = await db.queryOne(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE (p.product_id = ? OR p.slug = ?) AND p.is_published = 1 AND p.status = 'active'`,
      [idOrSlug, idOrSlug]
    );

    if (!row) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    const imagesRows = await db.query<{ image_url: string }>(
      `SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC`,
      [row.id]
    );

    const images = imagesRows.map(i => i.image_url);
    res.json(formatProductRow(row, images));
  } catch (err) {
    console.error('[SQL SINGLE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to fetch product.' });
  }
});

// ----------------------------------------------------
// 4. Server-Side Admin Authentication Endpoints
// ----------------------------------------------------
app.post('/api/admin/auth/login', async (req, res) => {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

  // 1. Check Rate Limit (Lockout protection)
  const rateLimitStatus = checkLoginRateLimit(ip);
  if (!rateLimitStatus.allowed) {
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Too many failed authentication attempts. Please retry in ${rateLimitStatus.retryAfterSeconds} seconds.`
    });
    return;
  }

  const { email, username, password } = req.body || {};
  const identifier = (email || username || '').trim();

  if (!identifier || !password) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Username/Email and password are required.'
    });
    return;
  }

  try {
    const admin = await db.queryOne<{
      id: number;
      username: string;
      email: string;
      password_hash: string;
      role: string;
      is_active: number;
    }>(
      `SELECT id, username, email, password_hash, role, is_active 
       FROM admins 
       WHERE (LOWER(email) = LOWER(?) OR LOWER(username) = LOWER(?)) AND is_active = 1`,
      [identifier, identifier]
    );

    if (!admin) {
      recordFailedLogin(ip);
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials. Access denied.' });
      return;
    }

    // Verify Password Hash
    const isMatch = verifyPassword(password, admin.password_hash);
    if (!isMatch) {
      recordFailedLogin(ip);
      await logAudit(admin.id, admin.username, 'FAILED_LOGIN_ATTEMPT', 'auth', String(admin.id), 'Incorrect password provided.', req);
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid credentials. Access denied.' });
      return;
    }

    // Reset rate limiter on successful auth
    recordSuccessfulLogin(ip);

    // Create session in Database
    const sessionId = generateSecureToken(48);
    const csrfToken = generateSecureToken(32);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(); // 8 Hours
    const now = new Date().toISOString();

    const userAgent = req.headers['user-agent'] || 'Unknown Browser';

    await db.execute(
      `INSERT INTO admin_sessions (id, admin_id, csrf_token, ip_address, user_agent, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, admin.id, csrfToken, ip, userAgent.substring(0, 255), expiresAt, now]
    );

    // Update last login timestamp
    await db.execute(`UPDATE admins SET last_login_at = ? WHERE id = ?`, [now, admin.id]);

    // Issue Secure HttpOnly Cookie
    res.cookie('luxora_admin_session', sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60 * 1000
    });

    await logAudit(admin.id, admin.username, 'ADMIN_LOGIN_SUCCESS', 'auth', String(admin.id), 'Authenticated into administrative atelier portal.', req);

    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.role === 'super_admin' ? 'Super Administrator' : 'Editorial Manager'
      },
      csrfToken
    });
  } catch (err: any) {
    console.error('[ADMIN LOGIN ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Authentication processing failed.' });
  }
});

// Admin Session Verification ('/me')
app.get('/api/admin/auth/me', requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: req.admin,
    csrfToken: req.csrfToken
  });
});

// Admin Logout
app.post('/api/admin/auth/logout', requireAuth, async (req, res) => {
  try {
    const sessionId = req.cookies.luxora_admin_session;
    if (sessionId) {
      await db.execute(`DELETE FROM admin_sessions WHERE id = ?`, [sessionId]);
    }

    res.clearCookie('luxora_admin_session', { path: '/' });
    if (req.admin) {
      await logAudit(req.admin.id, req.admin.username, 'ADMIN_LOGOUT', 'auth', String(req.admin.id), 'Terminated administrative session.', req);
    }

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('[ADMIN LOGOUT ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to process logout.' });
  }
});

// ----------------------------------------------------
// 5. Protected Administrative Catalog Operations (RBAC)
// ----------------------------------------------------

// GET: All Products (Including Drafts & Archival Items)
app.get('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC`
    );

    const imagesMap = await getProductImagesMap();
    const formatted = rows.map(r => formatProductRow(r, imagesMap.get(r.id) || []));
    res.json(formatted);
  } catch (err) {
    console.error('[ADMIN GET PRODUCTS ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to fetch catalog.' });
  }
});

// POST: Create New Luxury Product
app.post('/api/admin/products', requireAuth, requireCsrf, requireRole(['super_admin', 'editor']), async (req, res) => {
  try {
    const {
      name,
      subtitle,
      description,
      categoryId,
      gender,
      collection,
      price,
      originalPrice,
      primaryImage,
      images,
      purchaseUrl,
      badge,
      isTrending,
      isNew,
      isBestseller,
      isSale,
      isPublished,
      stockStatus,
      materials,
      fitDetails,
      shippingInfo,
      sizes,
      colors,
      tags
    } = req.body || {};

    // Validate Required Fields
    if (!name || !description || !price || !primaryImage || !purchaseUrl || !categoryId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Name, Description, Category, Price, Primary Image, and Purchase URL are mandatory.'
      });
      return;
    }

    // SSRF URL Validation
    if (!validatePurchaseUrl(purchaseUrl)) {
      res.status(400).json({ error: 'Validation Error', message: 'Purchase URL must be a valid HTTPS Amazon India URL or domain link.' });
      return;
    }

    if (!validateImageUrl(primaryImage)) {
      res.status(400).json({ error: 'Validation Error', message: 'Primary Image must be a valid secure image URL.' });
      return;
    }

    const now = new Date().toISOString();
    const productId = 'LX' + Date.now().toString().slice(-6);
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-4);

    const discount = originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    const result = await db.execute(
      `INSERT INTO products (
        product_id, name, slug, subtitle, description, category_id, gender,
        collection, price, original_price, discount, primary_image, purchase_url,
        status, badge, is_trending, is_new, is_bestseller, is_sale, is_published,
        stock_status, materials, fit_details, shipping_info, sizes, colors, tags,
        rating, reviews_count, reviews, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        'active', ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        5.0, 0, '[]', ?, ?
      )`,
      [
        productId,
        name.trim(),
        slug,
        subtitle ? subtitle.trim() : '',
        description.trim(),
        Number(categoryId),
        gender || 'unisex',
        collection || 'Autumn/Winter 2026',
        Math.round(Number(price)),
        originalPrice ? Math.round(Number(originalPrice)) : null,
        discount,
        primaryImage.trim(),
        purchaseUrl.trim(),
        badge || 'None',
        isTrending ? 1 : 0,
        isNew ? 1 : 0,
        isBestseller ? 1 : 0,
        isSale ? 1 : 0,
        isPublished !== false ? 1 : 0,
        stockStatus || 'In Stock',
        materials || 'Premium Haute Craftsmanship',
        fitDetails || 'Refined Tailored Fit',
        shippingInfo || 'Complimentary express insured courier.',
        JSON.stringify(Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL']),
        JSON.stringify(Array.isArray(colors) ? colors : []),
        JSON.stringify(Array.isArray(tags) ? tags : []),
        now,
        now
      ]
    );

    const createdDbId = result.lastInsertId;

    // Insert Gallery Images
    if (createdDbId && Array.isArray(images) && images.length > 0) {
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        if (typeof img === 'string' && validateImageUrl(img)) {
          await db.execute(
            `INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)`,
            [createdDbId, img.trim(), idx, now]
          );
        }
      }
    }

    await logAudit(req.admin!.id, req.admin!.username, 'PRODUCT_CREATE', 'product', productId, `Created product: ${name}`, req);

    res.status(201).json({
      success: true,
      productId,
      message: 'Luxury runway creation published successfully.'
    });
  } catch (err: any) {
    console.error('[ADMIN CREATE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to create product creation.' });
  }
});

// PUT: Update Existing Product
app.put('/api/admin/products/:id', requireAuth, requireCsrf, requireRole(['super_admin', 'editor']), async (req, res) => {
  try {
    const idOrProductId = req.params.id;
    const existing = await db.queryOne<{ id: number; product_id: string; name: string }>(
      `SELECT id, product_id, name FROM products WHERE id = ? OR product_id = ?`,
      [idOrProductId, idOrProductId]
    );

    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Product item not found.' });
      return;
    }

    const {
      name,
      subtitle,
      description,
      categoryId,
      gender,
      collection,
      price,
      originalPrice,
      primaryImage,
      images,
      purchaseUrl,
      status,
      badge,
      isTrending,
      isNew,
      isBestseller,
      isSale,
      isPublished,
      stockStatus,
      materials,
      fitDetails,
      shippingInfo,
      sizes,
      colors,
      tags
    } = req.body || {};

    if (purchaseUrl && !validatePurchaseUrl(purchaseUrl)) {
      res.status(400).json({ error: 'Validation Error', message: 'Invalid purchase affiliate URL format.' });
      return;
    }

    if (primaryImage && !validateImageUrl(primaryImage)) {
      res.status(400).json({ error: 'Validation Error', message: 'Invalid primary image URL.' });
      return;
    }

    const now = new Date().toISOString();
    const discount = originalPrice && originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;

    await db.execute(
      `UPDATE products SET
        name = COALESCE(?, name),
        subtitle = COALESCE(?, subtitle),
        description = COALESCE(?, description),
        category_id = COALESCE(?, category_id),
        gender = COALESCE(?, gender),
        collection = COALESCE(?, collection),
        price = COALESCE(?, price),
        original_price = ?,
        discount = ?,
        primary_image = COALESCE(?, primary_image),
        purchase_url = COALESCE(?, purchase_url),
        status = COALESCE(?, status),
        badge = COALESCE(?, badge),
        is_trending = ?,
        is_new = ?,
        is_bestseller = ?,
        is_sale = ?,
        is_published = ?,
        stock_status = COALESCE(?, stock_status),
        materials = COALESCE(?, materials),
        fit_details = COALESCE(?, fit_details),
        shipping_info = COALESCE(?, shipping_info),
        sizes = COALESCE(?, sizes),
        colors = COALESCE(?, colors),
        tags = COALESCE(?, tags),
        updated_at = ?
      WHERE id = ?`,
      [
        name ? name.trim() : null,
        subtitle ? subtitle.trim() : null,
        description ? description.trim() : null,
        categoryId ? Number(categoryId) : null,
        gender || null,
        collection || null,
        price ? Math.round(Number(price)) : null,
        originalPrice ? Math.round(Number(originalPrice)) : null,
        discount,
        primaryImage ? primaryImage.trim() : null,
        purchaseUrl ? purchaseUrl.trim() : null,
        status || 'active',
        badge || 'None',
        isTrending !== undefined ? (isTrending ? 1 : 0) : 0,
        isNew !== undefined ? (isNew ? 1 : 0) : 0,
        isBestseller !== undefined ? (isBestseller ? 1 : 0) : 0,
        isSale !== undefined ? (isSale ? 1 : 0) : 0,
        isPublished !== undefined ? (isPublished ? 1 : 0) : 1,
        stockStatus || 'In Stock',
        materials || null,
        fitDetails || null,
        shippingInfo || null,
        sizes ? JSON.stringify(sizes) : null,
        colors ? JSON.stringify(colors) : null,
        tags ? JSON.stringify(tags) : null,
        now,
        existing.id
      ]
    );

    // Update gallery images if supplied
    if (Array.isArray(images)) {
      await db.execute(`DELETE FROM product_images WHERE product_id = ?`, [existing.id]);
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        if (typeof img === 'string' && validateImageUrl(img)) {
          await db.execute(
            `INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)`,
            [existing.id, img.trim(), idx, now]
          );
        }
      }
    }

    await logAudit(req.admin!.id, req.admin!.username, 'PRODUCT_UPDATE', 'product', existing.product_id, `Updated details for ${existing.name}`, req);

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (err: any) {
    console.error('[ADMIN UPDATE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to update product details.' });
  }
});

// DELETE: Remove Product
app.delete('/api/admin/products/:id', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const idOrProductId = req.params.id;
    const existing = await db.queryOne<{ id: number; product_id: string; name: string }>(
      `SELECT id, product_id, name FROM products WHERE id = ? OR product_id = ?`,
      [idOrProductId, idOrProductId]
    );

    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Product does not exist.' });
      return;
    }

    await db.execute(`DELETE FROM product_images WHERE product_id = ?`, [existing.id]);
    await db.execute(`DELETE FROM products WHERE id = ?`, [existing.id]);

    await logAudit(req.admin!.id, req.admin!.username, 'PRODUCT_DELETE', 'product', existing.product_id, `Deleted product: ${existing.name}`, req);

    res.json({ success: true, message: 'Product creation successfully archived and removed.' });
  } catch (err) {
    console.error('[ADMIN DELETE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to delete product.' });
  }
});

// Categories Management (GET, POST, PUT, DELETE)
app.get('/api/admin/categories', requireAuth, async (req, res) => {
  try {
    const categories = await db.query(
      `SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.slug, c.status, c.created_at, c.updated_at
      ORDER BY c.id ASC`
    );
    res.json(categories);
  } catch (err) {
    console.error('[ADMIN GET CATEGORIES ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to fetch categories.' });
  }
});

app.post('/api/admin/categories', requireAuth, requireCsrf, requireRole(['super_admin', 'editor']), async (req, res) => {
  try {
    const { name } = req.body || {};
    if (!name || !name.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Category name is required.' });
      return;
    }

    const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const result = await db.execute(
      `INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES (?, ?, 'active', ?, ?)`,
      [name.trim(), slug, now, now]
    );

    await logAudit(req.admin!.id, req.admin!.username, 'CATEGORY_CREATE', 'category', String(result.lastInsertId), `Created category ${name}`, req);

    res.status(201).json({ success: true, categoryId: result.lastInsertId, message: 'Category created successfully.' });
  } catch (err: any) {
    console.error('[ADMIN CREATE CATEGORY ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to create category.' });
  }
});

app.put('/api/admin/categories/:id', requireAuth, requireCsrf, requireRole(['super_admin', 'editor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body || {};

    const existing = await db.queryOne<{ id: number; name: string }>(`SELECT id, name FROM categories WHERE id = ?`, [id]);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Category not found.' });
      return;
    }

    const now = new Date().toISOString();
    let slug = undefined;
    if (name && name.trim()) {
      slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await db.execute(
      `UPDATE categories SET
        name = COALESCE(?, name),
        slug = COALESCE(?, slug),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE id = ?`,
      [name ? name.trim() : null, slug || null, status || null, now, id]
    );

    await logAudit(req.admin!.id, req.admin!.username, 'CATEGORY_UPDATE', 'category', String(id), `Updated category ${name || existing.name}`, req);

    res.json({ success: true, message: 'Category updated.' });
  } catch (err) {
    console.error('[ADMIN UPDATE CATEGORY ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to update category.' });
  }
});

app.delete('/api/admin/categories/:id', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const countRow = await db.queryOne<{ count: number }>(`SELECT COUNT(id) as count FROM products WHERE category_id = ?`, [id]);
    if (countRow && countRow.count > 0) {
      res.status(400).json({
        error: 'Integrity Error',
        message: `Cannot delete category containing ${countRow.count} active product(s). Reassign products first.`
      });
      return;
    }

    await db.execute(`DELETE FROM categories WHERE id = ?`, [id]);
    await logAudit(req.admin!.id, req.admin!.username, 'CATEGORY_DELETE', 'category', String(id), `Deleted category ID: ${id}`, req);

    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    console.error('[ADMIN DELETE CATEGORY ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to delete category.' });
  }
});

// Audit Logs
app.get('/api/admin/audit-logs', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const logs = await db.query(`SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?`, [limit]);
    res.json(logs);
  } catch (err) {
    console.error('[ADMIN AUDIT LOGS ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to load audit logs.' });
  }
});

// Admin Users Management (Super Admin only)
app.get('/api/admin/users', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const users = await db.query(`SELECT id, username, email, role, is_active, created_at, last_login_at FROM admins ORDER BY id ASC`);
    res.json(users);
  } catch (err) {
    console.error('[ADMIN GET USERS ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to load administrators.' });
  }
});

app.post('/api/admin/users', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body || {};
    if (!username || !email || !password) {
      res.status(400).json({ error: 'Validation Error', message: 'Username, email, and password are required.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Validation Error', message: 'Password must be at least 8 characters.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    const resDb = await db.execute(
      `INSERT INTO admins (username, email, password_hash, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [username.trim().toLowerCase(), email.trim().toLowerCase(), passwordHash, role || 'editor', now, now]
    );

    await logAudit(req.admin!.id, req.admin!.username, 'ADMIN_USER_CREATE', 'admin', String(resDb.lastInsertId), `Created administrator account for ${username}`, req);

    res.status(201).json({ success: true, message: 'Administrator created successfully.' });
  } catch (err: any) {
    console.error('[ADMIN CREATE USER ERROR]', err);
    res.status(500).json({ error: 'Database Error', message: 'Failed to create administrator (may already exist).' });
  }
});

app.post('/api/admin/system/reset', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    // Clear products and images, re-seed defaults
    await db.execute('DELETE FROM product_images');
    await db.execute('DELETE FROM products');
    await db.execute('DELETE FROM categories');

    const now = new Date().toISOString();
    const categoryMap = new Map<string, number>();

    for (const catName of INITIAL_CATEGORIES) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catRes = await db.execute(
        `INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES (?, ?, 'active', ?, ?)`,
        [catName, slug, now, now]
      );
      if (catRes.lastInsertId) {
        categoryMap.set(catName.toLowerCase(), Number(catRes.lastInsertId));
      }
    }

    const reloaded = await db.query<{ id: number; name: string }>('SELECT id, name FROM categories');
    reloaded.forEach(c => categoryMap.set(c.name.toLowerCase(), c.id));

    for (const item of LUXORA_PRODUCTS) {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const catId = categoryMap.get(item.category.toLowerCase()) || reloaded[0]?.id || 1;
      const primaryImage = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85';

      const insertProd = await db.execute(
        `INSERT INTO products (
          product_id, name, slug, subtitle, description, category_id, gender,
          collection, price, original_price, discount, primary_image, purchase_url,
          status, badge, is_trending, is_new, is_bestseller, is_sale, is_published,
          stock_status, materials, fit_details, shipping_info, sizes, colors, tags,
          rating, reviews_count, reviews, created_at, updated_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          'active', ?, ?, ?, ?, ?, 1,
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?
        )`,
        [
          item.id,
          item.name,
          slug,
          item.subtitle || 'Haute Sartorial Creation',
          item.description,
          catId,
          item.gender || 'unisex',
          item.collection || 'Autumn/Winter 2026',
          Math.round(item.price),
          item.originalPrice ? Math.round(item.originalPrice) : null,
          item.discount || 0,
          primaryImage,
          item.purchaseUrl || 'https://www.amazon.in',
          item.badge || 'None',
          item.isTrending ? 1 : 0,
          item.isNew ? 1 : 0,
          item.isBestseller ? 1 : 0,
          item.isSale ? 1 : 0,
          item.stockStatus || 'In Stock',
          item.materials || 'Virgin Cashmere & Italian Silk',
          item.fitDetails || 'Tailored relaxed architectural fit',
          item.shippingInfo || 'Complimentary insured worldwide courier express delivery.',
          JSON.stringify(item.sizes || ['S', 'M', 'L', 'XL']),
          JSON.stringify(item.colors || []),
          JSON.stringify(item.tags || []),
          item.rating || 5.0,
          item.reviewsCount || 0,
          JSON.stringify(item.reviews || []),
          now,
          now
        ]
      );

      const createdId = insertProd.lastInsertId;
      if (createdId && Array.isArray(item.images)) {
        for (let idx = 0; idx < item.images.length; idx++) {
          await db.execute(
            `INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)`,
            [createdId, item.images[idx], idx, now]
          );
        }
      }
    }

    await logAudit(req.admin!.id, req.admin!.username, 'CATALOG_FACTORY_RESET', 'system', null, 'Restored factory showcase runway pieces.', req);

    res.json({ success: true, message: 'Database reset to factory catalog state.' });
  } catch (err) {
    console.error('[ADMIN RESET ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to reset catalog.' });
  }
});

// ----------------------------------------------------
// 6. Vite Middleware (Dev) & Static Serving (Prod)
// ----------------------------------------------------
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LUXORA SERVER] Running on http://localhost:${PORT}`);
  });
}

// Only start the permanent HTTP server listener if not running in a Vercel serverless runtime
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { app, startServer };
