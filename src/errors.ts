export class HttpError extends Error {
  public readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `HTTP Error: ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

export type AppErrorKind = 'abort' | 'timeout' | 'http' | 'network';

export interface ClassifiedError {
  kind: AppErrorKind;
  message: string;
  canRetry: boolean;
  status?: number;
}

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof DOMException || error instanceof Error) {
    if (error.name === 'AbortError') {
      return {
        kind: 'abort',
        message: 'Request canceled',
        canRetry: false,
      };
    }

    if (error.name === 'TimeoutError') {
      return {
        kind: 'timeout',
        message: 'The server response timed out',
        canRetry: true,
      };
    }
  }

  if (error instanceof HttpError) {
    return {
      kind: 'http',
      message: `Server error (code ${error.status})`,
      canRetry: true,
      status: error.status,
    };
  }

  return {
    kind: 'network',
    message: 'Network error. Check your internet connection.',
    canRetry: true,
  };
}
