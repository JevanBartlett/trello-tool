import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import type { ParsedMessage } from '../gateway/parser.js';
import { parseMessage } from '../gateway/parser.js';
import { ConfigService } from '../services/config-service.js';
import { ObsidianService } from '../services/obsidian-service.js';
import { TrelloService } from '../services/trello-service.js';
import type { Result } from '../types/result.js';

interface TelegramUpdate {
  message?: {
    text?: string;
    chat: {
      id: number;
    };
  };
}
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

async function handleMessage(chatID: number, text: string): Promise<Result<ParsedMessage>> {
  const parsedResult = await parseMessage(text);

  if (!parsedResult.success) {
    await sendReply(chatID, 'This message is cactus, mate');
    return {
      success: false,
      error: {
        code: parsedResult.error.code,
        message: parsedResult.error.message,
      },
    };
  }
  const safeData = parsedResult.data;

  switch (safeData.type) {
    case 'task':
      await trello.createCard(
        trellodefaultlist!,
        safeData.content,
        undefined,
        safeData.dueDate ?? undefined,
      );
      await sendReply(chatID, `✓ task: ${safeData.content}`);
      break;
    case 'note':
      await obsidian.appendToDaily(safeData.content);
      await sendReply(chatID, `✓ note added to daily`);
      break;
    case 'unknown':
      await sendReply(chatID, 'Claude could not classify message as note or task');
      return {
        success: false,
        error: {
          code: 'UNKNOWN_TYPE',
          message: 'Could not classify message',
        },
      };
  }

  return {
    success: true,
    data: safeData,
  };
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
