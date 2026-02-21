import {
  AppendNoteInput,
  ArchiveCardInput,
  CreateTaskInput,
  GetCardsInput,
  GetListsInput,
  MoveCardInput,
  SearchNotesInput,
  SetDueDateInput,
} from '../agent/tools.js';
import { ObsidianService } from '../services/obsidian-service.js';
import { TrelloService } from '../services/trello-service.js';

export interface ExecutorDeps {
  trello: TrelloService;
  obsidian: ObsidianService;
  defaultListId: string;
  setPendingApproval: (approval: PendingApproval) => void;
}

export type ExecutorResult =
  | { status: 'success'; message: string }
  | { status: 'confirmation_required'; message: string };

export interface PendingApproval {
  toolName: string;
  cardId: string;
  description: string;
}

export function createExecutor(
  deps: ExecutorDeps,
): (name: string, input: Record<string, unknown>) => Promise<ExecutorResult> {
  return async function executeTool(
    name: string,
    input: Record<string, unknown>,
  ): Promise<ExecutorResult> {
    switch (name) {
      case 'create_task': {
        const parsed = CreateTaskInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.trello.createCard(
          parsed.data.list_id ?? deps.defaultListId,
          parsed.data.name,
          parsed.data.desc,
          parsed.data.due,
        );
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return {
          status: 'success',
          message: `Card name: ${result.data.name}, id: ${result.data.id}`,
        };
      }
      case 'get_lists': {
        const parsed = GetListsInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.trello.getLists(parsed.data.board_id);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return {
          status: 'success',
          message: result.data.map((list) => `- ${list.name} (id: ${list.id})`).join('\n'),
        };
      }

      case 'get_cards': {
        const parsed = GetCardsInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.trello.getCards(parsed.data.list_id);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return {
          status: 'success',
          message: result.data
            .map(
              (card) =>
                `- ${card.name} (id: ${card.id}), (desc: ${card.desc || 'none'}), (due: ${card.due ?? 'none'})`,
            )
            .join('\n'),
        };
      }

      case 'get_boards': {
        const result = await deps.trello.getBoards();
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return {
          status: 'success',
          message: result.data.map((board) => `- ${board.name} (id: ${board.id})`).join('\n'),
        };
      }
      case 'move_card': {
        const parsed = MoveCardInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.trello.moveCard(parsed.data.card_id, parsed.data.target_list_id);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return {
          status: 'success',
          message: `Card name: ${result.data.name}, id: ${result.data.id}`,
        };
      }

      case 'archive_card': {
        const parsed = ArchiveCardInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        deps.setPendingApproval({
          toolName: 'archive_card',
          cardId: parsed.data.card_id,
          description: parsed.data.name,
        });
        return {
          status: 'confirmation_required',
          message: `Archive card: '${parsed.data.name}'? Reply yes or no.`,
        };
      }

      case 'set_due_date': {
        const parsed = SetDueDateInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.trello.setDue(parsed.data.card_id, parsed.data.due_date);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return {
          status: 'success',
          message: `Card name: ${result.data.name}, id: ${result.data.id}`,
        };
      }

      case 'append_note': {
        const parsed = AppendNoteInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.obsidian.appendToDaily(parsed.data.note_text);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return { status: 'success', message: 'Note Appended to Daily!' };
      }

      case 'search_notes': {
        const parsed = SearchNotesInput.safeParse(input);
        if (!parsed.success) {
          return { status: 'success', message: `PARSING_ERROR: ${parsed.error.message}` };
        }
        const result = await deps.obsidian.searchNotes(parsed.data.query_text);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return { status: 'success', message: `Note found: ${result.data}` };
      }

      case 'read_daily': {
        const notePath = deps.obsidian.getDailyNotePath();
        const result = await deps.obsidian.readNote(notePath);
        if (!result.success) {
          return {
            status: 'success',
            message: `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`,
          };
        }
        return { status: 'success', message: `Daily Notes: ${result.data}` };
      }

      default:
        console.warn(`[executor] unknown tool requested: ${name}`);
        return { status: 'success', message: `Unknown tool: ${name}` };
    }
  };
}
