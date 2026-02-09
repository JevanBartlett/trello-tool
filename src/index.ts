// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import chalk from 'chalk';
import { Command } from 'commander';
import 'dotenv/config';
import { ConfigService } from './services/config-service.js';
import { ObsidianService } from './services/obsidian-service.js';
import { TrelloService } from './services/trello-service.js';

const program = new Command();
const service = new TrelloService(process.env.TRELLO_API_KEY!, process.env.TRELLO_TOKEN!);
const configService = new ConfigService();
const vaultConfig = configService.getConfig();
const vaultPath = vaultConfig.success ? vaultConfig.data.obsidian?.defaultVaultPath : undefined;
const obsidianService = vaultPath ? new ObsidianService(vaultPath) : null;

const config = program.command('config').description('Manage configuration');

const cards = program
  .command('trello')
  .description('CLI tool for interacting with Trello API')
  .version('0.1.0');

const notes = program.command('notes').description('Manage Obsidian notes');

config
  .command('set-default-board')
  .description('Set default board ID')
  .argument('<board-id>')
  .action((boardId: string) => {
    const result = configService.setTrelloDefaultBoard(boardId);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.green('Default board set:'), boardId);
  });

config
  .command('set-default-list')
  .description('Set default list ID')
  .argument('<list-id>')
  .action((listID: string) => {
    const result = configService.setTrelloDefaultInbox(listID);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.green('Default list set:'), listID);
  });

config
  .command('show')
  .description('show current configuration')
  .action(() => {
    const result = configService.getConfig();
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.white('Current config:'));
    console.log(chalk.blue('  Board ID:'), result.data.trello?.defaultBoardId ?? '(not set)');
    console.log(
      chalk.blue('  Inbox List ID:'),
      result.data.trello?.defaultInboxListId ?? '(not set)',
    );
    console.log(chalk.blue('  VaultPath:'), result.data.obsidian?.defaultVaultPath ?? '{not set}');
  });

config
  .command('set-vault-path')
  .description('Set Obsidian vault path')
  .argument('<path>')
  .action((path: string) => {
    const result = configService.setObsidianVaultPath(path);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.green('Vault path set:'), path);
  });

cards
  .command('get-boards')
  .description('List all your Trello boards')
  .action(async () => {
    try {
      const result = await service.getBoards();
      if (!result.success) {
        console.error(result.error.message);
        process.exit(1);
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

cards
  .command('get-lists')
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

cards
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

cards
  .command('create-card')
  .description('Create a new card in a list (uses default inbox if no --list provided)')
  .argument('<name>')
  .argument('[description]')
  .option('--list <list-id>', 'Target list ID (defaults to configured inbox)')
  .option('--due <date>', 'Due date for the card')
  .action(
    async (
      cardName: string,
      description: string | undefined,
      options: { list?: string; due?: string },
    ) => {
      try {
        // Use provided list-id or fall back to default inbox
        let targetListId = options.list;
        if (!targetListId) {
          const configResult = configService.getConfig();
          if (!configResult.success) {
            console.error(configResult.error.message);
            process.exit(1);
          }
          targetListId = configResult.data.trello?.defaultInboxListId;
          if (!targetListId) {
            console.error(
              'No --list provided and no default inbox configured. Run: trello config set-default-list <list-id>',
            );
            process.exit(1);
          }
        }
        const result = await service.createCard(targetListId, cardName, description, options.due);
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

cards
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

cards
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

cards
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

cards
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

cards
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

cards
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

cards
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

notes
  .command('daily')
  .description("Show today's daily note")
  .action(async () => {
    if (!obsidianService) {
      console.error('Vault path not configured. Run: config set-vault-path <path>');
      process.exit(1);
    }
    const path = obsidianService.getDailyNotePath();
    const result = await obsidianService.readNote(path);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.green(result.data));
  });

notes
  .command('append')
  .description('Append text to daily note')
  .argument('<text>')
  .action(async (text: string) => {
    if (!obsidianService) {
      console.error('Vault path not configured.  Run: config set-vault-path <path>');
      process.exit(1);
    }
    const result = await obsidianService.appendToDaily(text);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.green('Added to daily note'));
  });

notes
  .command('create-note')
  .description('create a new note')
  .argument('<path>')
  .argument('<content>')
  .action(async (path: string, content: string) => {
    if (!obsidianService) {
      console.error('Vault path not configured.  Run: config set-vault-path <path>');
      process.exit(1);
    }
    const result = await obsidianService.createNote(path, content);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.blue('Note Captured!'));
  });

notes
  .command('search-note')
  .description('Search notes for query')
  .argument('<query>')
  .action(async (query: string) => {
    if (!obsidianService) {
      console.error('Obsidian service not configured');
      process.exit(1);
    }
    const result = await obsidianService.searchNotes(query);
    if (!result.success) {
      console.error(result.error.message);
      process.exit(1);
    }
    console.log(chalk.yellow(`${result.data}`));
  });

program.parse();
