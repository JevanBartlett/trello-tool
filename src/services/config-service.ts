import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import type { Result } from '../types/result.js';

// =============================================================================
// SCHEMA: Defines the shape of ~/.ctx/config.json
// Zod validates at runtime that the file matches this structure.
// z.string().optional() means: if present, must be string; if missing, that's ok
// =============================================================================
const TrelloConfigSchema = z.object({
  defaultBoardId: z.string().optional(),
  defaultInboxListId: z.string().optional(),
});

const ObsidianConfigSchema = z.object({
  defaultVaultPath: z.string().optional(),
});

const ConfigSchema = z.object({
  trello: TrelloConfigSchema.optional(),
  obsidian: ObsidianConfigSchema.optional(),
});

// Infer TypeScript type from Zod schema — keeps them in sync automatically
// Config = { defaultBoardId?: string; defaultInboxListId?: string }
type Config = z.infer<typeof ConfigSchema>;

export class ConfigService {
  // Where config lives: ~/.ctx/config.json
  private configDir: string;
  private configPath: string;

  // join() builds paths safely across OS (handles slashes for you)
  // homedir() returns /Users/josh on Mac, /home/josh on Linux, etc.
  constructor() {
    this.configDir = join(homedir(), '.ctx');
    this.configPath = join(this.configDir, 'config.json');
  }

  // ---------------------------------------------------------------------------
  // ensureConfigDir: Creates ~/.ctx/ folder if it doesn't exist
  // chmod 0o700 = owner can read/write/execute, no one else can access
  // Called before any write operation
  // ---------------------------------------------------------------------------
  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
      chmodSync(this.configDir, 0o700);
    }
  }

  // ---------------------------------------------------------------------------
  // saveConfig: Writes the entire config object to disk
  // - Ensures directory exists first
  // - JSON.stringify with (config, null, 2) = pretty-print with 2-space indent
  // - chmod 0o600 = owner can read/write, no one else can access
  // - Returns Result<void> so caller knows if it worked
  // ---------------------------------------------------------------------------
  private saveConfig(config: Config): Result<void> {
    this.ensureConfigDir();

    try {
      writeFileSync(this.configPath, JSON.stringify(config, null, 2));
      chmodSync(this.configPath, 0o600);
      return { success: true, data: undefined };
    } catch {
      return {
        success: false,
        error: { code: 'WRITE_ERROR', message: 'Failed to write config file' },
      };
    }
  }

  // ---------------------------------------------------------------------------
  // getConfig: Reads and validates the config file
  // - If file doesn't exist, returns empty object {} (not an error)
  // - Parses JSON, then validates against Zod schema
  // - safeParse() returns { success, data } or { success, error } — never throws
  // ---------------------------------------------------------------------------
  getConfig(): Result<Config> {
    if (!existsSync(this.configPath)) {
      return { success: true, data: {} };
    }

    const rawFile = readFileSync(this.configPath, 'utf-8');

    try {
      const jsonFile: unknown = JSON.parse(rawFile);
      const parsedFile = ConfigSchema.safeParse(jsonFile);

      if (!parsedFile.success) {
        return {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'Invalid config format' },
        };
      }

      return { success: true, data: parsedFile.data };
    } catch {
      return {
        success: false,
        error: { code: 'PARSE_ERROR', message: 'Config file is not valid JSON' },
      };
    }
  }

  // ---------------------------------------------------------------------------
  // setDefaultBoard: Updates the defaultBoardId in config
  // Pattern: read current → merge new value → write back
  // Spread operator (...) copies all existing fields, then overwrites one
  // ---------------------------------------------------------------------------
  setTrelloDefaultBoard(boardId: string): Result<void> {
    const configResult = this.getConfig();
    if (!configResult.success) {
      return configResult;
    }
    const updatedConfig = {
      ...configResult.data,
      trello: { ...configResult.data.trello, defaultBoardId: boardId },
    };
    return this.saveConfig(updatedConfig);
  }

  // ---------------------------------------------------------------------------
  // setDefaultInbox: Updates the defaultInboxListId in config
  // Same pattern as setDefaultBoard — read, merge, write
  // ---------------------------------------------------------------------------
  setTrelloDefaultInbox(listId: string): Result<void> {
    const configResult = this.getConfig();
    if (!configResult.success) {
      return configResult;
    }
    const updatedConfig = {
      ...configResult.data,
      trello: { ...configResult.data.trello, defaultInboxListId: listId },
    };
    return this.saveConfig(updatedConfig);
  }

  setObsidianVaultPath(path: string): Result<void> {
    const configResult = this.getConfig();
    if (!configResult.success) {
      return configResult;
    }
    const updatedConfig = {
      ...configResult.data,
      obsidian: { ...configResult.data.obsidian, defaultVaultPath: path },
    };
    return this.saveConfig(updatedConfig);
  }
}
