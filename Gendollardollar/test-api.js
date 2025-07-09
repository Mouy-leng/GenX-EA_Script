
#!/usr/bin/env node

const baseUrl = 'http://localhost:5000';

async function testEndpoint(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    console.log('📋 Response:', JSON.stringify(data, null, 2));
    console.log('---');
    
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    console.log('---');
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🧪 Starting API tests...\n');
  
  const tests = [
    { endpoint: '/health' },
    { endpoint: '/api/test' },
    { endpoint: '/api/db-health' },
    { endpoint: '/api/stats' },
    { endpoint: '/api/educational-resources' },
    { endpoint: '/api/trading-accounts' },
    { endpoint: '/api/positions' },
    { endpoint: '/api/notifications' }
  ];
  
  for (const test of tests) {
    await testEndpoint(test.endpoint, test.method, test.body);
    await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
  }
  
  console.log('🏁 Tests completed!');
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { testEndpoint, runTests };
