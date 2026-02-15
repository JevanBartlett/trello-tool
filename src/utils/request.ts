import { z } from 'zod';
import type { Result } from '../types/result.js';

export async function request<T>(
  url: string,
  schema: z.ZodSchema<T>,
  options?: RequestInit,
): Promise<Result<T>> {
  let response: Response;

  try {
    response = await fetch(url, options);
  } catch {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to Trello API',
      },
    };
  }

  if (!response.ok) {
    return {
      success: false,
      error: {
        code: 'API_ERROR',
        message: `Request failed with status ${response.status}`,
      },
    };
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    return {
      success: false,
      error: {
        code: 'PARSE_ERROR',
        message: 'Response was not valid JSON',
      },
    };
  }
  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid response from Trello API',
      },
    };
  }

  return {
    success: true,
    data: parsed.data,
  };
}
