const { getDatabase, initDatabase } = require('./db');

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

      const { orderData, paymentMethod } = JSON.parse(event.body);

      // Generate order ID
      const orderId = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      // Calculate total
      const totalAmount = orderData.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);

      // Save order to database
      const order = await sql`
        INSERT INTO orders (
          order_id, customer_email, products, total_amount, status
        ) VALUES (
          ${orderId},
          ${orderData.customerEmail},
          ${JSON.stringify(orderData.items)},
          ${totalAmount},
          'completed'
        ) RETURNING *
      `;

      // In a real implementation, you would integrate with Verifone/Stripe here
      // For demo purposes, we'll simulate successful payment

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          orderId: order[0].order_id,
          paymentStatus: 'completed',
          downloadUrl: `/payment-success.html?order=${orderId}`
        })
      };

    } catch (error) {
      console.error('Payment processing error:', error);
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

// In the payment function, after successful payment
return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
        success: true,
        orderId: order[0].order_id,
        paymentStatus: 'completed',
        downloadUrl: `/payment-success.html?order=${orderId}`,
        message: 'Payment processed successfully'
    })
};