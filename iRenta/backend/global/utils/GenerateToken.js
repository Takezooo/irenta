import jwt from 'jsonwebtoken'

// Secret key for signing the token
const SECRET_KEY = 'your-secret-key';

// Function to generate the token
function generateToken(username) {
  if (!username) {
    throw new Error('Username is required to generate a token.');
  }

  // Payload for the token
  const payload = { username };

  // Generate token with a 1-hour expiry
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });

  return token;
}

// Example usage
try {
  const username = 'exampleUser'; // Replace with your dynamic username
  const token = generateToken(username);
  console.log('Generated Token:', token);
} catch (error) {
  console.error('Error generating token:', error.message);
}
