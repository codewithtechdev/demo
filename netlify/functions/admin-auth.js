const { getDatabase, initDatabase } = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      await initDatabase();
      const sql = getDatabase();

      const { password } = JSON.parse(event.body);

      // Get admin password hash from database
      const settings = await sql`SELECT admin_password_hash FROM admin_settings LIMIT 1`;
      
      if (settings.length === 0) {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ success: false, error: 'Admin not configured' })
        };
      }

      const isValid = await bcrypt.compare(password, settings[0].admin_password_hash);

      if (isValid) {
        const token = jwt.sign(
          { role: 'admin', timestamp: Date.now() },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            success: true, 
            token,
            message: 'Login successful' 
          })
        };
      } else {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ success: false, error: 'Invalid password' })
        };
      }
    } catch (error) {
      console.error('Admin auth error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: error.message })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ success: false, error: 'Method not allowed' })
  };
};

// Helper function to verify admin token
async function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
}

module.exports.verifyAdminToken = verifyAdminToken;