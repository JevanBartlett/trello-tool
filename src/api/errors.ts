export class TrelloApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string,
  ) {
    super(message);
    this.name = 'TrelloApiError';
  }
}
