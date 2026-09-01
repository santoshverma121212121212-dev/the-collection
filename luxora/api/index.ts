
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
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
const isProd = process.env.NODE_ENV === 'production';

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
  // Development / AI Studio Preview Mode: Allow iframe embedding
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

  const { email, password } = req.body;
  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    recordFailedLogin(ip);
    res.status(400).json({ error: 'Invalid Request', message: 'Email and passcode are required.' });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    // 2. Query admin user by email or username using parameterized statement
    const admin = await db.queryOne<{
      id: number;
      username: string;
      email: string;
      password_hash: string;
      role: 'super_admin' | 'editor';
      is_active: number;
    }>(
      `SELECT id, username, email, password_hash, role, is_active
       FROM admins
       WHERE (LOWER(email) = ? OR LOWER(username) = ?) AND is_active = 1`,
      [cleanEmail, cleanEmail]
    );

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      recordFailedLogin(ip);
      await logAudit(null, cleanEmail, 'LOGIN_FAILED', 'admin', null, 'Invalid credentials provided.', req);
      
      // Generic error message - does not reveal if account exists
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials. Access denied.'
      });
      return;
    }

    // 3. Login successful - clear rate limiter and issue cryptographically secure session
    recordSuccessfulLogin(ip);

    const sessionId = generateSecureToken(32);
    const csrfToken = generateSecureToken(32);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    const userAgent = (req.headers['user-agent'] || '').slice(0, 255);

    // Insert session into SQL database
    await db.execute(
      `INSERT INTO admin_sessions (id, admin_id, csrf_token, ip_address, user_agent, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, admin.id, csrfToken, ip, userAgent, expiresAt, now.toISOString()]
    );

    // Update admin last login
    await db.execute(
      `UPDATE admins SET last_login_at = ?, updated_at = ? WHERE id = ?`,
      [now.toISOString(), now.toISOString(), admin.id]
    );

    // Set secure HttpOnly cookie
    res.cookie('luxora_admin_session', sessionId, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000
    });

    await logAudit(admin.id, admin.username, 'LOGIN_SUCCESS', 'admin', String(admin.id), 'Admin session initiated.', req);

    res.json({
      success: true,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        name: admin.username === 'admin' ? 'Super Administrator' : admin.username
      },
      csrfToken
    });
  } catch (err) {
    console.error('[ADMIN LOGIN ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Authentication processing failure.' });
  }
});

// Verify current session
app.get('/api/admin/auth/me', requireAuth, (req, res) => {
  res.json({
    authenticated: true,
    user: {
      ...req.admin,
      name: req.admin?.username === 'admin' ? 'Super Administrator' : req.admin?.username
    },
    csrfToken: req.sessionData?.csrfToken
  });
});

// Logout and invalidate session in SQL
app.post('/api/admin/auth/logout', requireAuth, async (req, res) => {
  const sessionId = req.sessionData?.id;
  if (sessionId) {
    await db.execute('DELETE FROM admin_sessions WHERE id = ?', [sessionId]);
  }

  await logAudit(req.admin!.id, req.admin!.username, 'LOGOUT', 'admin', String(req.admin!.id), 'Session terminated.', req);

  res.clearCookie('luxora_admin_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ----------------------------------------------------
// 5. Protected Admin Operations (Auth + CSRF Protected)
// ----------------------------------------------------

// Admin Dashboard Overview Statistics
app.get('/api/admin/dashboard/stats', requireAuth, async (req, res) => {
  try {
    const totalProdRow = await db.queryOne<{ count: number | string }>('SELECT COUNT(*) as count FROM products');
    const activeProdRow = await db.queryOne<{ count: number | string }>("SELECT COUNT(*) as count FROM products WHERE status = 'active' AND is_published = 1");
    const totalCatRow = await db.queryOne<{ count: number | string }>("SELECT COUNT(*) as count FROM categories WHERE status = 'active'");
    const lowStockRow = await db.queryOne<{ count: number | string }>("SELECT COUNT(*) as count FROM products WHERE stock_status = 'Low Stock' OR stock_status = 'low_stock'");

    const recentLogs = await db.query(
      `SELECT id, admin_username, action, entity_type, entity_id, details, ip_address, timestamp
       FROM audit_logs
       ORDER BY id DESC
       LIMIT 10`
    );

    res.json({
      totalProducts: Number(totalProdRow?.count || 0),
      activeProducts: Number(activeProdRow?.count || 0),
      totalCategories: Number(totalCatRow?.count || 0),
      lowStockCount: Number(lowStockRow?.count || 0),
      recentLogs
    });
  } catch (err) {
    console.error('[ADMIN STATS ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to compute administrative statistics.' });
  }
});

// Admin Products Catalog (All items including drafts/archived)
app.get('/api/admin/products', requireAuth, async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT 
        p.*,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id DESC`
    );

    const imagesMap = await getProductImagesMap();
    const formatted = rows.map(r => formatProductRow(r, imagesMap.get(r.id) || []));
    res.json(formatted);
  } catch (err) {
    console.error('[ADMIN GET PRODUCTS ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to retrieve products.' });
  }
});

// Create New Product (Full Validation & Transaction)
app.post('/api/admin/products', requireAuth, requireCsrf, async (req, res) => {
  try {
    const {
      name,
      subtitle,
      category,
      gender,
      collection,
      price,
      originalPrice,
      discount,
      images,
      image,
      sizes,
      colors,
      description,
      materials,
      fitDetails,
      shippingInfo,
      stockStatus,
      badge,
      isTrending,
      isNew,
      isBestseller,
      isSale,
      purchaseUrl,
      isPublished,
      tags
    } = req.body;

    // 1. Validate Required Fields & Types
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Validation Error', message: 'Product name must be at least 2 characters.' });
      return;
    }

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Price must be a positive number.' });
      return;
    }

    // 2. Validate Purchase URL Security
    const urlValidation = validatePurchaseUrl(purchaseUrl);
    if (!urlValidation.valid || !urlValidation.sanitized) {
      res.status(400).json({ error: 'Validation Error', message: urlValidation.error || 'Invalid purchase destination URL.' });
      return;
    }

    // 3. Find or Validate Category
    let categoryRow = await db.queryOne<{ id: number }>(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?)',
      [category || 'Jackets']
    );

    if (!categoryRow) {
      // Auto create category if not exists
      const catSlug = (category || 'Wardrobe').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const now = new Date().toISOString();
      const catInsert = await db.execute(
        'INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
        [category || 'Wardrobe', catSlug, 'active', now, now]
      );
      categoryRow = { id: Number(catInsert.lastInsertId) || 1 };
    }

    const categoryId = categoryRow.id;

    // 4. Generate Product ID & Slug
    const countRow = await db.queryOne<{ count: number | string }>('SELECT COUNT(*) as count FROM products');
    const productCount = Number(countRow?.count || 0);
    const productId = `LX${String(productCount + 101).padStart(3, '0')}`;
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${productId.toLowerCase()}`;
    const primaryImg = (Array.isArray(images) && images.length > 0) ? images[0] : (image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85');
    const now = new Date().toISOString();

    // 5. Insert Product with Parameterized Statement
    const insertRes = await db.execute(
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
        subtitle ? String(subtitle).trim() : 'Haute Sartorial Creation',
        description ? String(description).trim() : 'Exclusively tailored masterpiece with bespoke architectural drape.',
        categoryId,
        gender || 'unisex',
        collection || 'Autumn/Winter 2026',
        Math.round(numPrice),
        originalPrice ? Math.round(Number(originalPrice)) : null,
        discount ? Number(discount) : 0,
        primaryImg,
        urlValidation.sanitized,
        badge || 'New',
        isTrending ? 1 : 0,
        isNew !== false ? 1 : 0,
        isBestseller ? 1 : 0,
        isSale ? 1 : 0,
        isPublished !== false ? 1 : 0,
        stockStatus || 'In Stock',
        materials || 'Virgin Cashmere & Italian Silk',
        fitDetails || 'Tailored relaxed architectural fit',
        shippingInfo || 'Complimentary insured worldwide courier express delivery.',
        JSON.stringify(Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL']),
        JSON.stringify(Array.isArray(colors) ? colors : []),
        JSON.stringify(Array.isArray(tags) ? tags : []),
        now,
        now
      ]
    );

    const createdSqlId = insertRes.lastInsertId;

    // 6. Insert Multi-Images safely
    if (createdSqlId && Array.isArray(images)) {
      for (let idx = 0; idx < images.length; idx++) {
        const imgUrl = images[idx];
        if (validateImageUrl(imgUrl)) {
          await db.execute(
            'INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)',
            [createdSqlId, imgUrl.trim(), idx, now]
          );
        }
      }
    }

    await logAudit(req.admin!.id, req.admin!.username, 'PRODUCT_CREATED', 'product', productId, `Created "${name}" with purchase destination ${urlValidation.sanitized}`, req);

    res.status(201).json({ success: true, productId, message: `Product "${name}" created successfully.` });
  } catch (err: any) {
    console.error('[ADMIN CREATE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to create product record in database.' });
  }
});

// Update Existing Product
app.put('/api/admin/products/:id', requireAuth, requireCsrf, async (req, res) => {
  try {
    const targetId = req.params.id;
    const existing = await db.queryOne<{ id: number; product_id: string; name: string }>(
      'SELECT id, product_id, name FROM products WHERE product_id = ? OR id = ?',
      [targetId, isNaN(Number(targetId)) ? 0 : Number(targetId)]
    );

    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found in database.' });
      return;
    }

    const {
      name,
      subtitle,
      category,
      gender,
      collection,
      price,
      originalPrice,
      discount,
      images,
      image,
      sizes,
      colors,
      description,
      materials,
      fitDetails,
      shippingInfo,
      stockStatus,
      badge,
      isTrending,
      isNew,
      isBestseller,
      isSale,
      purchaseUrl,
      isPublished,
      status,
      tags
    } = req.body;

    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      res.status(400).json({ error: 'Validation Error', message: 'Price must be a positive number.' });
      return;
    }

    const urlValidation = validatePurchaseUrl(purchaseUrl);
    if (!urlValidation.valid || !urlValidation.sanitized) {
      res.status(400).json({ error: 'Validation Error', message: urlValidation.error || 'Invalid purchase destination URL.' });
      return;
    }

    // Lookup Category ID
    const categoryRow = await db.queryOne<{ id: number }>(
      'SELECT id FROM categories WHERE LOWER(name) = LOWER(?)',
      [category || 'Jackets']
    );
    const categoryId = categoryRow ? categoryRow.id : 1;
    const primaryImg = (Array.isArray(images) && images.length > 0) ? images[0] : (image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85');
    const now = new Date().toISOString();

    await db.execute(
      `UPDATE products SET
        name = ?,
        subtitle = ?,
        description = ?,
        category_id = ?,
        gender = ?,
        collection = ?,
        price = ?,
        original_price = ?,
        discount = ?,
        primary_image = ?,
        purchase_url = ?,
        status = ?,
        badge = ?,
        is_trending = ?,
        is_new = ?,
        is_bestseller = ?,
        is_sale = ?,
        is_published = ?,
        stock_status = ?,
        materials = ?,
        fit_details = ?,
        shipping_info = ?,
        sizes = ?,
        colors = ?,
        tags = ?,
        updated_at = ?
      WHERE id = ?`,
      [
        name.trim(),
        subtitle ? String(subtitle).trim() : null,
        description ? String(description).trim() : '',
        categoryId,
        gender || 'unisex',
        collection || 'Autumn/Winter 2026',
        Math.round(numPrice),
        originalPrice ? Math.round(Number(originalPrice)) : null,
        discount ? Number(discount) : 0,
        primaryImg,
        urlValidation.sanitized,
        status || 'active',
        badge || 'None',
        isTrending ? 1 : 0,
        isNew ? 1 : 0,
        isBestseller ? 1 : 0,
        isSale ? 1 : 0,
        isPublished !== false ? 1 : 0,
        stockStatus || 'In Stock',
        materials || 'Virgin Cashmere & Italian Silk',
        fitDetails || 'Tailored relaxed architectural fit',
        shippingInfo || 'Complimentary insured worldwide courier express delivery.',
        JSON.stringify(Array.isArray(sizes) ? sizes : ['S', 'M', 'L', 'XL']),
        JSON.stringify(Array.isArray(colors) ? colors : []),
        JSON.stringify(Array.isArray(tags) ? tags : []),
        now,
        existing.id
      ]
    );

    // Update images
    if (Array.isArray(images)) {
      await db.execute('DELETE FROM product_images WHERE product_id = ?', [existing.id]);
      for (let idx = 0; idx < images.length; idx++) {
        const imgUrl = images[idx];
        if (validateImageUrl(imgUrl)) {
          await db.execute(
            'INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)',
            [existing.id, imgUrl.trim(), idx, now]
          );
        }
      }
    }

    await logAudit(req.admin!.id, req.admin!.username, 'PRODUCT_UPDATED', 'product', existing.product_id, `Updated product "${name}"`, req);

    res.json({ success: true, message: `Product "${name}" updated successfully.` });
  } catch (err) {
    console.error('[ADMIN UPDATE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to update product.' });
  }
});

// Delete Product (Super Admin or Editor + Auth + CSRF)
app.delete('/api/admin/products/:id', requireAuth, requireCsrf, async (req, res) => {
  try {
    const targetId = req.params.id;
    const existing = await db.queryOne<{ id: number; product_id: string; name: string }>(
      'SELECT id, product_id, name FROM products WHERE product_id = ? OR id = ?',
      [targetId, isNaN(Number(targetId)) ? 0 : Number(targetId)]
    );

    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Product not found.' });
      return;
    }

    // Cascade delete images and product
    await db.execute('DELETE FROM product_images WHERE product_id = ?', [existing.id]);
    await db.execute('DELETE FROM products WHERE id = ?', [existing.id]);

    await logAudit(req.admin!.id, req.admin!.username, 'PRODUCT_DELETED', 'product', existing.product_id, `Deleted product "${existing.name}"`, req);

    res.json({ success: true, message: `Product "${existing.name}" removed from catalog.` });
  } catch (err) {
    console.error('[ADMIN DELETE PRODUCT ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete product.' });
  }
});

// Categories Admin APIs
app.get('/api/admin/categories', requireAuth, async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id, c.name, c.slug, c.status, c.created_at, c.updated_at
      ORDER BY c.id ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database Error', message: 'Failed to retrieve categories.' });
  }
});

app.post('/api/admin/categories', requireAuth, requireCsrf, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Validation Error', message: 'Category name must be at least 2 characters.' });
      return;
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    const existing = await db.queryOne('SELECT id FROM categories WHERE slug = ? OR LOWER(name) = LOWER(?)', [slug, cleanName]);
    if (existing) {
      res.status(400).json({ error: 'Validation Error', message: 'Category with this name or slug already exists.' });
      return;
    }

    await db.execute(
      'INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [cleanName, slug, 'active', now, now]
    );

    await logAudit(req.admin!.id, req.admin!.username, 'CATEGORY_CREATED', 'category', slug, `Created category "${cleanName}"`, req);

    res.status(201).json({ success: true, message: `Category "${cleanName}" created.` });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to create category.' });
  }
});

app.put('/api/admin/categories/:id', requireAuth, requireCsrf, async (req, res) => {
  try {
    const catId = Number(req.params.id);
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Validation Error', message: 'Category name is required.' });
      return;
    }

    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const now = new Date().toISOString();

    await db.execute(
      'UPDATE categories SET name = ?, slug = ?, updated_at = ? WHERE id = ?',
      [cleanName, slug, now, catId]
    );

    await logAudit(req.admin!.id, req.admin!.username, 'CATEGORY_UPDATED', 'category', String(catId), `Renamed category to "${cleanName}"`, req);

    res.json({ success: true, message: `Category renamed to "${cleanName}".` });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to update category.' });
  }
});

app.delete('/api/admin/categories/:id', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const catId = Number(req.params.id);
    const prodCountRow = await db.queryOne<{ count: number | string }>(
      'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      [catId]
    );
    const productCount = Number(prodCountRow?.count || 0);

    if (productCount > 0) {
      res.status(400).json({
        error: 'Deletion Blocked',
        message: `Cannot delete category because ${productCount} products are assigned to it. Reassign products first.`
      });
      return;
    }

    await db.execute('DELETE FROM categories WHERE id = ?', [catId]);
    await logAudit(req.admin!.id, req.admin!.username, 'CATEGORY_DELETED', 'category', String(catId), `Deleted category ID ${catId}`, req);

    res.json({ success: true, message: 'Category removed.' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete category.' });
  }
});

// Audit Logs API (Super Admin Only)
app.get('/api/admin/audit-logs', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 100, 200);
    const logs = await db.query(
      `SELECT id, admin_id, admin_username, action, entity_type, entity_id, details, ip_address, timestamp
       FROM audit_logs
       ORDER BY id DESC
       LIMIT ?`,
      [limit]
    );

    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Database Error', message: 'Failed to fetch audit logs.' });
  }
});

// Admin Users Management (Super Admin Only)
app.get('/api/admin/users', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const users = await db.query(
      `SELECT id, username, email, role, is_active, created_at, last_login_at
       FROM admins
       ORDER BY id ASC`
    );

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Database Error', message: 'Failed to fetch administrators.' });
  }
});

app.post('/api/admin/users', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ error: 'Validation Error', message: 'Valid username, email, and password (min 6 chars) are required.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();
    const validRole = role === 'super_admin' ? 'super_admin' : 'editor';

    const existing = await db.queryOne('SELECT id FROM admins WHERE LOWER(username) = ? OR LOWER(email) = ?', [cleanUsername, cleanEmail]);
    if (existing) {
      res.status(400).json({ error: 'Validation Error', message: 'Username or email is already registered.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO admins (username, email, password_hash, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 1, ?, ?)`,
      [cleanUsername, cleanEmail, passwordHash, validRole, now, now]
    );

    await logAudit(req.admin!.id, req.admin!.username, 'ADMIN_CREATED', 'admin', cleanUsername, `Created new ${validRole} account for ${cleanEmail}`, req);

    res.status(201).json({ success: true, message: `Administrator account for "${cleanUsername}" created.` });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to create admin user.' });
  }
});

app.put('/api/admin/users/:id', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    const { role, is_active, password } = req.body;

    const existing = await db.queryOne<{ id: number; username: string }>('SELECT id, username FROM admins WHERE id = ?', [targetUserId]);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Administrator not found.' });
      return;
    }

    const now = new Date().toISOString();

    if (password && typeof password === 'string' && password.length >= 6) {
      const passwordHash = hashPassword(password);
      await db.execute('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?', [passwordHash, now, targetUserId]);
    }

    if (role) {
      const validRole = role === 'super_admin' ? 'super_admin' : 'editor';
      await db.execute('UPDATE admins SET role = ?, updated_at = ? WHERE id = ?', [validRole, now, targetUserId]);
    }

    if (typeof is_active === 'number' || typeof is_active === 'boolean') {
      const activeInt = is_active ? 1 : 0;
      // Cannot deactivate the primary super admin
      if (existing.username === 'admin' && activeInt === 0) {
        res.status(400).json({ error: 'Action Forbidden', message: 'Cannot deactivate root super administrator.' });
        return;
      }
      await db.execute('UPDATE admins SET is_active = ?, updated_at = ? WHERE id = ?', [activeInt, now, targetUserId]);
    }

    await logAudit(req.admin!.id, req.admin!.username, 'ADMIN_UPDATED', 'admin', existing.username, `Updated administrator profile for ID ${targetUserId}`, req);

    res.json({ success: true, message: 'Administrator profile updated.' });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to update administrator.' });
  }
});

app.delete('/api/admin/users/:id', requireAuth, requireCsrf, requireRole(['super_admin']), async (req, res) => {
  try {
    const targetUserId = Number(req.params.id);
    if (targetUserId === req.admin!.id) {
      res.status(400).json({ error: 'Action Forbidden', message: 'You cannot delete your own active administrator account.' });
      return;
    }

    const existing = await db.queryOne<{ id: number; username: string }>('SELECT id, username FROM admins WHERE id = ?', [targetUserId]);
    if (!existing) {
      res.status(404).json({ error: 'Not Found', message: 'Administrator not found.' });
      return;
    }

    if (existing.username === 'admin') {
      res.status(400).json({ error: 'Action Forbidden', message: 'Cannot delete primary root administrator.' });
      return;
    }

    await db.execute('DELETE FROM admins WHERE id = ?', [targetUserId]);
    await logAudit(req.admin!.id, req.admin!.username, 'ADMIN_DELETED', 'admin', existing.username, `Deleted administrator ${existing.username}`, req);

    res.json({ success: true, message: `Administrator ${existing.username} deleted.` });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to delete administrator.' });
  }
});

// System Backup, Export, & Factory Reset APIs (Super Admin Only)
app.post('/api/admin/system/export', requireAuth, requireRole(['super_admin']), async (req, res) => {
  try {
    const products = await db.query('SELECT * FROM products');
    const categories = await db.query('SELECT * FROM categories');
    const images = await db.query('SELECT * FROM product_images');

    await logAudit(req.admin!.id, req.admin!.username, 'CATALOG_EXPORTED', 'system', null, 'Full SQL database backup generated.', req);

    res.json({
      exportedAt: new Date().toISOString(),
      products,
      categories,
      images
    });
  } catch (err) {
    res.status(500).json({ error: 'Server Error', message: 'Failed to export database backup.' });
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
// Always trigger database initialization on module load (handles both serverless & standalone cold-starts)
initDatabase().catch(err => {
  console.error('[LUXORA SERVER] Database initialization background warning:', err.message);
});

async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      // Allow unhandled /api requests to return standard 404 rather than HTML
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LUXORA SERVER] Online at http://0.0.0.0:${PORT}`);
    console.log(`[LUXORA SERVER] Admin Portal available at /spadmin`);
  });
}

// Only start the permanent HTTP server listener if not running in a Vercel serverless runtime
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
export { app, startServer };
