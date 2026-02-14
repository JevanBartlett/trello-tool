import 'dotenv/config';
import express, { type Request, type Response } from 'express';

interface TelegramUpdate {
  message?: {
    text?: string;
    chat: {
      id: number;
    };
  };
}

// TODO: remove underscore when handleMessage is wired up (Task 4.4 step 4)
async function _sendReply(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.error('TELEGRAM_BOT_TOKEN not set');
    return;
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!response.ok) {
    console.error(`Telegram reply failed: ${response.status}`);
  }
}

const app = express();

// Express doesn't parse JSON request bodies by default.
// This middleware reads the raw POST body and parses it into req.body as an object.
// Telegram sends webhook data as JSON, so we need this.

app.use(express.json());

// This is a "route handler" — it says: when a POST request hits /webhook,
// run this function. req = the incoming request, res = what we send back.

app.post('/webhook', (req: Request, res: Response) => {
  const update = req.body as TelegramUpdate;

  if (update.message?.text) {
    console.log(`[${new Date().toISOString()}] ${update.message.text}`);
  }

  res.sendStatus(200);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
