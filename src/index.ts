// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import { Command } from 'commander';
import 'dotenv/config';
import {
  archiveCard,
  createCard,
  getBoards,
  getCards,
  getList,
  getMe,
  moveCard,
} from './api/client.js';
import { TrelloApiError } from './api/errors.js';

const program = new Command();

program.name('trello').description('CLI tool for interacting with Trello Api').version('0.1.0');

program
  .command('boards')
  .description('List all your Trello boards')
  .action(async () => {
    try {
      const boards = await getBoards();
      console.log(boards);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('get-user')
  .description('Get User Info')
  .action(async () => {
    try {
      const member = await getMe();
      console.log(member);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('get-list')
  .description('Get a List from a board-requires board id')
  .argument('<board-id>')
  .action(async (boardID: string) => {
    try {
      const list = await getList(boardID);
      console.log(list);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('get-cards')
  .description('get all cards in a list')
  .argument('<list-id>')
  .action(async (listID: string) => {
    try {
      const cards = await getCards(listID);
      console.log(cards);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('create-card')
  .description('create a card. Requires: listID, name, optinally desc')
  .argument('<list-id>')
  .argument('<name>')
  .argument('[description]')
  .action(async (listID: string, cardName: string, description?: string) => {
    try {
      const card = await createCard(listID, cardName, description);
      console.log(card);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('move-card')
  .description('move card to a list.  Requires: cardId and target listId')
  .argument('<cardId>')
  .argument('<targetListId>')
  .action(async (cardId: string, targetListId: string) => {
    try {
      const card = await moveCard(cardId, targetListId);
      console.log(card);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program
  .command('archive-card')
  .description('archive a card.  Requires: cardId')
  .argument('<cardId>')
  .action(async (cardId: string) => {
    try {
      const card = await archiveCard(cardId);
      console.log(card);
    } catch (error) {
      if (error instanceof TrelloApiError) {
        console.error(`Error: ${error.message} (status ${error.statusCode})`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program.parse();
