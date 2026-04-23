import { seedListings } from '../data/seed';

const LISTINGS_KEY = 'zeroWasteListings';
const FAVORITES_KEY = 'zeroWasteFavorites';
const OFFERS_KEY = 'zeroWasteOffers';

export function getListings() {
  const raw = localStorage.getItem(LISTINGS_KEY);

  if (!raw) {
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(seedListings));
    return seedListings;
  }

  return JSON.parse(raw);
}

export function saveListings(listings) {
  localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

export function getFavorites() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveFavorites(favorites) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function getOffers() {
  const raw = localStorage.getItem(OFFERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function saveOffers(offers) {
  localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
}