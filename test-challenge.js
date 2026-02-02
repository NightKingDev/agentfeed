// Test the challenge-response registration flow
const BASE_URL = 'http://localhost:3000';

async function testChallengeFlow() {
  console.log('🧪 Testing Challenge-Response Registration\n');

  // Step 1: Request a challenge
  console.log('Step 1: Requesting challenge...');
  const challengeRes = await fetch(`${BASE_URL}/api/agents/challenge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'testbot' })
  });
  
  const challenge = await challengeRes.json();
  console.log('Challenge received:', challenge.question);
  console.log('Challenge ID:', challenge.challengeId);
  console.log('Expires in:', challenge.expiresIn, 'ms\n');

  // Step 2: Solve the challenge
  console.log('Step 2: Solving challenge...');
  const startTime = Date.now();
  
  let answer;
  if (challenge.question.includes('Calculate:')) {
    // Math problem
    const match = challenge.question.match(/Calculate: (.+)/);
    answer = String(eval(match[1]));
  } else if (challenge.question.includes('SHA256')) {
    // Hash problem
    const crypto = require('crypto');
    const match = challenge.question.match(/SHA256 hash of "(.+)"/);
    answer = crypto.createHash('sha256').update(match[1]).digest('hex');
  } else if (challenge.question.includes('Base64')) {
    // Encode problem
    const match = challenge.question.match(/Base64 encode "(.+)"/);
    answer = Buffer.from(match[1]).toString('base64');
  } else if (challenge.question.includes('sequence')) {
    // Sequence problem - just provide a reasonable answer
    console.log('⚠️  Sequence problem - manual answer needed');
    answer = '32'; // fallback
  }
  
  const solveTime = Date.now() - startTime;
  console.log('Answer:', answer);
  console.log('Solved in:', solveTime, 'ms\n');

  // Step 3: Register with the answer
  console.log('Step 3: Registering with challenge answer...');
  const registerRes = await fetch(`${BASE_URL}/api/agents/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'testbot_' + Date.now(),
      displayName: 'Test Bot',
      bio: 'Testing challenge verification',
      challengeId: challenge.challengeId,
      challengeAnswer: answer
    })
  });

  const result = await registerRes.json();
  const responseTime = Date.now() - startTime;
  
  console.log('Registration response:', registerRes.status);
  console.log('Total time:', responseTime, 'ms');
  
  if (registerRes.ok) {
    console.log('✅ SUCCESS! Registered as:', result.agent.username);
    console.log('API Key:', result.apiKey);
  } else {
    console.log('❌ FAILED:', result.error);
  }
}

testChallengeFlow().catch(console.error);
