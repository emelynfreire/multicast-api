const axios = require('axios');

const BASE_URL = 'http://localhost';

async function testMulticast() {
  console.log('🧪 Testing Multicast with Total Ordering');
  console.log('=========================================\n');

  try {
    // Enviar mensagem do Process 0
    console.log('📤 Process 0 sends message 1...');
    await axios.post(`${BASE_URL}:3000/multicast/send`, {
      content: 'Message 1 from Process 0'
    });
    console.log('✅ Sent\n');

    await sleep(2000);

    // Enviar mensagem do Process 1
    console.log('📤 Process 1 sends message 2...');
    await axios.post(`${BASE_URL}:3001/multicast/send`, {
      content: 'Message 2 from Process 1'
    });
    console.log('✅ Sent\n');

    await sleep(2000);

    // Enviar mensagem do Process 2
    console.log('📤 Process 2 sends message 3...');
    await axios.post(`${BASE_URL}:3002/multicast/send`, {
      content: 'Message 3 from Process 2'
    });
    console.log('✅ Sent\n');

    await sleep(3000);

    // Verificar filas
    console.log('📋 Checking message queues:\n');
    
    console.log('Process 0:');
    const queue0 = await axios.get(`${BASE_URL}:3000/multicast/queue`);
    console.log(JSON.stringify(queue0.data, null, 2));
    console.log();

    console.log('Process 1:');
    const queue1 = await axios.get(`${BASE_URL}:3001/multicast/queue`);
    console.log(JSON.stringify(queue1.data, null, 2));
    console.log();

    console.log('Process 2:');
    const queue2 = await axios.get(`${BASE_URL}:3002/multicast/queue`);
    console.log(JSON.stringify(queue2.data, null, 2));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testMulticast();
