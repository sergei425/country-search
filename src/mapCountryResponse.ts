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
  void dto;
  return {
    name: '',
    capital: '',
    region: '',
    population: 0,
    flagUrl: '',
    currencies: '',
    languages: '',
  };
}
