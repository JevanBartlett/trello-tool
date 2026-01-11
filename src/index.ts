// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import 'dotenv/config';
import { getBoards, getMe } from './api/client.js';

const boards = await getBoards();
console.log(boards);

const member = await getMe();
console.log(member);
