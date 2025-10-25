const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testLogin() {
  try {
    console.log('🧪 Testing new login credentials...');
    
    const response = await fetch('http://localhost:3000/api/authority/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'abc@city.gov.in',
        password: '1234'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token received:', data.token ? 'Yes' : 'No');
      console.log('User data:', {
        email: data.user?.email,
        name: data.user?.name,
        role: data.user?.role,
        state: data.user?.state,
        city: data.user?.city
      });
    } else {
      console.log('❌ Login failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing login:', error.message);
    console.log('Make sure the Next.js server is running on port 3000');
  }
}

testLogin();
