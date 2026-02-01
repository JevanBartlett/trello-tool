// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import chalk from 'chalk';
import { Command } from 'commander';
import 'dotenv/config';
import {
  archiveCard,
  clearDue,
  createBoard,
  createCard,
  createList,
  getBoards,
  getCards,
  getLists,
  getMe,
  moveCard,
  setDesc,
  setDue,
} from './api/client.js';
import { TrelloApiError } from './api/errors.js';

const program = new Command();

program.name('trello').description('CLI tool for interacting with Trello API').version('0.1.0');

program
  .command('get-boards')
  .description('List all your Trello boards')
  .action(async () => {
    try {
      const boards = await getBoards();

      const maxLength = Math.max(...boards.map((b) => b.name.length));

      const columnWidth = maxLength + 4;

      console.log(chalk.white('BOARD NAME'.padEnd(columnWidth)) + chalk.blue('BOARD ID'));
      for (const board of boards) {
        console.log(chalk.white(board.name.padEnd(columnWidth)) + chalk.blue(board.id));
      }
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
  .description('Display current user info')
  .action(async () => {
    try {
      const member = await getMe();
      console.log(chalk.green('Logged in As:'), chalk.blue(`(${member.fullName})`));
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
  .description('List all lists on a board')
  .argument('<board-id>')
  .action(async (boardID: string) => {
    try {
      const list = await getLists(boardID);

      const maxLength = Math.max(...list.map((l) => l.name.length));

      const columnWidth = maxLength + 4;
      console.log(
        chalk.white('NAME'.padEnd(columnWidth)) +
          chalk.blue('ID'.padEnd(columnWidth)) +
          chalk.green('BOARD ID'.padEnd(columnWidth)),
      );

      for (const item of list) {
        console.log(
          chalk.white(item.name.padEnd(columnWidth)) +
            chalk.blue(item.id.padEnd(columnWidth) + chalk.green(item.idBoard.padEnd(columnWidth))),
        );
      }
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
  .description('List all cards in a list')
  .argument('<list-id>')
  .action(async (listID: string) => {
    try {
      const cards = await getCards(listID);

      const maxLength = Math.max(...cards.map((c) => c.name.length));
      const maxLenId = Math.max(...cards.map((c) => c.id.length));
      const maxLenDue = Math.max(...cards.map((c) => c.due?.length ?? 0));

      const nameWidth = maxLength + 4;
      const idWidth = maxLenId + 4;
      const dueWidth = maxLenDue + 4;

      console.log(
        chalk.white('NAME'.padEnd(nameWidth)) +
          chalk.blue('ID'.padEnd(idWidth)) +
          chalk.green('DUE DATE'.padEnd(dueWidth)),
      );

      for (const item of cards) {
        console.log(
          chalk.white(item.name.padEnd(nameWidth)) +
            chalk.blue(item.id.padEnd(idWidth) + chalk.green((item.due ?? '-').padEnd(dueWidth))),
        );
      }
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
  .description('Create a new card in a list')
  .argument('<list-id>')
  .argument('<name>')
  .option('--due <date>', 'Due date for the card')
  .argument('[description]')
  .action(
    async (
      listID: string,
      cardName: string,
      description: string | undefined,
      options: { due?: string },
    ) => {
      try {
        const card = await createCard(listID, cardName, description, options.due);
        console.log(chalk.green('Created card:'), card.name, chalk.blue(`(${card.id})`));
      } catch (error) {
        if (error instanceof TrelloApiError) {
          console.error(`Error: ${error.message} (status ${error.statusCode})`);
        } else {
          console.error('An unexpected error occurred');
        }
        process.exit(1);
      }
    },
  );

program
  .command('move-card')
  .description('Move a card to a different list')
  .argument('<cardId>')
  .argument('<targetListId>')
  .action(async (cardId: string, targetListId: string) => {
    try {
      const card = await moveCard(cardId, targetListId);
      console.log(chalk.green('Moved card:'), card.name, chalk.blue(`(${card.id})`));
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
  .description('Archive a card')
  .argument('<cardId>')
  .action(async (cardId: string) => {
    try {
      const card = await archiveCard(cardId);
      console.log(chalk.green('Archived card:'), card.name, chalk.blue(`(${card.id})`));
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
  .command('set-due')
  .description('Set due date on a card')
  .argument('<cardId>')
  .argument('<dueDate>')
  .action(async (cardId: string, dueDate: string) => {
    try {
      const card = await setDue(cardId, dueDate);
      console.log(chalk.green('Set Due Date:'), card.name, chalk.blue(`(${card.id})`));
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
  .command('clear-due')
  .description('Clear due date from a card')
  .argument('<cardId>')
  .action(async (cardId: string) => {
    try {
      const card = await clearDue(cardId);
      console.log(chalk.green('Cleared Due Date:'), card.name, chalk.blue(`(${card.id})`));
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
  .command('set-desc')
  .description('Update description on a card')
  .argument('<cardId>')
  .argument('<desc>')
  .action(async (cardId: string, desc: string) => {
    try {
      const card = await setDesc(cardId, desc);
      console.log(chalk.green('Updated Desc:'), card.name, chalk.blue(`(${card.id})`));
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
  .command('create-board')
  .description('Create a new board')
  .argument('<name>')
  .action(async (name: string) => {
    try {
      const board = await createBoard(name);
      console.log(chalk.green('Board Created:'), board.name, chalk.blue(`(${board.id})`));
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
  .command('create-list')
  .description('Create a new list on a board')
  .argument('<boardId>')
  .argument('<name>')
  .action(async (boardId: string, name: string) => {
    try {
      const list = await createList(boardId, name);
      console.log(chalk.green('List Created:'), list.name, chalk.blue(`(${list.id})`));
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
