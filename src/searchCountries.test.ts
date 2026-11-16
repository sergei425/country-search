import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchCountries } from './searchCountries.js';
import { HttpError } from './errors.js';

describe('searchCountries', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls fetch with encoded query and AbortSignal, returning parsed countries', async () => {
    const mockCountries = [{ name: { common: 'South Africa' } }];
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockCountries,
    });
    vi.stubGlobal('fetch', mockFetch);

    const controller = new AbortController();
    const result = await searchCountries('South Africa', controller.signal);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledOptions] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(calledUrl).toBe('https://countries.dev/name/South%20Africa');
    expect(calledOptions.signal).toBe(controller.signal);
    expect(result).toEqual(mockCountries);
  });

  it('returns an empty array when API responds with 404 (no matches found)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: 'Not Found' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const result = await searchCountries('UnknownCountry');
    expect(result).toEqual([]);
  });

  it('throws HttpError when response.ok is false and status is not 404 (e.g. 500)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(searchCountries('Germany')).rejects.toThrow(HttpError);
    await expect(searchCountries('Germany')).rejects.toMatchObject({
      status: 500,
    });
  });

  it('propagates AbortError when request is aborted via signal', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    const mockFetch = vi.fn().mockRejectedValue(abortError);
    vi.stubGlobal('fetch', mockFetch);

    const controller = new AbortController();
    controller.abort();

    await expect(searchCountries('Germany', controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });
});
