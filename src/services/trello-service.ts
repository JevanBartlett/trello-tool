import { z } from 'zod';
import type { Result } from '../types/result.js';
import type { TrelloBoard, TrelloCard, TrelloList } from '../types/trello.js';
import { BoardSchema, CardSchema, ListSchema } from '../types/trello.js';

export class TrelloService {
  constructor(
    private apiKey: string,
    private token: string,
  ) {}

  private async request<T>(
    url: string,
    schema: z.ZodSchema<T>,
    options?: RequestInit,
  ): Promise<Result<T>> {
    let response: Response;

    try {
      response = await fetch(url, options);
    } catch {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to Trello API',
        },
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'API_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = schema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello API',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

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
    return this.request(url, z.array(BoardSchema));
  }

  async getLists(boardId: string): Promise<Result<TrelloList[]>> {
    const url = this.buildURL(`boards/${boardId}/lists`);
    return this.request(url, z.array(ListSchema));
  }

  async getCards(listId: string): Promise<Result<TrelloCard[]>> {
    const url = this.buildURL(`lists/${listId}/cards`);
    return this.request(url, z.array(CardSchema));
  }

  // === POST methods ===

  async createCard(
    listId: string,
    cardName: string,
    description?: string,
    due?: string,
  ): Promise<Result<TrelloCard>> {
    const url = this.buildURL('cards');
    const body = {
      name: cardName,
      idList: listId,
      desc: description,
      due: due ? new Date(due).toISOString() : undefined,
    };
    return this.request(url, CardSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async createBoard(name: string): Promise<Result<TrelloBoard>> {
    const url = this.buildURL('boards');
    return this.request(url, BoardSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
  }

  async createList(boardId: string, name: string): Promise<Result<TrelloList>> {
    const url = this.buildURL('lists');
    return this.request(url, ListSchema, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, idBoard: boardId }),
    });
  }

  // === PUT methods ===

  async moveCard(cardId: string, targetListId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { idList: targetListId });
    return this.request(url, CardSchema, { method: 'PUT' });
  }

  async archiveCard(cardId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { closed: 'true' });
    return this.request(url, CardSchema, { method: 'PUT' });
  }

  async setDue(cardId: string, dueDate: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { due: new Date(dueDate).toISOString() });
    return this.request(url, CardSchema, { method: 'PUT' });
  }

  async clearDue(cardId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { due: 'null' });
    return this.request(url, CardSchema, { method: 'PUT' });
  }

  async setDesc(cardId: string, desc: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { desc });
    return this.request(url, CardSchema, { method: 'PUT' });
  }
}
