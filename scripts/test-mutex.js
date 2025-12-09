const axios = require('axios');

const BASE_URL = 'http://localhost';

async function testMutex() {
  console.log('🧪 Testing Distributed Mutual Exclusion');
  console.log('========================================\n');

  try {
    // Process 0 solicita acesso
    console.log('🔒 Process 0 requests critical section...');
    await axios.post(`${BASE_URL}:3000/mutex/request-access`);
    console.log('✅ Requested\n');

    await sleep(2000);

    // Process 1 solicita acesso
    console.log('🔒 Process 1 requests critical section...');
    await axios.post(`${BASE_URL}:3001/mutex/request-access`);
    console.log('✅ Requested\n');

    await sleep(3000);

    // Process 0 libera
    console.log('🔓 Process 0 releases critical section...');
    await axios.post(`${BASE_URL}:3000/mutex/release`);
    console.log('✅ Released\n');

    await sleep(2000);

    // Process 1 libera
    console.log('🔓 Process 1 releases critical section...');
    await axios.post(`${BASE_URL}:3001/mutex/release`);
    console.log('✅ Released\n');

    await sleep(1000);

    // Ver status
    console.log('📋 Final status:\n');
    
    const status0 = await axios.get(`${BASE_URL}:3000/mutex/status`);
    console.log('Process 0:', JSON.stringify(status0.data, null, 2));
    
    const status1 = await axios.get(`${BASE_URL}:3001/mutex/status`);
    console.log('Process 1:', JSON.stringify(status1.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testMutex();
