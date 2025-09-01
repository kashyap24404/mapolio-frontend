const { default: fetch } = require('node-fetch');

async function testPayPalAPI() {
  try {
    console.log('Testing PayPal API route...');
    
    const response = await fetch('http://localhost:3000/api/checkout/paypal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ creditsToPurchase: 1000 })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error testing PayPal API:', error);
  }
}

testPayPalAPI();