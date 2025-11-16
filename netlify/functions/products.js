const { getDatabase, initDatabase } = require('./db');

exports.handler = async (event, context) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    await initDatabase();
    const sql = getDatabase();

    // GET - Fetch products
    if (event.httpMethod === 'GET') {
      const { category, id } = event.queryStringParameters || {};
      
      let products;
      if (id) {
        // Get single product
        products = await sql`
          SELECT * FROM products 
          WHERE id = ${id} AND is_active = true
        `;
      } else if (category) {
        // Get products by category
        products = await sql`
          SELECT * FROM products 
          WHERE main_category = ${category} AND is_active = true
          ORDER BY created_at DESC
        `;
      } else {
        // Get all products
        products = await sql`
          SELECT * FROM products 
          WHERE is_active = true 
          ORDER BY created_at DESC
        `;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: products })
      };
    }

    // POST - Create product (Admin only)
    if (event.httpMethod === 'POST') {
      // Verify admin authentication
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Unauthorized' })
        };
      }

      const token = authHeader.substring(7);
      const { verifyAdminToken } = require('./admin-auth');
      const isValid = await verifyAdminToken(token);
      
      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid token' })
        };
      }

      const productData = JSON.parse(event.body);
      
      const result = await sql`
        INSERT INTO products (
          title, description, price, main_category, sub_category, 
          icon, has_live_demo, live_demo_url, images, videos, 
          documents, source_files, features
        ) VALUES (
          ${productData.title},
          ${productData.description},
          ${productData.price || 0},
          ${productData.main_category},
          ${productData.sub_category},
          ${productData.icon || 'fas fa-code'},
          ${productData.has_live_demo || false},
          ${productData.live_demo_url || ''},
          ${JSON.stringify(productData.images || [])},
          ${JSON.stringify(productData.videos || [])},
          ${JSON.stringify(productData.documents || [])},
          ${JSON.stringify(productData.source_files || [])},
          ${JSON.stringify(productData.features || [])}
        ) RETURNING *
      `;

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, data: result[0] })
      };
    }

    // PUT - Update product (Admin only)
    if (event.httpMethod === 'PUT') {
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Unauthorized' })
        };
      }

      const token = authHeader.substring(7);
      const { verifyAdminToken } = require('./admin-auth');
      const isValid = await verifyAdminToken(token);
      
      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid token' })
        };
      }

      const { id, ...updates } = JSON.parse(event.body);
      
      const result = await sql`
        UPDATE products 
        SET 
          title = ${updates.title},
          description = ${updates.description},
          price = ${updates.price},
          main_category = ${updates.main_category},
          sub_category = ${updates.sub_category},
          icon = ${updates.icon},
          has_live_demo = ${updates.has_live_demo},
          live_demo_url = ${updates.live_demo_url},
          images = ${JSON.stringify(updates.images || [])},
          videos = ${JSON.stringify(updates.videos || [])},
          documents = ${JSON.stringify(updates.documents || [])},
          source_files = ${JSON.stringify(updates.source_files || [])},
          features = ${JSON.stringify(updates.features || [])},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING *
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, data: result[0] })
      };
    }

    // DELETE - Delete product (Admin only)
    if (event.httpMethod === 'DELETE') {
      const authHeader = event.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Unauthorized' })
        };
      }

      const token = authHeader.substring(7);
      const { verifyAdminToken } = require('./admin-auth');
      const isValid = await verifyAdminToken(token);
      
      if (!isValid) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid token' })
        };
      }

      const { id } = JSON.parse(event.body);
      
      await sql`
        UPDATE products 
        SET is_active = false 
        WHERE id = ${id}
      `;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Product deleted' })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Products API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};