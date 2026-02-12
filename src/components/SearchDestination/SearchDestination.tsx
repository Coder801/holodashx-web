import { MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./styles.module.scss";
import type { SearchDestinationProps } from "./types";

export const SearchDestination = ({
  onStartNavigation,
}: SearchDestinationProps) => {
  const [search, setSearch] = useState("");
  const [predictions, setPredictions] = useState<
    google.maps.places.AutocompletePrediction[]
  >([]);

  const filteredSuggestions = predictions.map(
    (prediction) => (prediction as any)?.placePrediction?.text?.text || "",
  );

  const handleSelectDestination = (destination: string) => {
    setSearch("");
    onStartNavigation(destination);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    fetch("https://places.googleapis.com/v1/places:autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": "AIzaSyByCY6SUZWeytjizQ4Y4I29rteq6f4kdzI",
      },
      body: JSON.stringify({
        input: value,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPredictions(data.suggestions || []);
      });
  };

  useEffect(() => {
    console.log("Predictions:", predictions);
  }, [predictions]);

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

      {/* {!predictions.length && (
        <div className={styles.recentPlaces}>
          <div className={styles.recentHeader}>
            <Clock />
            <h3>Recent & Favorites</h3>
          </div>
          <div className={styles.recentList}>
            {recentPlaces.map((place, index) => (
              <button
                key={index}
                onClick={() => handleSelectDestination(place.name)}
                className={styles.placeButton}
              >
                <div className={styles.placeIconWrapper}>
                  <place.icon />
                </div>
                <div className={styles.placeInfo}>
                  <div className={styles.placeName}>{place.name}</div>
                  <div className={styles.placeAddress}>{place.address}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
};
