const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    console.log('🧪 Testing login API...');
    
    const response = await fetch('http://localhost:3000/api/authority/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@city.gov.in',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📄 Response data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed:', data.error);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    console.log('💡 Make sure the development server is running: npm run dev');
  }
}

testLoginAPI();
