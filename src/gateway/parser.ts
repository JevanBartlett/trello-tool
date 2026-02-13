import Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import type { Result } from '../types/result.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export const parsedMessageSchema = z.object({
  type: z.enum(['task', 'note', 'unknown']),
  content: z.string(),
  dueDate: z.string().nullable().optional(),
});

export type ParsedMessage = z.infer<typeof parsedMessageSchema>;

const SYSTEM_PROMPT = `You are a message parser. You receive short, informal messages and classify them.

Determine:
1. Type: "task" (something to do), "note" (something to remember), or "unknown"
2. Content: clean up the message into a readable sentence
3. Due date: extract if mentioned (e.g. "thursday", "tomorrow", "feb 15")

Rules:
- When ambiguous, default to "note"
- Return ONLY valid JSON, no extra text

Examples:
Input: "nancy thursday uat"
Output: {"type": "task", "content": "follow up with Nancy about UAT", "dueDate": "thursday"}

Input: "routing broken again check with dev"
Output: {"type": "note", "content": "routing issue resurfaced, check with dev team"}

Input: "mom birthday gift"
Output: {"type": "task", "content": "get birthday gift for mom"}

Input: "quarterly numbers look off"
Output: {"type": "note", "content": "quarterly numbers look off"}`;
function stripCodeBlock(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

export async function parseMessage(text: string): Promise<Result<ParsedMessage>> {
  let response: Anthropic.Message;

  try {
    response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    });
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to Anthropic API',
      },
    };
  }

  console.log(
    `[tokens] input: ${response.usage.input_tokens}, output: ${response.usage.output_tokens}`,
  );

  const textBlock = response.content[0];
  if (textBlock.type !== 'text') {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: 'Unexpected response format from Anthropic API',
      },
    };
  }

  let data: unknown;
  let cleaned: string;
  try {
    cleaned = stripCodeBlock(textBlock.text);
    data = JSON.parse(cleaned);
  } catch {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Claude returned invalid JSON',
      },
    };
  }

  const parsed = parsedMessageSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid response structure from Anthropic API',
      },
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
