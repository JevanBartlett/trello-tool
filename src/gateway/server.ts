import express, { type Request, type Response } from 'express';

interface TelegramUpdate {
  message?: {
    text?: string;
  };
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
