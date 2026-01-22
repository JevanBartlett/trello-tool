// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import { Command } from 'commander';
import 'dotenv/config';
import { getBoards, getList, getMe } from './api/client.js';

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

program.parse();
