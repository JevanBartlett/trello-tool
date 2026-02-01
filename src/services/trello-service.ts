import { z } from 'zod';
import type { Result } from '../types/result.js';
import type { TrelloBoard, TrelloCard, TrelloList } from '../types/trello.js';
import { BoardSchema, CardSchema, ListSchema } from '../types/trello.js';

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

  async getBoards(): Promise<Result<TrelloBoard[]>> {
    const url = this.buildURL('members/me/boards');
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }
    const data: unknown = await response.json();
    const parsed = z.array(BoardSchema).safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }
    return {
      success: true,
      data: parsed.data,
    };
  }

  async getLists(boardID: string): Promise<Result<TrelloList[]>> {
    const url = this.buildURL(`boards/${boardID}/lists`);
    const response = await fetch(url);
    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }
    const data: unknown = await response.json();
    const parsed = z.array(ListSchema).safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }
    return {
      success: true,
      data: parsed.data,
    };
  }

  async createCard(
    listID: string,
    cardName: string,
    description?: string,
    due?: string,
  ): Promise<Result<TrelloCard>> {
    const body = {
      name: cardName,
      idList: listID,
      desc: description,
      due: due ? new Date(due).toISOString() : undefined,
    };
    const url = this.buildURL('cards');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = CardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async setDue(cardId: string, dueDate: string): Promise<Result<TrelloCard>> {
    const path = `cards/${cardId}`;
    const date = new Date(dueDate);
    const url = this.buildURL(path, { due: date.toISOString() });

    const response: Response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = CardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async getCards(listID: string): Promise<Result<TrelloCard[]>> {
    const url = this.buildURL(`lists/${listID}/cards`);
    const response = await fetch(url);

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = z.array(CardSchema).safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async moveCard(cardId: string, targetListId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { idList: targetListId });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = CardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async archiveCard(cardId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { closed: 'true' });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = CardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async clearDue(cardId: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { due: 'null' });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = CardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async setDesc(cardId: string, desc: string): Promise<Result<TrelloCard>> {
    const url = this.buildURL(`cards/${cardId}`, { desc: desc });
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = CardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async createBoard(name: string): Promise<Result<TrelloBoard>> {
    const url = this.buildURL('boards');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = BoardSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }

  async createList(boardId: string, name: string): Promise<Result<TrelloList>> {
    const url = this.buildURL('lists');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, idBoard: boardId }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Request failed with status ${response.status}`,
        },
      };
    }

    const data: unknown = await response.json();
    const parsed = ListSchema.safeParse(data);

    if (!parsed.success) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid response from Trello Api',
        },
      };
    }

    return {
      success: true,
      data: parsed.data,
    };
  }
}
