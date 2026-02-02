import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { z } from 'zod';
import type { Result } from '../types/result.js';

const ConfigSchema = z.object({
  defaultBoardId: z.string().optional(),
  defaultInboxListId: z.string().optional(),
});

type Config = z.infer<typeof ConfigSchema>;

export class ConfigService {
  private configDir: string;
  private configPath: string;

  constructor() {
    this.configDir = join(homedir(), '.ctx');
    this.configPath = join(this.configDir, 'config.json');
  }

  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
      chmodSync(this.configDir, 0o700);
    }
  }

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

  setDefaultBoard(boardId: string): Result<void> {
    const configResult = this.getConfig();
    if (!configResult.success) {
      return configResult;
    }
    const updatedConfig = { ...configResult.data, defaultBoardId: boardId };
    return this.saveConfig(updatedConfig);
  }

  setDefaultInbox(listId: string): Result<void> {
    const configResult = this.getConfig();
    if (!configResult.success) {
      return configResult;
    }
    const updatedConfig = { ...configResult.data, defaultInboxListId: listId };
    return this.saveConfig(updatedConfig);
  }
}
