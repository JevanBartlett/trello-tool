// Entry point - wires CLI, API, and formatters together
// This file will parse CLI arguments and dispatch to the appropriate commands
import 'dotenv/config';

const apiKey = process.env.TRELLO_API_KEY;
const token = process.env.TRELLO_TOKEN;
const url = `https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}`;

async function getData(): Promise<void> {
  try {
    const response: Response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const result: unknown = await response.json();
    console.log(result);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }
}

await getData();
