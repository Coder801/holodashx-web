import { APIProvider } from "@vis.gl/react-google-maps";
import { useCallback, useState } from "react";

// import { Login } from "../components/Login";
import { NavigationControls } from "../components/NavigationControls";
import { NavigationMap } from "../components/NavigationMap";
import type { RouteData } from "../components/NavigationMap/types";
import { RouteInfo } from "../components/RouteInfo";
import { SearchDestination } from "../components/SearchDestination";
import { Settings } from "../components/Settings";
import styles from "./styles.module.scss";

const libraries = ["places"];

export default function App() {
  const [isNavigating, setIsNavigating] = useState(false);
  const [destination, setDestination] = useState("");
  // const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);

  const handleRouteData = useCallback((data: RouteData) => {
    setRouteData(data);
  }, []);

  // const { isLoaded } = useJsApiLoader({
  //   googleMapsApiKey: "AIzaSyByCY6SUZWeytjizQ4Y4I29rteq6f4kdzI",
  //   libraries,
  //   mapIds: ["5db81f2399a01b852988cb46"],
  // });

  // const handleLogin = (user: string) => {
  //   setUsername(user);
  //   setIsLoggedIn(true);
  // };

  const handleLogout = () => {
    // setIsLoggedIn(false);
    setUsername("");
    setIsNavigating(false);
    setDestination("");
    setShowSettings(false);
  };

  const handleSelectDestination = (dest: string) => {
    setDestination(dest);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setDestination("");
  };

  // if (!isLoggedIn) {
  //   return <Login onLogin={handleLogin} />;
  // }

  return (
    <APIProvider
      apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={libraries}
    >
      <div className={styles.app}>
        <div className={styles.container}>
          <NavigationMap
            isNavigating={isNavigating}
            destination={destination}
            onRouteData={handleRouteData}
          />

          {!destination && (
            <div className={styles.searchOverlay}>
              <SearchDestination onStartNavigation={handleSelectDestination} />
            </div>
          )}

          {destination && routeData && (
            <div className={styles.routeInfoOverlay}>
              <RouteInfo destination={destination} routeData={routeData} />
            </div>
          )}
        </div>
        <NavigationControls
          isNavigating={isNavigating}
          hasRoute={!!destination}
          onStartNavigation={handleStartNavigation}
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
    </APIProvider>
  );
}
