import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { Result } from '../types/result.js';

const execAsync = promisify(execFile);
// Returns the markdown template for a new daily note
function getDailyTemplate(date: string): string {
  return `# ${date}

## Captured

## Tasks Created

## Notes
`;
}

// Returns current time as "2:47pm" format
function formatTime(): string {
  return new Date()
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
    .toLowerCase()
    .replace(' ', '');
}

export class ObsidianService {
  constructor(private vaultPath: string) {}

  private buildDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;
    return dateString;
  }

  private safePath(userPath: string): Result<string> {
    const resolved = path.resolve(this.vaultPath, userPath);

    if (resolved !== this.vaultPath && !resolved.startsWith(this.vaultPath + path.sep)) {
      return {
        success: false,
        error: {
          code: 'PATH_TRAVERSAL_ERROR',
          message: `Path escapes vault: ${userPath}`,
        },
      };
    }
    return { success: true, data: resolved };
  }

  getDailyNotePath(): string {
    const dateString = this.buildDate();
    return `${this.vaultPath}/Daily/${dateString}.md`;
  }

  // Appends a timestamped entry to the "## Captured" section of today's daily note.
  // Creates the daily note with template if it doesn't exist.
  // New entries appear at the TOP of the Captured section (newest-first).
  async appendToDaily(content: string): Promise<Result<void>> {
    const notesPath = this.getDailyNotePath();
    const dir = path.dirname(notesPath);
    const dateString = this.buildDate();

    try {
      // Ensure Daily/ folder exists
      await fs.mkdir(dir, { recursive: true });

      // Format: "- 2:47pm — nancy thursday uat"
      const entry = `- ${formatTime()} — ${content}\n`;

      // Try to read existing file. If ENOENT (file not found), leave as null.
      // Any other error gets re-thrown to outer catch.
      let fileContent: string | null = null;
      try {
        fileContent = await fs.readFile(notesPath, 'utf-8');
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error;
        }
      }

      let newContent: string;

      if (fileContent === null) {
        // File doesn't exist — create with template and insert entry
        const template = getDailyTemplate(dateString);
        const marker = '## Captured\n';
        // Find where marker ends, insert entry right after it
        const insertPoint = template.indexOf(marker) + marker.length;
        newContent = template.slice(0, insertPoint) + entry + template.slice(insertPoint);
      } else {
        // File exists — insert entry after "## Captured\n"
        const marker = '## Captured\n';
        const markerIndex = fileContent.indexOf(marker);

        if (markerIndex === -1) {
          newContent = fileContent + '\n' + marker + entry;
        } else {
          const insertPoint = markerIndex + marker.length;
          newContent = fileContent.slice(0, insertPoint) + entry + fileContent.slice(insertPoint);
        }
      }

      await fs.writeFile(notesPath, newContent);

      return { success: true, data: undefined };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'WRITE_ERROR',
          message: error instanceof Error ? error.message : 'Write operation failed',
        },
      };
    }
  }

  async createNote(path: string, content: string): Promise<Result<void>> {
    const safe = this.safePath(path);
    if (!safe.success) return safe;

    try {
      await fs.writeFile(safe.data, content);
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
    const safe = this.safePath(path);
    if (!safe.success) return safe;

    try {
      const fileContent = await fs.readFile(safe.data, 'utf-8');
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

  async searchNotes(query: string): Promise<Result<string>> {
    try {
      const { stdout } = await execAsync('grep', ['-r', query, this.vaultPath]);
      return { success: true, data: stdout };
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error) {
        if (error.code === 1) {
          // No matches found — not an error, just empty result
          return { success: true, data: '' };
        }
      }

      return {
        success: false,
        error: { code: 'SEARCH_ERROR', message: (error as Error).message },
      };
    }
  }
}
