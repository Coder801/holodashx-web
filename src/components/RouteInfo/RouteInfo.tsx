import { useEffect, useState } from "react";
import { ArrowUp, Clock, Navigation2 } from "lucide-react";
import type { RouteInfoProps } from "./types";
import styles from "./styles.module.scss";

export const RouteInfo = ({ destination }: RouteInfoProps) => {
  const [distance, setDistance] = useState(5.8);
  const [eta, setEta] = useState(12);

  useEffect(() => {
    const interval = setInterval(() => {
      setDistance((prev) => Math.max(0, prev - 0.05));
      setEta((prev) => Math.max(0, prev - 0.1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.turnInstruction}>
        <div className={styles.turnRow}>
          <div className={styles.turnIcon}>
            <ArrowUp />
          </div>
          <div className={styles.turnInfo}>
            <div className={styles.turnDistance}>In 400m</div>
            <div className={styles.turnText}>Continue on Main Street</div>
          </div>
        </div>
      </div>

      <div className={styles.tripInfo}>
        <div className={styles.tripCell}>
          <div className={styles.tripLabel}>Distance</div>
          <div className={styles.tripValue}>{distance.toFixed(1)} km</div>
        </div>
        <div className={styles.tripCellMiddle}>
          <div className={styles.tripLabel}>
            <Clock />
            ETA
          </div>
          <div className={styles.tripValue}>{Math.floor(eta)} min</div>
        </div>
        <div className={styles.tripCell}>
          <div className={styles.tripLabel}>Arrival</div>
          <div className={styles.tripValue}>
            {new Date(Date.now() + eta * 60000).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </div>
        </div>
      </div>

      <div className={styles.destination}>
        <div className={styles.destinationBox}>
          <Navigation2 />
          <div className={styles.destinationInfo}>
            <div className={styles.destinationLabel}>Destination</div>
            <div className={styles.destinationName}>{destination}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
