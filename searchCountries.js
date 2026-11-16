import { HttpError } from './errors.js';
const BASE_URL = 'https://countries.dev/name';
export async function searchCountries(query, signal) {
    const encodedQuery = encodeURIComponent(query.trim());
    const response = await fetch(`${BASE_URL}/${encodedQuery}`, { signal });
    if (response.status === 404) {
        return [];
    }
    if (!response.ok) {
        throw new HttpError(response.status, `Request failed with status ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
}
