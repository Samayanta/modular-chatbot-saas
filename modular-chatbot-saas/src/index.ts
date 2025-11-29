import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.send('modular-chatbot-saas — development server');
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
