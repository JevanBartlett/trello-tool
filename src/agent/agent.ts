import Anthropic from '@anthropic-ai/sdk';
import type { Result } from '../types/result.js';
import { tools } from './tools.js';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const MAX_ITERATIONS: number = 10;
const model = 'claude-haiku-4-5-20251001';

function buildSystemPrompt(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const today = `${year}-${month}-${day}`;
  return `You are a personal assistant that helps capture and organize tasks, notes, and information.
You have access to tools for managing Trello cards and Obsidian notes.

When the user sends informal input:
- If it's actionable → use create_task
- If it's informational → use append_note
- If it requires multiple steps → call tools in sequence
- If ambiguous → default to append_note

The user is texting quickly from their phone during meetings. Input will be informal.
Clean up the content before creating tasks or notes.

Resolve relative dates: "thursday" means the next upcoming Thursday.
Today is ${today}.

Always confirm what you did in a brief, friendly reply.`;
}

export async function runAgent(
  userMessage: string,
  executeTool: (name: string, input: Record<string, unknown>) => Promise<string>,
): Promise<Result<string>> {
  const messages: Anthropic.MessageParam[] = [{ role: 'user', content: userMessage }];

  let iterations: number = 0;
  let totalInputTokens: number = 0;
  let totalOutputTokens: number = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    let response: Anthropic.Message;

    try {
      response = await client.messages.create({
        model: model,
        max_tokens: 1024,
        system: buildSystemPrompt(),
        tools: tools,
        messages: messages,
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

    totalInputTokens += response.usage.input_tokens;
    totalOutputTokens += response.usage.output_tokens;

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      const textBlocks = response.content.filter((block) => block.type === 'text');

      const reply = textBlocks.map((block) => block.text).join('\n');

      console.log(
        `[agent] done in ${iterations} interation(s) | input: ${totalInputTokens} tokens, output: ${totalOutputTokens}`,
      );

      return {
        success: true,
        data: reply || "Done, but I didn't have anything to say.",
      };
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter((block) => block.type === 'tool_use');

      const toolResults: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        console.log(`[agent] tool call: ${toolUse.name}`, toolUse.input);

        const result = await executeTool(toolUse.name, toolUse.input as Record<string, unknown>);

        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: result,
        });
      }

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    return {
      success: false,
      error: {
        code: 'AGENT_ERROR',
        message: `Unexpected stop reason: ${response.stop_reason}`,
      },
    };
  }
  console.log(
    `[agent] hit interation limit (${MAX_ITERATIONS}) | input: ${totalInputTokens} tokens, output: ${totalOutputTokens}tokens`,
  );

  return {
    success: false,
    error: {
      code: 'AGENT_LOOP_LIMIT',
      message: `Agent hit iteration limits (${MAX_ITERATIONS}.  Something might be stuck)`,
    },
  };
}
