import { Clock, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./styles.module.scss";
import type { SearchDestinationProps } from "./types";

const RECENT_KEY = "holodashx:recent-destinations";
const MAX_RECENT = 3;

function getRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecent(destination: string) {
  const recent = getRecent().filter((d) => d !== destination);
  recent.unshift(destination);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export const SearchDestination = ({
  onStartNavigation,
}: SearchDestinationProps) => {
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);
  const [recent, setRecent] = useState<string[]>(getRecent);

  const filteredSuggestions = predictions.map(
    (prediction) => (prediction as any)?.placePrediction?.text?.text || "",
  );

  const handleSelectDestination = (destination: string) => {
    saveRecent(destination);
    setRecent(getRecent());
    setSearch("");
    onStartNavigation(destination);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    if (!value) {
      setPredictions([]);
    }
  };

  useEffect(() => {
    if (!search) {
      return;
    }

    const timer = setTimeout(() => {
      fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        },
        body: JSON.stringify({
          input: search,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          setPredictions(data.suggestions || []);
        });
    }, 1000);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.searchBox}>
        <div className={styles.searchInputRow}>
          <Search className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Where to?"
            value={search}
            onChange={handleChange}
            className={styles.searchInput}
          />
        </div>

        {!!predictions.length && search && (
          <div className={styles.suggestions}>
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelectDestination(suggestion)}
                className={styles.suggestionButton}
              >
                <MapPin />
                <span>{suggestion}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!search && recent.length > 0 && (
        <div className={styles.recentPlaces}>
          <div className={styles.recentHeader}>
            <Clock />
            <h3>Recent</h3>
          </div>
          <div className={styles.recentList}>
            {recent.map((place, index) => (
              <button
                key={index}
                onClick={() => handleSelectDestination(place)}
                className={styles.placeButton}
              >
                <div className={styles.placeIconWrapper}>
                  <Clock />
                </div>
                <div className={styles.placeInfo}>
                  <div className={styles.placeName}>{place}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
