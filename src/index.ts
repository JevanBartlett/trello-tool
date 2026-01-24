// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import { Command } from 'commander';
import 'dotenv/config';
import { createCard, getBoards, getCards, getList, getMe, moveCard } from './api/client.js';

const program = new Command();

program.name('trello').description('CLI tool for interacting with Trello Api').version('0.1.0');

program
  .command('boards')
  .description('List all your Trello boards')
  .action(async () => {
    const boards = await getBoards();
    console.log(boards);
  });

program
  .command('get-user')
  .description('Get User Info')
  .action(async () => {
    const member = await getMe();
    console.log(member);
  });

program
  .command('get-list')
  .description('Get a List from a board-requires board id')
  .argument('<board-id>')
  .action(async (boardID: string) => {
    const list = await getList(boardID);
    console.log(list);
  });

program
  .command('get-cards')
  .description('get all cards in a list')
  .argument('<list-id>')
  .action(async (listID: string) => {
    const cards = await getCards(listID);
    console.log(cards);
  });

program
  .command('create-card')
  .description('create a card. Requires: listID, name, optinally desc')
  .argument('<list-id>')
  .argument('<name>')
  .argument('[description]')
  .action(async (listID: string, cardName: string, description?: string) => {
    const card = await createCard(listID, cardName, description);
    console.log(card);
  });

program
  .command('move-card')
  .description('move card to a list.  Requires: cardId and target listId')
  .argument('<cardId>')
  .argument('<targetListId>')
  .action(async (cardId: string, targetListId: string) => {
    const card = await moveCard(cardId, targetListId);
    console.log(card);
  });

program.parse();
