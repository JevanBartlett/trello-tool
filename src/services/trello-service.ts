import { z } from 'zod';
import type { Result } from '../types/result.js';
import type { TrelloBoard, TrelloCard, TrelloList } from '../types/trello.js';
import { BoardSchema, CardSchema, ListSchema, dateStringSchema } from '../types/trello.js';
import { request } from '../utils/request.js';

export class TrelloService {
  constructor(
    private apiKey: string,
    private token: string,
  ) {}

  private buildURL(path: string, params?: Record<string, string>): string {
    const url = new URL(path, process.env.TRELLO_BASE_URL);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('token', this.token);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    return url.toString();
  }

  // === GET methods ===

  async getBoards(): Promise<Result<TrelloBoard[]>> {
    const url = this.buildURL('members/me/boards');
    return request(url, z.array(BoardSchema));
  }

  async getLists(boardId: string): Promise<Result<TrelloList[]>> {
    const url = this.buildURL(`boards/${boardId}/lists`);
    return request(url, z.array(ListSchema));
  }

  async getCards(listId: string): Promise<Result<TrelloCard[]>> {
    const url = this.buildURL(`lists/${listId}/cards`);
    return request(url, z.array(CardSchema));
  }

  // === POST methods ===

  async createCard(
    listId: string,
    cardName: string,
    description?: string,
    due?: string,
  ): Promise<Result<TrelloCard>> {
    let parsedDue: string | undefined;

    if (due) {
      const parsed = dateStringSchema.safeParse(due);

      if (!parsed.success) {
        return {
          success: false,
          error: { code: 'INVALID_DATE', message: parsed.error.message },
        };
      }
      parsedDue = parsed.data;
    }
    const url = this.buildURL('cards');
    const body = {
      name: cardName,
      idList: listId,
      desc: description,
      due: parsedDue,
    };
    return request(url, CardSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async createBoard(name: string): Promise<Result<TrelloBoard>> {
    const url = this.buildURL('boards');
    return request(url, BoardSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  async createList(boardId: string, name: string): Promise<Result<TrelloList>> {
    const url = this.buildURL('lists');
    return request(url, ListSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, idBoard: boardId }),
    });
  }

  // === PUT methods ===

  async moveCard(cardId: string, targetListId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { idList: targetListId });
    return request(url, CardSchema, { method: 'PUT' });
  }

  async archiveCard(cardId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { closed: 'true' });
    return request(url, CardSchema, { method: 'PUT' });
  }

  async setDue(cardId: string, dueDate: string): Promise<Result<TrelloCard>> {
    const parsed = dateStringSchema.safeParse(dueDate);

    if (!parsed.success) {
      return {
        success: false,
        error: { code: 'INVALID_DATE', message: parsed.error.message },
      };
    }
    const url = this.buildURL(`cards/${cardId}`, { due: parsed.data });
    return request(url, CardSchema, { method: 'PUT' });
  }

  async clearDue(cardId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { due: 'null' });
    return request(url, CardSchema, { method: 'PUT' });
  }

  async setDesc(cardId: string, desc: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { desc });
    return request(url, CardSchema, { method: 'PUT' });
  }
}
