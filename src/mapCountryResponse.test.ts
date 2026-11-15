import { describe, it, expect } from 'vitest';
import { mapCountryResponse, type CountryApiDto } from './mapCountryResponse.js';

describe('mapCountryResponse', () => {
  it('maps full API response object to clean Country model', () => {
    const rawDto: CountryApiDto = {
      name: 'South Africa',
      capital: 'Pretoria',
      region: 'Africa',
      population: 59308690,
      flags: {
        png: 'https://flagcdn.com',
        svg: 'https://flagcdn.com',
      },
      currencies: [{ code: 'ZAR', name: 'South African rand', symbol: 'R' }],
      languages: [{ name: 'Afrikaans' }, { name: 'English' }],
    };

    expect(mapCountryResponse(rawDto)).toEqual({
      name: 'South Africa',
      capital: 'Pretoria',
      region: 'Africa',
      population: 59308690,
      flagUrl: 'https://flagcdn.com',
      currencies: 'South African rand (R)',
      languages: 'Afrikaans, English',
    });
  });

  it('provides safe fallback values when optional fields are missing', () => {
    const minimalDto: CountryApiDto = {
      name: 'Antarctica',
    };

    expect(mapCountryResponse(minimalDto)).toEqual({
      name: 'Antarctica',
      capital: 'Нет данных',
      region: 'Не указан',
      population: 0,
      flagUrl: '',
      currencies: 'Нет данных',
      languages: 'Нет данных',
    });
  });

  it('falls back to png flag when svg flag is unavailable', () => {
    const dtoWithPngOnly: CountryApiDto = {
      name: 'Testland',
      flags: {
        png: 'https://flagcdn.com',
      },
    };

    expect(mapCountryResponse(dtoWithPngOnly).flagUrl).toBe('https://flagcdn.com');
  });
});
