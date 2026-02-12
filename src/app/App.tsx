import type { Libraries } from "@react-google-maps/api";
import { useJsApiLoader } from "@react-google-maps/api";
import { useState } from "react";

import { Login } from "../components/Login";
import { NavigationControls } from "../components/NavigationControls";
import { NavigationMap } from "../components/NavigationMap";
import { RouteInfo } from "../components/RouteInfo";
import { SearchDestination } from "../components/SearchDestination";
import { Settings } from "../components/Settings";
import styles from "./styles.module.scss";

const libraries: Libraries = ["places"];

export default function App() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyByCY6SUZWeytjizQ4Y4I29rteq6f4kdzI",
    libraries,
  });

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setIsNavigating(false);
    setDestination("");
    setShowSettings(false);
  };

  const handleStartNavigation = (dest: string) => {
    setDestination(dest);
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setDestination("");
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <NavigationMap
          isNavigating={isNavigating} /* destination={destination} */
          isLoaded={isLoaded}
        />

        {!isNavigating && (
          <div className={styles.searchOverlay}>
            <SearchDestination onStartNavigation={handleStartNavigation} />
          </div>
        )}

        {isNavigating && (
          <div className={styles.routeInfoOverlay}>
            <RouteInfo destination={destination} />
          </div>
        )}
      </div>

      <NavigationControls
        isNavigating={isNavigating}
        onStopNavigation={handleStopNavigation}
        onOpenSettings={() => setShowSettings(true)}
        username={username}
      />

      {showSettings && (
        <Settings
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
          username={username}
        />
      )}
    </div>
  );
}
