import { describe, it, expect } from 'vitest';
import { HttpError, classifyError } from './errors.js';

describe('classifyError', () => {
  it('identifies AbortError as silent non-retryable cancellation', () => {
    const error = new DOMException('The operation was aborted', 'AbortError');
    const result = classifyError(error);

    expect(result).toEqual({
      kind: 'abort',
      message: 'Request canceled',
      canRetry: false,
    });
  });

  it('identifies TimeoutError as retryable timeout error', () => {
    const error = new DOMException('The operation timed out', 'TimeoutError');
    const result = classifyError(error);

    expect(result).toEqual({
      kind: 'timeout',
      message: 'The server response timed out',
      canRetry: true,
    });
  });

  it('identifies HttpError as retryable server error with status code', () => {
    const error = new HttpError(502, 'Bad Gateway');
    const result = classifyError(error);

    expect(result).toEqual({
      kind: 'http',
      message: 'Server error (code 502)',
      canRetry: true,
      status: 502,
    });
  });

  it('identifies TypeError or unknown network error as retryable network failure', () => {
    const error = new TypeError('Failed to fetch');
    const result = classifyError(error);

    expect(result).toEqual({
      kind: 'network',
      message: 'Network error. Check your internet connection.',
      canRetry: true,
    });
  });
});
