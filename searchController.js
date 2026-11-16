import { searchCountries } from './searchCountries.js';
import { mapCountryResponse } from './mapCountryResponse.js';
import { classifyError } from './errors.js';
export class SearchController {
    state = {
        status: 'idle',
        countries: [],
        errorMessage: null,
        canRetry: false,
    };
    currentController = null;
    onStateChange;
    constructor(onStateChange) {
        this.onStateChange = onStateChange;
    }
    getState() {
        return this.state;
    }
    setState(nextState) {
        this.state = nextState;
        this.onStateChange?.(this.state);
    }
    async search(query) {
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
            const countries = rawList.map(mapCountryResponse);
            this.setState({
                status: countries.length > 0 ? 'success' : 'empty',
                countries,
                errorMessage: null,
                canRetry: false,
            });
        }
        catch (error) {
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
