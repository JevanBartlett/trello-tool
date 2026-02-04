import fs from 'node:fs/promises';
import path from 'node:path';
import type { Result } from '../types/result.js';

export class ObsidianService {
  constructor(private vaultPath: string) {}

  getDailyNotePath(): string {
    const dateString = new Date().toISOString().slice(0, 10);
    return `${this.vaultPath}/Daily/${dateString}.md`;
  }

  async appendToDaily(content: string): Promise<Result<void>> {
    const notesPath = this.getDailyNotePath();
    const dir = path.dirname(notesPath);

    try {
      await fs.mkdir(dir, { recursive: true });
      await fs.appendFile(notesPath, content);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WRITE_ERROR',
          message: error instanceof Error ? error.message : 'Write operation failed',
        },
      };
    }
    return {
      success: true,
      data: undefined,
    };
  }

  async createNote(path: string, content: string): Promise<Result<void>> {
    const notesPath = path;

    try {
      await fs.writeFile(notesPath, content);
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WRITE_ERROR',
          message: error instanceof Error ? error.message : 'Write operation failed',
        },
      };
    }
    return {
      success: true,
      data: undefined,
    };
  }

  async readNote(path: string): Promise<Result<string>> {
    const notesPath = path;
    try {
      const fileContent = await fs.readFile(notesPath, 'utf-8');
      return {
        success: true,
        data: fileContent,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'READ_ERROR',
          message: error instanceof Error ? error.message : 'Read operation failed',
        },
      };
    }
  }

  searchNotes(_query: string): Promise<Result<void>> {
    return Promise.resolve({ success: true, data: undefined });
  }
}
