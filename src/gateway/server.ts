import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import { runAgent } from '../agent/agent.js';
import { createExecutor, type PendingApproval } from '../agent/executor.js';
import { ConfigService } from '../services/config-service.js';
import { ObsidianService } from '../services/obsidian-service.js';
import { TrelloService } from '../services/trello-service.js';

interface TelegramUpdate {
  message?: {
    text?: string;
    chat: {
      id: number;
    };
  };
}
const myMap = new Map<number, PendingApproval>();

const config = new ConfigService();
const defaults = config.getConfig();
if (!defaults.success) {
  console.error('Defaults not set');
  process.exit(1);
}
const trellodefaultlist = defaults.data.trello?.defaultInboxListId;
const obsidiandefault = defaults.data.obsidian?.defaultVaultPath;

if (!obsidiandefault) {
  console.error('Default Vault path not set');
  process.exit(1);
}
if (trellodefaultlist === undefined) {
  console.error('Default Trello Board not set');
  process.exit(1);
}
if (!process.env.TELEGRAM_WEBHOOK_SECRET) {
  console.error('TELEGRAM_WEBHOOK_SECRET not set');
  process.exit(1);
}
if (!process.env.TRELLO_API_KEY || !process.env.TRELLO_TOKEN) {
  console.error('TRELLO CONFIG NOT SET');
  process.exit(1);
}
if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC KEY NOT SET');
  process.exit(1);
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('TELEGRAM BOT TOKEN NOT SET');
  process.exit(1);
}

const trello = new TrelloService(process.env.TRELLO_API_KEY, process.env.TRELLO_TOKEN);
const obsidian = new ObsidianService(obsidiandefault);
const defaultListId = trellodefaultlist;

async function sendReply(chatId: number, text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

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

async function handleMessage(chatID: number, text: string): Promise<void> {
  const pending = myMap.get(chatID);

  if (pending) {
    myMap.delete(chatID);

    if (text.toLowerCase() === 'yes') {
      const result = await trello.archiveCard(pending.cardId);
      if (!result.success) {
        await sendReply(chatID, `Archive failed: ${result.error.message}`);
        return;
      }
      await sendReply(chatID, 'Card Archived!');
      return;
    }

    if (text.toLowerCase() === 'no') {
      await sendReply(chatID, 'Cancelled');
      return;
    }
    // User said something else — fall through to normal agent
  }

  const deps = {
    trello,
    obsidian,
    defaultListId,
    setPendingApproval: (approval: PendingApproval) => myMap.set(chatID, approval),
  };

  const executeTool = createExecutor(deps);
  const result = await runAgent(text, executeTool);

  if (!result.success) {
    await sendReply(chatID, 'Something went wrong.  Try again');
    console.error('Agent error:', result.error.message);
    return;
  }

  await sendReply(chatID, result.data);
}

const app = express();

// Express doesn't parse JSON request ßßbodies by default.
// This middleware reads the raw POST body and parses it into req.body as an object.
// Telegram sends webhook data as JSON, so we need this.

app.use(express.json());

// This is a "route handler" — it says: when a POST request hits /webhook,
// run this function. req = the incoming request, res = what we send back.

app.post('/webhook', (req: Request, res: Response) => {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const header = req.headers['x-telegram-bot-api-secret-token'];

  if (header !== secret) {
    res.sendStatus(401);
    return;
  }
  const update = req.body as TelegramUpdate;

  if (update.message?.text && update.message.chat.id) {
    const chatId = update.message.chat.id;
    const text = update.message.text;
    console.log(`[${new Date().toISOString()}] ${text}`);
    handleMessage(chatId, text).catch((err) => console.error('handlemessage error', err));
  }

  res.sendStatus(200);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Gateway listening on port ${PORT}`);
});
