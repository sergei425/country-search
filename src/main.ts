import { debounce } from './debounce.js';
import { SearchController, type AppState } from './searchController.js';
import { createCountryCard } from './createCountryCard.js';

const DEBOUNCE_DELAY_MS = 300;

export function initApp(root: HTMLElement = document.body): void {
  const container = document.createElement('main');
  container.className = 'app-container';

  const heading = document.createElement('h1');
  heading.textContent = 'Search for countries';

  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'search-input';
  input.placeholder = 'Enter the name of a country (for example, Spain)...';
  input.setAttribute('aria-label', 'Search for a country');

  const statusArea = document.createElement('div');
  statusArea.className = 'status-area';

  const resultsGrid = document.createElement('section');
  resultsGrid.className = 'results-grid';

  let lastQuery = '';

  const render = (state: AppState): void => {
    statusArea.replaceChildren();
    resultsGrid.replaceChildren();

    if (state.status === 'idle') {
      return;
    }

    if (state.status === 'loading') {
      const loader = document.createElement('p');
      loader.className = 'status-loading';
      loader.textContent = 'Loading results...';
      statusArea.append(loader);
      return;
    }

    if (state.status === 'empty') {
      const emptyBox = document.createElement('div');
      emptyBox.className = 'status-empty';
      emptyBox.textContent = 'Nothing found. Try changing your search query.';
      statusArea.append(emptyBox);
      return;
    }

    if (state.status === 'error') {
      const errorBox = document.createElement('div');
      errorBox.className = 'status-error';

      const msg = document.createElement('p');
      msg.textContent = state.errorMessage ?? 'An error occurred during the search.';
      errorBox.append(msg);

      if (state.canRetry) {
        const retryBtn = document.createElement('button');
        retryBtn.type = 'button';
        retryBtn.className = 'retry-btn';
        retryBtn.textContent = 'Repeat';
        retryBtn.addEventListener('click', () => {
          void controller.search(lastQuery);
        });
        errorBox.append(retryBtn);
      }

      statusArea.append(errorBox);
      return;
    }

    if (state.status === 'success') {
      const cards = state.countries.map(createCountryCard);
      resultsGrid.append(...cards);
    }
  };

  const controller = new SearchController(render);

  const handleDebouncedSearch = debounce((value: string) => {
    void controller.search(value);
  }, DEBOUNCE_DELAY_MS);

  input.addEventListener('input', () => {
    lastQuery = input.value;
    if (!lastQuery.trim()) {
      void controller.search('');
      return;
    }
    handleDebouncedSearch(lastQuery);
  });

  container.append(heading, input, statusArea, resultsGrid);
  root.append(container);
}

initApp();
