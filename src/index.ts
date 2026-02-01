// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import chalk from 'chalk';
import { Command } from 'commander';
import 'dotenv/config';
import { TrelloService } from './services/trello-service.js';

const program = new Command();
const service = new TrelloService(process.env.TRELLO_API_KEY!, process.env.TRELLO_TOKEN!);

program.name('trello').description('CLI tool for interacting with Trello API').version('0.1.0');

program
  .command('get-boards')
  .description('List all your Trello boards')
  .action(async () => {
    try {
      const result = await service.getBoards();
      if (!result.success) {
        console.error(result.error.message);
        return;
      }

      const maxLength = Math.max(...result.data.map((b) => b.name.length));

      const columnWidth = maxLength + 4;

      console.log(chalk.white('BOARD NAME'.padEnd(columnWidth)) + chalk.blue('BOARD ID'));
      for (const board of result.data) {
        console.log(chalk.white(board.name.padEnd(columnWidth)) + chalk.blue(board.id));
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
  .action(async (boardId: string) => {
    try {
      const result = await service.getLists(boardId);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }

      const maxLength = Math.max(...result.data.map((l) => l.name.length));
      const columnWidth = maxLength + 4;

      console.log(
        chalk.white('NAME'.padEnd(columnWidth)) +
          chalk.blue('ID'.padEnd(columnWidth)) +
          chalk.green('BOARD ID'),
      );

      for (const item of result.data) {
        console.log(
          chalk.white(item.name.padEnd(columnWidth)) +
            chalk.blue(item.id.padEnd(columnWidth)) +
            chalk.green(item.idBoard),
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
  .action(async (listId: string) => {
    try {
      const result = await service.getCards(listId);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }

      const maxLength = Math.max(...result.data.map((c) => c.name.length));
      const maxLenId = Math.max(...result.data.map((c) => c.id.length));
      const maxLenDue = Math.max(...result.data.map((c) => c.due?.length ?? 0));

      const nameWidth = maxLength + 4;
      const idWidth = maxLenId + 4;
      const dueWidth = maxLenDue + 4;

      console.log(
        chalk.white('NAME'.padEnd(nameWidth)) +
          chalk.blue('ID'.padEnd(idWidth)) +
          chalk.green('DUE DATE'.padEnd(dueWidth)),
      );

      for (const item of result.data) {
        console.log(
          chalk.white(item.name.padEnd(nameWidth)) +
            chalk.blue(item.id.padEnd(idWidth)) +
            chalk.green((item.due ?? '-').padEnd(dueWidth)),
        );
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      listId: string,
      cardName: string,
      description: string | undefined,
      options: { due?: string },
    ) => {
      try {
        const result = await service.createCard(listId, cardName, description, options.due);
        if (!result.success) {
          console.error(result.error.message);
          process.exit(1);
        }
        console.log(
          chalk.green('Created card:'),
          result.data.name,
          chalk.blue(`(${result.data.id})`),
        );
      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
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
      const result = await service.moveCard(cardId, targetListId);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(chalk.green('Moved card:'), result.data.name, chalk.blue(`(${result.data.id})`));
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      const result = await service.archiveCard(cardId);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(
        chalk.green('Archived card:'),
        result.data.name,
        chalk.blue(`(${result.data.id})`),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      const result = await service.setDue(cardId, dueDate);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(
        chalk.green('Set Due Date:'),
        result.data.name,
        chalk.blue(`(${result.data.id})`),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      const result = await service.clearDue(cardId);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(
        chalk.green('Cleared Due Date:'),
        result.data.name,
        chalk.blue(`(${result.data.id})`),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      const result = await service.setDesc(cardId, desc);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(
        chalk.green('Updated Desc:'),
        result.data.name,
        chalk.blue(`(${result.data.id})`),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      const result = await service.createBoard(name);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(
        chalk.green('Board Created:'),
        result.data.name,
        chalk.blue(`(${result.data.id})`),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
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
      const result = await service.createList(boardId, name);
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
      }
      console.log(
        chalk.green('List Created:'),
        result.data.name,
        chalk.blue(`(${result.data.id})`),
      );
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
      } else {
        console.error('An unexpected error occurred');
      }
      process.exit(1);
    }
  });

program.parse();
