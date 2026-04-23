import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getListings,
  saveListings,
  getFavorites,
  saveFavorites,
  getOffers,
  saveOffers
} from '../utils/storage';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [listings, setListings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    setListings(getListings());
    setFavorites(getFavorites());
    setOffers(getOffers());
  }, []);

  useEffect(() => {
    if (listings.length) {
      saveListings(listings);
    }
  }, [listings]);

  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  useEffect(() => {
    saveOffers(offers);
  }, [offers]);

  const addListing = (listing) => {
    setListings((prev) => [listing, ...prev]);
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const sendOffer = (offer) => {
    setOffers((prev) => [offer, ...prev]);
  };

  const favoriteListings = useMemo(() => {
    return listings.filter((item) => favorites.includes(item.id));
  }, [listings, favorites]);

  return (
    <AppContext.Provider
      value={{
        listings,
        favorites,
        offers,
        addListing,
        toggleFavorite,
        sendOffer,
        favoriteListings
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}