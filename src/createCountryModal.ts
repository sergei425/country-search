import type { Country } from './mapCountryResponse.js';

export function createCountryModal(country: Country): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'modal-content';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'modal-close';
  closeBtn.textContent = 'Close';
  closeBtn.addEventListener('click', () => overlay.remove());

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  const title = document.createElement('h2');
  title.textContent = country.name;

  const flag = document.createElement('img');
  flag.src = country.flagUrl;
  flag.alt = `Flag ${country.name}`;
  flag.className = 'modal-flag';

  const details = document.createElement('dl');
  details.className = 'country-details';

  const fields: Array<[string, string | number]> = [
    ['Capital', country.capital],
    ['Region', country.region],
    ['Population', country.population],
    ['Languages', country.languages],
    ['Currencies', country.currencies],
  ];

  for (const [label, value] of fields) {
    const dt = document.createElement('dt');
    dt.textContent = label;
    const dd = document.createElement('dd');
    dd.textContent = String(value);
    details.append(dt, dd);
  }

  modal.append(closeBtn, title);
  if (country.flagUrl) {
    modal.append(flag);
  }
  modal.append(details);
  overlay.append(modal);

  return overlay;
}
