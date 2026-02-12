import { GoogleMap } from "@react-google-maps/api";
import { MapPin, Navigation } from "lucide-react";
import { useEffect, useState } from "react";

import styles from "./styles.module.scss";
import type { NavigationMapProps } from "./types";

export const NavigationMap = ({
  isNavigating,
  isLoaded,
  // destination: _destination,
}: NavigationMapProps) => {
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [position, setPosition] = useState({ x: 50, y: 80 });
  const center = { lat: 50.4501, lng: 30.5234 };

  useEffect(() => {
    if (isNavigating) {
      const speedInterval = setInterval(() => {
        setCurrentSpeed(Math.floor(Math.random() * 30) + 40);
      }, 2000);

      const moveInterval = setInterval(() => {
        setPosition((prev) => ({
          x: prev.x + (Math.random() - 0.5) * 2,
          y: Math.max(20, prev.y - 0.5),
        }));
      }, 100);

      return () => {
        clearInterval(speedInterval);
        clearInterval(moveInterval);
      };
    }
  }, [isNavigating]);

  return (
    <div className={styles.wrapper}>
      {/* <svg className={styles.grid}>
        <defs>
          <pattern
            id="grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="gray"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg> */}

      {isLoaded && (
        <GoogleMap
          mapContainerStyle={{
            width: "100%",
            height: "100%",
            filter: isNavigating ? "grayscale(80%) brightness(90%)" : "none",
          }}
          center={center}
          zoom={10}
        />
      )}

      {isNavigating && (
        <svg className={styles.roadSvg}>
          <path
            d={`M ${position.x}% ${position.y}% Q 50% 50%, 50% 10%`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d={`M ${position.x}% ${position.y}% Q 50% 50%, 50% 10%`}
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="20,15"
            strokeLinecap="round"
            opacity="0.8"
          />
        </svg>
      )}

      {isNavigating && (
        <div className={styles.destinationMarker}>
          <MapPin />
        </div>
      )}

      <div
        className={styles.carPosition}
        style={{ left: `${position.x}%`, top: `${position.y}%` }}
      >
        <div className={styles.carPositionInner}>
          <div className={styles.compassRing} />
          <div className={styles.carIcon}>
            <Navigation style={{ transform: "rotate(0deg)" }} />
          </div>
        </div>
      </div>

      {isNavigating && (
        <div className={styles.speedIndicator}>
          <div className={styles.speedLabel}>Speed</div>
          <div className={styles.speedValue}>{currentSpeed}</div>
          <div className={styles.speedUnit}>km/h</div>
        </div>
      )}

      <div className={styles.compass}>
        <div className={styles.compassInner}>
          <div className={styles.compassN}>N</div>
          <div className={styles.compassS}>S</div>
          <div className={styles.compassW}>W</div>
          <div className={styles.compassE}>E</div>
        </div>
      </div>

      {isNavigating && (
        <>
          <div className={styles.streetMain}>Main St</div>
          <div className={styles.streetOak}>Oak Ave</div>
        </>
      )}
    </div>
  );
};
