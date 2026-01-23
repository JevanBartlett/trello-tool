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

function buildURL(path: string): string {
  const url = new URL(path, process.env.TRELLO_BASE_URL);
  const apiKey = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  url.searchParams.set('key', apiKey!);
  url.searchParams.set('token', token!);

  return url.toString();
}

async function getData(path: string): Promise<unknown> {
  try {
    const url = buildURL(path);
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result: unknown = await response.json();
    return result;
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
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
