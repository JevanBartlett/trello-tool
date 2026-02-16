import { z } from 'zod';

export const CreateTaskInput = z.object({
  name: z.string(),
  desc: z.string().optional(),
  list_id: z.string().optional(),
  due: z.string().optional(),
});

export const GetBoardsInput = z.object({});
export const ReadDailyInput = z.object({});
export const GetListsInput = z.object({
  board_id: z.string(),
});
export const GetCardsInput = z.object({
  list_id: z.string(),
});
export const MoveCardInput = z.object({
  card_id: z.string(),
  target_list_id: z.string(),
});
export const ArchiveCardInput = z.object({
  card_id: z.string(),
});

export const SetDueDateInput = z.object({
  card_id: z.string(),
  due_date: z.string(),
});

export const AppendNoteInput = z.object({
  note_text: z.string(),
});
export const SearchNotesInput = z.object({
  query_text: z.string(),
});

export const tools = [
  {
    name: 'create_task',
    description:
      'Create a new task as a Trello card. Use when the user mentions something actionable that needs tracking. Clean up informal input into a clear task title. Resolves to the default inbox list unless a specific list_id is provided.',
    input_schema: z.toJSONSchema(CreateTaskInput),
  },
  {
    name: 'get_boards',
    description:
      'List all Trello boards the user has access to. Use when the user asks about their boards or you need to find a board ID.',
    input_schema: z.toJSONSchema(GetBoardsInput),
  },
  {
    name: 'get_lists',
    description:
      'List all lists on a Trello board. Use when the user asks what lists exist on a board, or when you need a list ID to move or create cards.',
    input_schema: z.toJSONSchema(GetListsInput),
  },
  {
    name: 'get_cards',
    description:
      'List all cards on a Trello list. Use when the user asks what tasks are on a list, wants to review their inbox, or you need a card ID for another operation.',
    input_schema: z.toJSONSchema(GetCardsInput),
  },
  {
    name: 'move_card',
    description:
      'Move a Trello card to a different list. Use when the user wants to organize, sort, or reclassify a task. Requires the card ID and the target list ID.',
    input_schema: z.toJSONSchema(MoveCardInput),
  },
  {
    name: 'archive_card',
    description:
      'Archive a Trello card. Use when the user wants to remove or complete a task. This is destructive — the card is hidden from the board.',
    input_schema: z.toJSONSchema(ArchiveCardInput),
  },
  {
    name: 'set_due_date',
    description:
      'Set or update the due date on a Trello card. Use when the user mentions a deadline for an existing task. The due_date should be an ISO 8601 date string (YYYY-MM-DD).',
    input_schema: z.toJSONSchema(SetDueDateInput),
  },
  {
    name: 'append_note',
    description:
      "Append a timestamped entry to today's daily note in Obsidian. Use when the user shares something informational that doesn't need to be a task — observations, reminders, context, meeting notes.",
    input_schema: z.toJSONSchema(AppendNoteInput),
  },
  {
    name: 'search_notes',
    description:
      'Search the Obsidian vault for a keyword or phrase. Use when the user asks about past notes or wants to find something they previously captured.',
    input_schema: z.toJSONSchema(SearchNotesInput),
  },
  {
    name: 'read_daily',
    description:
      "Read today's daily note from Obsidian. Use when the user asks what they've captured today or wants to review their daily note.",
    input_schema: z.toJSONSchema(ReadDailyInput),
  },
];
