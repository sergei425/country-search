import { searchCountries } from './searchCountries.js';
import { mapCountryResponse, type Country, type CountryApiDto } from './mapCountryResponse.js';
import { classifyError } from './errors.js';

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

  private currentController: AbortController | null = null;
  private onStateChange?: (state: AppState) => void;

  constructor(onStateChange?: (state: AppState) => void) {
    this.onStateChange = onStateChange;
  }

  public getState(): AppState {
    return this.state;
  }

  private setState(nextState: AppState): void {
    this.state = nextState;
    this.onStateChange?.(this.state);
  }

  public async search(query: string): Promise<void> {
    const trimmed = query.trim();

    if (this.currentController) {
      this.currentController.abort();
    }

    if (!trimmed) {
      this.currentController = null;
      this.setState({
        status: 'idle',
        countries: [],
        errorMessage: null,
        canRetry: false,
      });
      return;
    }

    const controller = new AbortController();
    this.currentController = controller;

    this.setState({
      status: 'loading',
      countries: [],
      errorMessage: null,
      canRetry: false,
    });

    try {
      const rawList = await searchCountries(trimmed, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      const countries = (rawList as CountryApiDto[]).map(mapCountryResponse);

      this.setState({
        status: countries.length > 0 ? 'success' : 'empty',
        countries,
        errorMessage: null,
        canRetry: false,
      });
    } catch (error: unknown) {
      const classified = classifyError(error);

      if (classified.kind === 'abort') {
        return;
      }

      this.setState({
        status: 'error',
        countries: [],
        errorMessage: classified.message,
        canRetry: classified.canRetry,
      });
    }
  }
}
