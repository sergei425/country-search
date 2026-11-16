import { createCountryModal } from './createCountryModal.js';
export function createCountryCard(country) {
    const card = document.createElement('article');
    card.className = 'country-card';
    card.tabIndex = 0;
    if (country.flagUrl) {
        const img = document.createElement('img');
        img.src = country.flagUrl;
        img.alt = `Flag ${country.name}`;
        img.className = 'card-flag';
        // img.width = 260;
        // img.height = 180;
        card.append(img);
    }
    const body = document.createElement('div');
    body.className = 'card-body';
    const title = document.createElement('h3');
    title.textContent = country.name;
    const capital = document.createElement('p');
    capital.textContent = `Capital: ${country.capital}`;
    const region = document.createElement('p');
    region.textContent = `Region: ${country.region}`;
    const population = document.createElement('p');
    population.textContent = `Population: ${country.population}`;
    body.append(title, capital, region, population);
    card.append(body);
    const openDetails = () => {
        document.body.append(createCountryModal(country));
    };
    card.addEventListener('click', openDetails);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openDetails();
        }
    });
    return card;
}
