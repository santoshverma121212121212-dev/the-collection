import pg from 'pg';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { DatabaseSync } from 'node:sqlite';
import { LUXORA_PRODUCTS, INITIAL_CATEGORIES } from '../data/products';

const { Pool } = pg;

export type DatabaseEngine = 'postgresql' | 'sqlite';

export interface DatabaseAdapter {
  engine: DatabaseEngine;
  isConnected: boolean;
  lastError: string | null;
  init: () => Promise<void>;
  query: <T = any>(sql: string, params?: any[]) => Promise<T[]>;
  queryOne: <T = any>(sql: string, params?: any[]) => Promise<T | null>;
  execute: (sql: string, params?: any[]) => Promise<{ affectedRows: number; lastInsertId?: number | string }>;
}

let pgPool: pg.Pool | null = null;
let sqliteDb: any = null;
let initPromise: Promise<void> | null = null;

function getDatabaseUrl(): string {
  return (process.env.DATABASE_URL || '').trim();
}

/**
 * Parses PostgreSQL connection strings with support for special characters (like @ or !) in passwords.
 */
function parsePostgresConfig(rawUrl: string): pg.PoolConfig {
  let isSslDisabled = false;
  try {
    const url = new URL(rawUrl);
    isSslDisabled = url.searchParams.get('sslmode') === 'disable';
  } catch {}

  const sslConfig = isSslDisabled ? false : { rejectUnauthorized: false };

  try {
    const match = rawUrl.match(/^(postgres(?:ql)?):\/\/([^:]+):(.*)@([^:/@]+)(?::(\d+))?\/(.*)$/);
    if (match) {
      const [, , user, password, host, portStr, dbWithQuery] = match;
      const port = portStr ? parseInt(portStr, 10) : 5432;
      const [database] = dbWithQuery.split('?');
      return {
        user: decodeURIComponent(user),
        password: decodeURIComponent(password),
        host,
        port,
        database: database || 'postgres',
        ssl: sslConfig,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 4000
      };
    }
  } catch {}

  return {
    connectionString: rawUrl,
    ssl: sslConfig,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 4000
  };
}

/**
 * Format SQLite parameter markers '?' into PostgreSQL '$1', '$2', ...
 */
function convertSqlForPostgres(sql: string): string {
  let paramIndex = 1;
  return sql.replace(/\?/g, () => `$${paramIndex++}`);
}

function getSqliteDb() {
  if (!sqliteDb) {
    try {
      const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'data') : path.join(process.cwd(), 'data');
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const dbPath = path.join(DATA_DIR, 'luxora.db');
      sqliteDb = new DatabaseSync(dbPath);
      sqliteDb.exec('PRAGMA foreign_keys = ON;');
      sqliteDb.exec('PRAGMA journal_mode = WAL;');
    } catch (err: any) {
      console.error('[LUXORA DB] SQLite initial setup error:', err.message);
      throw err;
    }
  }
  return sqliteDb;
}

export const db: DatabaseAdapter = {
  engine: 'sqlite',
  isConnected: false,
  lastError: null,

  async init(): Promise<void> {
    if (initPromise) return initPromise;

    initPromise = (async () => {
      const rawDbUrl = getDatabaseUrl();
      const isVercelRuntime = !!process.env.VERCEL;
      const isPostgresConfigured = rawDbUrl.startsWith('postgres://') || rawDbUrl.startsWith('postgresql://');

      // Production/Vercel must use the persistent PostgreSQL database. Never silently
      // fall back to SQLite because a serverless filesystem is not persistent.
      if (isVercelRuntime && !isPostgresConfigured) {
        const msg = 'DATABASE_URL is missing or is not a PostgreSQL URL. Configure Supabase PostgreSQL in Vercel Environment Variables.';
        db.lastError = msg;
        db.isConnected = false;
        throw new Error(msg);
      }

      if (isPostgresConfigured) {
        try {
          console.log('[LUXORA DB] Attempting PostgreSQL connection...');
          const poolConfig = parsePostgresConfig(rawDbUrl);
          const tempPool = new Pool(poolConfig);

          const client = await tempPool.connect();
          client.release();

          pgPool = tempPool;
          db.engine = 'postgresql';

          await runPostgresMigrations();
          await seedPostgresData();

          db.isConnected = true;
          db.lastError = null;
          console.log('[LUXORA DB] PostgreSQL verified and synchronized successfully.');
          return;
        } catch (err: any) {
          const msg = `PostgreSQL connection failed: ${err.message}`;
          console.error('[LUXORA DB] ' + msg);
          db.lastError = msg;
          if (pgPool) {
            try { await pgPool.end(); } catch {}
            pgPool = null;
          }
          if (isVercelRuntime || process.env.NODE_ENV === 'production') {
            db.isConnected = false;
            throw new Error(msg);
          }
          // Local development may use SQLite when DATABASE_URL is not reachable.
        }
      }

      // Local-development SQLite only. It is intentionally never used on Vercel.
      if (isVercelRuntime) {
        throw new Error('PostgreSQL is required in the Vercel runtime.');
      }

      try {
        db.engine = 'sqlite';
        const sqlite = getSqliteDb();
        runSqliteMigrations(sqlite);
        seedSqliteSync(sqlite);
        db.isConnected = true;
        console.log('[LUXORA DB] SQLite database synchronized and ready (local development).');
      } catch (err: any) {
        const msg = `SQLite initialization error: ${err.message}`;
        console.error('[LUXORA DB] ' + msg);
        db.lastError = msg;
        db.isConnected = false;
        throw new Error(msg);
      }
    })();

    return initPromise;
  },

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    if (!db.isConnected) {
      await db.init();
    }

    if (db.engine === 'postgresql' && pgPool) {
      const pgSql = convertSqlForPostgres(sql);
      const res = await pgPool.query(pgSql, params);
      return res.rows as T[];
    }

    const sqlite = getSqliteDb();
    const stmt = sqlite.prepare(sql);
    return stmt.all(...params) as T[];
  },

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    if (!db.isConnected) {
      await db.init();
    }

    if (db.engine === 'postgresql' && pgPool) {
      const pgSql = convertSqlForPostgres(sql);
      const res = await pgPool.query(pgSql, params);
      return (res.rows[0] as T) || null;
    }

    const sqlite = getSqliteDb();
    const stmt = sqlite.prepare(sql);
    const row = stmt.get(...params);
    return (row as T) || null;
  },

  async execute(sql: string, params: any[] = []): Promise<{ affectedRows: number; lastInsertId?: number | string }> {
    if (!db.isConnected) {
      await db.init();
    }

    if (db.engine === 'postgresql' && pgPool) {
      let pgSql = convertSqlForPostgres(sql);
      if (/^\s*INSERT\s+INTO/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
        pgSql += ' RETURNING id';
      }

      const res = await pgPool.query(pgSql, params);
      const lastInsertId = res.rows.length > 0 && res.rows[0].id ? res.rows[0].id : undefined;
      return {
        affectedRows: res.rowCount || 0,
        lastInsertId
      };
    }

    const sqlite = getSqliteDb();
    const stmt = sqlite.prepare(sql);
    const result = stmt.run(...params);
    return {
      affectedRows: Number(result.changes || 0),
      lastInsertId: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined
    };
  }
};

/**
 * ----------------------------------------------------------------------------
 * PostgreSQL Schema Migrations (Idempotent DDL)
 * ----------------------------------------------------------------------------
 */
async function runPostgresMigrations() {
  if (!pgPool) return;

  const ddl = `
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'editor',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at VARCHAR(100) NOT NULL,
      updated_at VARCHAR(100) NOT NULL,
      last_login_at VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at VARCHAR(100) NOT NULL,
      updated_at VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      subtitle TEXT,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      gender VARCHAR(50) DEFAULT 'unisex',
      collection VARCHAR(255),
      price INTEGER NOT NULL,
      original_price INTEGER,
      discount INTEGER DEFAULT 0,
      primary_image TEXT NOT NULL,
      purchase_url TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      badge VARCHAR(50) DEFAULT 'None',
      is_trending INTEGER NOT NULL DEFAULT 0,
      is_new INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      is_sale INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      stock_status VARCHAR(50) NOT NULL DEFAULT 'In Stock',
      materials TEXT,
      fit_details TEXT,
      shipping_info TEXT,
      sizes TEXT,
      colors TEXT,
      tags TEXT,
      rating NUMERIC DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      reviews TEXT,
      created_at VARCHAR(100) NOT NULL,
      updated_at VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id SERIAL PRIMARY KEY,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id VARCHAR(255) PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      csrf_token VARCHAR(255) NOT NULL,
      ip_address VARCHAR(100),
      user_agent TEXT,
      expires_at VARCHAR(100) NOT NULL,
      created_at VARCHAR(100) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER,
      admin_username VARCHAR(255),
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id VARCHAR(100),
      details TEXT,
      ip_address VARCHAR(100),
      timestamp VARCHAR(100) NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(is_published, status);
    CREATE INDEX IF NOT EXISTS idx_product_images_pid ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_exp ON admin_sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_time ON audit_logs(timestamp);
  `;

  await pgPool.query(ddl);
}

/**
 * ----------------------------------------------------------------------------
 * SQLite Schema Migrations (Idempotent DDL)
 * ----------------------------------------------------------------------------
 */
function runSqliteMigrations(sqlite: any) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'editor',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_login_at TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      subtitle TEXT,
      description TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      gender TEXT DEFAULT 'unisex',
      collection TEXT,
      price INTEGER NOT NULL,
      original_price INTEGER,
      discount INTEGER DEFAULT 0,
      primary_image TEXT NOT NULL,
      purchase_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      badge TEXT DEFAULT 'None',
      is_trending INTEGER NOT NULL DEFAULT 0,
      is_new INTEGER NOT NULL DEFAULT 0,
      is_bestseller INTEGER NOT NULL DEFAULT 0,
      is_sale INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 1,
      stock_status TEXT NOT NULL DEFAULT 'In Stock',
      materials TEXT,
      fit_details TEXT,
      shipping_info TEXT,
      sizes TEXT,
      colors TEXT,
      tags TEXT,
      rating REAL DEFAULT 5.0,
      reviews_count INTEGER DEFAULT 0,
      reviews TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admin_sessions (
      id TEXT PRIMARY KEY,
      admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      csrf_token TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id INTEGER,
      admin_username TEXT,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      timestamp TEXT NOT NULL
    );
  `);
}

/**
 * ----------------------------------------------------------------------------
 * SQLite Seeding (Idempotent: Only on empty tables)
 * ----------------------------------------------------------------------------
 */
function seedSqliteSync(sqlite: any) {
  const now = new Date().toISOString();

  // 1. Admin Provisioning
  const adminRow = sqlite.prepare('SELECT id FROM admins LIMIT 1').get();
  if (!adminRow) {
    const adminUsername = (process.env.ADMIN_USERNAME || '').trim();
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || '';
    const adminRole = (process.env.ADMIN_ROLE || 'super_admin').trim();
    if (!adminUsername || !adminEmail || !initialPassword) {
      throw new Error('ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are required to provision the first administrator.');
    }
    const passwordHash = bcrypt.hashSync(initialPassword, 12);

    sqlite
      .prepare(
        `INSERT INTO admins (username, email, password_hash, role, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 1, ?, ?)`
      )
      .run(adminUsername.toLowerCase(), adminEmail.toLowerCase(), passwordHash, adminRole, now, now);
  }

  // 2. Categories
  const catRows = sqlite.prepare('SELECT id, name FROM categories').all() as { id: number; name: string }[];
  const catMap = new Map<string, number>();

  if (catRows.length === 0) {
    for (const catName of INITIAL_CATEGORIES) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = sqlite
        .prepare(`INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES (?, ?, 'active', ?, ?)`)
        .run(catName, slug, now, now);
      if (res.lastInsertRowid) {
        catMap.set(catName.toLowerCase(), Number(res.lastInsertRowid));
      }
    }
  } else {
    catRows.forEach(c => catMap.set(c.name.toLowerCase(), c.id));
  }

  // 3. Products
  const prodRow = sqlite.prepare('SELECT id FROM products LIMIT 1').get();
  if (!prodRow) {
    for (const item of LUXORA_PRODUCTS) {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const firstCatId = Array.from(catMap.values())[0] || 1;
      const catId = catMap.get(item.category.toLowerCase()) || firstCatId;
      const primaryImage = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85';

      const res = sqlite
        .prepare(
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
          )`
        )
        .run(
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
        );

      const prodDbId = res.lastInsertRowid;
      if (prodDbId && Array.isArray(item.images)) {
        for (let idx = 0; idx < item.images.length; idx++) {
          sqlite
            .prepare(`INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES (?, ?, ?, ?)`)
            .run(prodDbId, item.images[idx], idx, now);
        }
      }
    }
  }
}

/**
 * ----------------------------------------------------------------------------
 * PostgreSQL Seeding (Idempotent: Only on empty tables)
 * ----------------------------------------------------------------------------
 */
async function seedPostgresData() {
  if (!pgPool) return;
  const now = new Date().toISOString();

  // 1. Admin Provisioning
  const adminRows = await pgPool.query('SELECT id FROM admins LIMIT 1');
  if (adminRows.rows.length === 0) {
    const adminUsername = (process.env.ADMIN_USERNAME || '').trim();
    const adminEmail = (process.env.ADMIN_EMAIL || '').trim();
    const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || '';
    const adminRole = (process.env.ADMIN_ROLE || 'super_admin').trim();
    if (!adminUsername || !adminEmail || !initialPassword) {
      throw new Error('ADMIN_USERNAME, ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD are required to provision the first administrator.');
    }
    const passwordHash = bcrypt.hashSync(initialPassword, 12);

    await pgPool.query(
      `INSERT INTO admins (username, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 1, $5, $6)`,
      [adminUsername.toLowerCase(), adminEmail.toLowerCase(), passwordHash, adminRole, now, now]
    );
  }

  // 2. Categories
  const categoryRows = await pgPool.query('SELECT id, name FROM categories');
  const catMap = new Map<string, number>();

  if (categoryRows.rows.length === 0) {
    for (const catName of INITIAL_CATEGORIES) {
      const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const res = await pgPool.query(
        `INSERT INTO categories (name, slug, status, created_at, updated_at) VALUES ($1, $2, 'active', $3, $4) RETURNING id`,
        [catName, slug, now, now]
      );
      if (res.rows[0]?.id) {
        catMap.set(catName.toLowerCase(), Number(res.rows[0].id));
      }
    }
  } else {
    categoryRows.rows.forEach(c => catMap.set(c.name.toLowerCase(), c.id));
  }

  // 3. Products
  const productRows = await pgPool.query('SELECT id FROM products LIMIT 1');
  if (productRows.rows.length === 0) {
    for (const item of LUXORA_PRODUCTS) {
      const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const firstCatId = Array.from(catMap.values())[0] || 1;
      const catId = catMap.get(item.category.toLowerCase()) || firstCatId;
      const primaryImage = item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85';

      const insertRes = await pgPool.query(
        `INSERT INTO products (
          product_id, name, slug, subtitle, description, category_id, gender,
          collection, price, original_price, discount, primary_image, purchase_url,
          status, badge, is_trending, is_new, is_bestseller, is_sale, is_published,
          stock_status, materials, fit_details, shipping_info, sizes, colors, tags,
          rating, reviews_count, reviews, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, $10, $11, $12, $13,
          'active', $14, $15, $16, $17, $18, 1,
          $19, $20, $21, $22, $23, $24, $25,
          $26, $27, $28, $29, $30
        ) RETURNING id`,
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

      const createdProdId = insertRes.rows[0]?.id;
      if (createdProdId && Array.isArray(item.images)) {
        for (let idx = 0; idx < item.images.length; idx++) {
          await pgPool.query(
            `INSERT INTO product_images (product_id, image_url, sort_order, created_at) VALUES ($1, $2, $3, $4)`,
            [createdProdId, item.images[idx], idx, now]
          );
        }
      }
    }
  }
}

export function initDatabase() {
  return db.init();
}
