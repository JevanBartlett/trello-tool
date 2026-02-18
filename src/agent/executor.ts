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
}

export function createExecutor(
  deps: ExecutorDeps,
): (name: string, input: Record<string, unknown>) => Promise<string> {
  return async function executeTool(name: string, input: Record<string, unknown>): Promise<string> {
    switch (name) {
      case 'create_task': {
        const parsed = CreateTaskInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.trello.createCard(
          parsed.data.list_id ?? deps.defaultListId,
          parsed.data.name,
          parsed.data.desc,
          parsed.data.due,
        );
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return `Card name: ${result.data.name}, id: ${result.data.id}`;
      }
      case 'get_lists': {
        const parsed = GetListsInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.trello.getLists(parsed.data.board_id);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return result.data.map((list) => `- ${list.name} (id: ${list.id})`).join('\n');
      }

      case 'get_cards': {
        const parsed = GetCardsInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.trello.getCards(parsed.data.list_id);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return result.data.map((card) => `- ${card.name} (id: ${card.id})`).join('\n');
      }

      case 'get_boards': {
        const result = await deps.trello.getBoards();
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return result.data.map((board) => `- ${board.name} (id: ${board.id})`).join('\n');
      }
      case 'move_card': {
        const parsed = MoveCardInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.trello.moveCard(parsed.data.card_id, parsed.data.target_list_id);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return `Card name: ${result.data.name}, id: ${result.data.id}`;
      }

      case 'archive_card': {
        const parsed = ArchiveCardInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.trello.archiveCard(parsed.data.card_id);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return `Card name: ${result.data.name}, id: ${result.data.id}`;
      }

      case 'set_due_date': {
        const parsed = SetDueDateInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.trello.setDue(parsed.data.card_id, parsed.data.due_date);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return `Card name: ${result.data.name}, id: ${result.data.id}`;
      }

      case 'append_note': {
        const parsed = AppendNoteInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.obsidian.appendToDaily(parsed.data.note_text);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return 'Note Appended to Daily!';
      }

      case 'search_notes': {
        const parsed = SearchNotesInput.safeParse(input);
        if (!parsed.success) {
          return `PARSING_ERROR: ${parsed.error.message}`;
        }
        const result = await deps.obsidian.searchNotes(parsed.data.query_text);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return `Note found: ${result.data}`;
      }

      case 'read_daily': {
        const notePath = deps.obsidian.getDailyNotePath();
        const result = await deps.obsidian.readNote(notePath);
        if (!result.success) {
          return `SERVICE_ERROR: ${result.error.code}, ${result.error.message}`;
        }
        return `Daily Notes: ${result.data}`;
      }

      default:
        return `Unknown tool: ${name}`;
    }
  };
}
