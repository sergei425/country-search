import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchController } from './searchController.js';

interface DeferredResponse {
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  promise: Promise<unknown>;
  signal?: AbortSignal;
}

function createAbortableDeferred(signal?: AbortSignal): DeferredResponse {
  let resolve!: (value: unknown) => void;
  let reject!: (reason?: unknown) => void;

  const promise = new Promise<unknown>((res, rej) => {
    resolve = res;
    reject = rej;

    if (signal) {
      if (signal.aborted) {
        rej(new DOMException('The operation was aborted', 'AbortError'));
        return;
      }

      signal.addEventListener(
        'abort',
        () => {
          rej(new DOMException('The operation was aborted', 'AbortError'));
        },
        { once: true }
      );
    }
  });

  return { resolve, reject, promise, signal };
}

describe('Race condition handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('aborts the earlier request via signal and keeps only the latest query result when earlier resolves later', async () => {
    const requests: DeferredResponse[] = [];

    const mockFetch = vi.fn((_url: string, options?: RequestInit) => {
      const deferred = createAbortableDeferred(options?.signal);
      requests.push(deferred);
      return deferred.promise;
    });

    vi.stubGlobal('fetch', mockFetch);

    const controller = new SearchController();

    // Запускаем первый (более ранний) запрос
    const firstSearch = controller.search('Ger');
    expect(requests).toHaveLength(1);
    expect(requests[0].signal?.aborted).toBe(false);

    // Запускаем второй (более поздний) запрос, пока первый ещё выполняется
    const secondSearch = controller.search('Germany');
    expect(requests).toHaveLength(2);

    // Проверяем, что первый запрос был реально отменён через AbortController
    expect(requests[0].signal?.aborted).toBe(true);
    expect(requests[1].signal?.aborted).toBe(false);

    // Второй (более поздний) запрос резолвится ПЕРВЫМ
    requests[1].resolve({
      ok: true,
      status: 200,
      json: async () => [
        {
          name: 'Germany',
          capital: 'Berlin',
          region: 'Europe',
          population: 83240525,
          flags: { svg: 'https://flagcdn.com' },
          currencies: [{ code: 'EUR', name: 'Euro', symbol: '€' }],
          languages: [{ name: 'German' }],
        },
      ],
    });

    await secondSearch;

    // Первый (устаревший) запрос резолвится ПОЗЖЕ
    requests[0].resolve({
      ok: true,
      status: 200,
      json: async () => [
        {
          name: 'Algeria',
          capital: 'Algiers',
          region: 'Africa',
          population: 44700000,
          flags: { svg: 'https://flagcdn.com' },
          currencies: [{ code: 'DZD', name: 'Algerian dinar', symbol: 'د.ج' }],
          languages: [{ name: 'Arabic' }],
        },
      ],
    });

    await firstSearch;

    // Итоговое состояние приложения содержит ТОЛЬКО результат последнего запроса
    const finalState = controller.getState();
    expect(finalState.status).toBe('success');
    expect(finalState.errorMessage).toBeNull();
    expect(finalState.countries).toHaveLength(1);
    expect(finalState.countries[0].name).toBe('Germany');
  });
});
