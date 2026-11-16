export interface CountryApiDto {
  name?: string;
  capital?: string;
  region?: string;
  subregion?: string;
  population?: number;
  area?: number;
  flags?: {
    svg?: string;
    png?: string;
  };
  currencies?: Array<{
    code?: string;
    name?: string;
    symbol?: string;
  }>;
  languages?: Array<{
    name?: string;
    nativeName?: string;
  }>;
}

export interface Country {
  name: string;
  capital: string;
  region: string;
  population: number;
  flagUrl: string;
  currencies: string;
  languages: string;
}

export function mapCountryResponse(dto: CountryApiDto): Country {
  const currenciesList =
    dto.currencies
      ?.map((c) => {
        const title = c.name ?? c.code ?? '';
        if (!title) return '';
        return c.symbol ? `${title} (${c.symbol})` : title;
      })
      .filter(Boolean)
      .join(', ') ?? '';

  const languagesList =
    dto.languages
      ?.map((l) => l.name)
      .filter(Boolean)
      .join(', ') ?? '';

  return {
    name: dto.name ?? 'An Unknown Country',
    capital: dto.capital || 'No data',
    region: dto.region || 'Not specified',
    population: dto.population ?? 0,
    flagUrl: dto.flags?.svg ?? dto.flags?.png ?? '',
    currencies: currenciesList || 'No data',
    languages: languagesList || 'No data',
  };
}
