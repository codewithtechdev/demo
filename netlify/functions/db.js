const { neon } = require('@neondatabase/serverless');

// Create a reusable database connection
let sql;

function getDatabase() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    sql = neon(connectionString);
  }
  return sql;
}

// Initialize database tables
async function initDatabase() {
  const sql = getDatabase();
  
  try {
    // Products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) DEFAULT 0,
        main_category VARCHAR(50) NOT NULL,
        sub_category VARCHAR(50) NOT NULL,
        icon VARCHAR(100) DEFAULT 'fas fa-code',
        has_live_demo BOOLEAN DEFAULT false,
        live_demo_url VARCHAR(500),
        images JSONB DEFAULT '[]',
        videos JSONB DEFAULT '[]',
        documents JSONB DEFAULT '[]',
        source_files JSONB DEFAULT '[]',
        features JSONB DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(100) UNIQUE NOT NULL,
        customer_email VARCHAR(255) NOT NULL,
        products JSONB NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_intent_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Admin settings table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        admin_password_hash VARCHAR(255) NOT NULL,
        stripe_secret_key VARCHAR(255),
        verifone_merchant_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default admin password if not exists
    const existingSettings = await sql`SELECT * FROM admin_settings LIMIT 1`;
    if (existingSettings.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('Setu6767@#$', 12);
      await sql`
        INSERT INTO admin_settings (admin_password_hash) 
        VALUES (${hashedPassword})
      `;
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

module.exports = { getDatabase, initDatabase };
