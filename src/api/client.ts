// Trello API client
// Handles authentication and HTTP requests to Trello REST API
import { z } from 'zod';
import {
  BoardSchema,
  CardSchema,
  ListSchema,
  MemberSchema,
  type TrelloBoard,
  type TrelloCard,
  type TrelloList,
  type TrelloMember,
} from '../types/trello.js';
import { TrelloApiError } from './errors.js';

function buildURL(path: string, params?: Record<string, string>): string {
  const url = new URL(path, process.env.TRELLO_BASE_URL);
  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  url.searchParams.set('key', apiKey!);
  url.searchParams.set('token', token!);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function getData(path: string): Promise<unknown> {
  const url = buildURL(path);
  const response: Response = await fetch(url);
  if (!response.ok) {
    throw new TrelloApiError(`Request to ${path} failed`, response.status, path);
  }
  return response.json();
}

export async function createCard(
  listID: string,
  cardName: string,
  description?: string,
  due?: string,
): Promise<TrelloCard> {
  const body = {
    name: cardName,
    idList: listID,
    desc: description,
    due: due ? new Date(due).toISOString() : undefined,
  };
  const path = 'cards';
  const url = buildURL(path);
  const response: Response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new TrelloApiError(`Request to ${path} failed`, response.status, path);
  }

  const result: unknown = await response.json();
  return CardSchema.parse(result);
}

export async function moveCard(cardId: string, targetListId: string): Promise<TrelloCard> {
  const path = `cards/${cardId}`;
  const url = buildURL(path, { idList: targetListId });
  const response: Response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new TrelloApiError(`Request to ${path} failed`, response.status, path);
  }

  const result: unknown = await response.json();
  return CardSchema.parse(result);
}

export async function archiveCard(cardId: string): Promise<TrelloCard> {
  const path = `cards/${cardId}`;
  const url = buildURL(path, { closed: 'true' });
  const response: Response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new TrelloApiError(`Request to ${path} failed`, response.status, path);
  }

  const result: unknown = await response.json();
  return CardSchema.parse(result);
}

export async function setDue(cardId: string, dueDate: string): Promise<TrelloCard> {
  const path = `cards/${cardId}`;
  const date = new Date(dueDate);
  const url = buildURL(path, { due: date.toISOString() });

  const response: Response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new TrelloApiError(`Request to ${path} failed`, response.status, path);
  }

  const result: unknown = await response.json();
  return CardSchema.parse(result);
}

export async function clearDue(cardId: string): Promise<TrelloCard> {
  const path = `cards/${cardId}`;
  const url = buildURL(path, { due: 'null' });

  const response: Response = await fetch(url, {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new TrelloApiError(`Request to ${path} failed`, response.status, path);
  }

  const result: unknown = await response.json();
  return CardSchema.parse(result);
}

export async function getBoards(): Promise<TrelloBoard[]> {
  const boards = await getData('members/me/boards');
  return z.array(BoardSchema).parse(boards);
}

export async function getMe(): Promise<TrelloMember> {
  const memberInfo = await getData('members/me');
  return MemberSchema.parse(memberInfo);
}

export async function getList(boardID: string): Promise<TrelloList[]> {
  const lists = await getData(`boards/${boardID}/lists`);
  return z.array(ListSchema).parse(lists);
}

export async function getCards(listID: string): Promise<TrelloCard[]> {
  const cards = await getData(`lists/${listID}/cards`);
  return z.array(CardSchema).parse(cards);
}
