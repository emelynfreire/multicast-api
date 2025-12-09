const axios = require('axios');

const BASE_URL = 'http://localhost';

async function testElection() {
  console.log('🧪 Testing Leader Election (Bully Algorithm)');
  console.log('============================================\n');

  try {
    // Process 0 inicia eleição
    console.log('🗳️  Process 0 starts election...');
    await axios.post(`${BASE_URL}:3000/election/start`);
    console.log('✅ Election started\n');

    await sleep(5000);

    // Ver resultados
    console.log('📋 Election results:\n');
    
    const status0 = await axios.get(`${BASE_URL}:3000/election/status`);
    console.log('Process 0:', JSON.stringify(status0.data, null, 2));
    console.log();
    
    const status1 = await axios.get(`${BASE_URL}:3001/election/status`);
    console.log('Process 1:', JSON.stringify(status1.data, null, 2));
    console.log();
    
    const status2 = await axios.get(`${BASE_URL}:3002/election/status`);
    console.log('Process 2:', JSON.stringify(status2.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testElection();
