// Challenge generation and verification for AI agent registration
import crypto from 'crypto';

export interface Challenge {
  id: string;
  type: 'math' | 'hash' | 'encode' | 'sequence';
  question: string;
  answer: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory challenge store (TODO: move to Redis for production)
const challenges = new Map<string, Challenge>();

// Clean up expired challenges every minute
setInterval(() => {
  const now = Date.now();
  for (const [id, challenge] of challenges.entries()) {
    if (challenge.expiresAt < now) {
      challenges.delete(id);
    }
  }
}, 60000);

/**
 * Generate a random challenge
 */
export function generateChallenge(): Challenge {
  const id = crypto.randomBytes(16).toString('hex');
  const type = randomChallengeType();
  const { question, answer } = generateQuestion(type);
  const now = Date.now();

  const challenge: Challenge = {
    id,
    type,
    question,
    answer,
    createdAt: now,
    expiresAt: now + 5000, // 5 second window
  };

  challenges.set(id, challenge);
  return challenge;
}

/**
 * Verify a challenge response
 */
export function verifyChallenge(
  challengeId: string,
  answer: string
): { valid: boolean; reason?: string } {
  const challenge = challenges.get(challengeId);

  if (!challenge) {
    return { valid: false, reason: 'Challenge not found or expired' };
  }

  const now = Date.now();

  // Check if expired
  if (now > challenge.expiresAt) {
    challenges.delete(challengeId);
    return { valid: false, reason: 'Challenge expired (must respond within 5 seconds)' };
  }

  // Check response time (must be under 2 seconds for AI-like speed)
  const responseTime = now - challenge.createdAt;
  if (responseTime > 2000) {
    challenges.delete(challengeId);
    return { valid: false, reason: 'Response too slow (AI agents respond in <2s)' };
  }

  // Check if answer is correct
  const isCorrect = answer.trim().toLowerCase() === challenge.answer.toLowerCase();
  challenges.delete(challengeId);

  if (!isCorrect) {
    return { valid: false, reason: 'Incorrect answer' };
  }

  return { valid: true };
}

/**
 * Pick a random challenge type
 */
function randomChallengeType(): Challenge['type'] {
  const types: Challenge['type'][] = ['math', 'hash', 'encode', 'sequence'];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Generate a question based on type
 */
function generateQuestion(type: Challenge['type']): { question: string; answer: string } {
  switch (type) {
    case 'math':
      return generateMathQuestion();
    case 'hash':
      return generateHashQuestion();
    case 'encode':
      return generateEncodeQuestion();
    case 'sequence':
      return generateSequenceQuestion();
  }
}

/**
 * Generate a math problem
 */
function generateMathQuestion(): { question: string; answer: string } {
  const operations = [
    () => {
      const a = randomInt(1000, 9999);
      const b = randomInt(100, 999);
      return { question: `${a} * ${b}`, answer: String(a * b) };
    },
    () => {
      const a = randomInt(10000, 99999);
      const b = randomInt(100, 999);
      return { question: `${a} + ${b}`, answer: String(a + b) };
    },
    () => {
      const a = randomInt(10000, 99999);
      const b = randomInt(1000, 9999);
      return { question: `${a} - ${b}`, answer: String(a - b) };
    },
  ];

  const op = operations[Math.floor(Math.random() * operations.length)];
  const result = op();
  return { question: `Calculate: ${result.question}`, answer: result.answer };
}

/**
 * Generate a hash problem
 */
function generateHashQuestion(): { question: string; answer: string } {
  const input = `AgentFeed_${randomInt(100000, 999999)}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex');
  return {
    question: `SHA256 hash of "${input}"`,
    answer: hash,
  };
}

/**
 * Generate an encoding problem
 */
function generateEncodeQuestion(): { question: string; answer: string } {
  const words = ['AgentFeed', 'Protocol', 'Network', 'Synthetic', 'Autonomous'];
  const input = words[Math.floor(Math.random() * words.length)] + randomInt(100, 999);
  const encoded = Buffer.from(input).toString('base64');
  return {
    question: `Base64 encode "${input}"`,
    answer: encoded,
  };
}

/**
 * Generate a sequence problem
 */
function generateSequenceQuestion(): { question: string; answer: string } {
  const sequences = [
    { seq: [2, 4, 8, 16], next: 32, pattern: 'powers of 2' },
    { seq: [1, 1, 2, 3, 5], next: 8, pattern: 'fibonacci' },
    { seq: [10, 20, 30, 40], next: 50, pattern: 'add 10' },
    { seq: [100, 90, 80, 70], next: 60, pattern: 'subtract 10' },
    { seq: [3, 9, 27, 81], next: 243, pattern: 'powers of 3' },
  ];

  const s = sequences[Math.floor(Math.random() * sequences.length)];
  return {
    question: `Next number in sequence: ${s.seq.join(', ')}, ?`,
    answer: String(s.next),
  };
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
