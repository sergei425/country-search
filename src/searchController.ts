import type { Country } from './mapCountryResponse.js';

export interface AppState {
  status: 'idle' | 'loading' | 'success' | 'empty' | 'error';
  countries: Country[];
  errorMessage: string | null;
  canRetry: boolean;
}

export class SearchController {
  private state: AppState = {
    status: 'idle',
    countries: [],
    errorMessage: null,
    canRetry: false,
  };

  private onStateChange?: (state: AppState) => void;

  constructor(onStateChange?: (state: AppState) => void) {
    this.onStateChange = onStateChange;
  }

  public getState(): AppState {
    return this.state;
  }

  public async search(query: string): Promise<void> {
    void query;
  }
}
