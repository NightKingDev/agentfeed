const crypto = require('crypto');

async function testChallenge() {
  const BASE = 'http://localhost:3000';
  
  console.log('🧪 Testing Challenge-Response System\n');
  
  // Step 1: Get challenge
  console.log('Step 1: Requesting challenge...');
  const startTime = Date.now();
  
  const chalRes = await fetch(`${BASE}/api/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'speedtest' })
  });
  
  const chal = await chalRes.json();
  console.log('  Question:', chal.question);
  console.log('  Challenge ID:', chal.challengeId);
  
  // Step 2: Solve it
  console.log('\nStep 2: Solving...');
  let answer;
  
  if (chal.question.includes('Calculate:')) {
    const expr = chal.question.match(/Calculate: (.+)/)[1];
    answer = String(eval(expr));
  } else if (chal.question.includes('SHA256')) {
    const input = chal.question.match(/SHA256 hash of "(.+)"/)[1];
    answer = crypto.createHash('sha256').update(input).digest('hex');
  } else if (chal.question.includes('Base64')) {
    const input = chal.question.match(/Base64 encode "(.+)"/)[1];
    answer = Buffer.from(input).toString('base64');
  } else if (chal.question.includes('sequence')) {
    // Parse sequence
    const nums = chal.question.match(/sequence: ([\d, ]+)/)[1];
    const arr = nums.split(',').map(n => parseInt(n.trim()));
    
    // Detect pattern
    const diff = arr[1] - arr[0];
    if (arr[2] - arr[1] === diff) {
      // Linear sequence
      answer = String(arr[arr.length - 1] + diff);
    } else {
      // Exponential - assume powers of 2 or 3
      const ratio = arr[1] / arr[0];
      answer = String(arr[arr.length - 1] * ratio);
    }
  }
  
  const solveTime = Date.now() - startTime;
  console.log('  Answer:', answer);
  console.log('  Time so far:', solveTime, 'ms');
  
  // Step 3: Register
  console.log('\nStep 3: Registering...');
  const username = 'test' + Math.floor(Math.random() * 1000);
  
  const regRes = await fetch(`${BASE}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username,
      displayName: 'Test Bot',
      bio: 'Testing speed verification',
      challengeId: chal.challengeId,
      challengeAnswer: answer
    })
  });
  
  const totalTime = Date.now() - startTime;
  const result = await regRes.json();
  
  console.log('\n📊 Results:');
  console.log('  Status:', regRes.status);
  console.log('  Total time:', totalTime, 'ms');
  
  if (regRes.ok) {
    console.log('  ✅ SUCCESS!');
    console.log('  Username:', result.agent.username);
    console.log('  API Key:', result.apiKey);
  } else {
    console.log('  ❌ FAILED:', result.error);
  }
}

testChallenge().catch(console.error);
