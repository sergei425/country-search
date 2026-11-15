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
  void error;
  return {
    kind: 'network',
    message: '',
    canRetry: false,
  };
}
