import { ArrowUp, Clock, Navigation2 } from "lucide-react";

import styles from "./styles.module.scss";
import type { RouteInfoProps } from "./types";

export const RouteInfo = ({ destination, routeData }: RouteInfoProps) => {
  const distanceKm = routeData?.distanceKm ?? 0;
  const durationMin = routeData?.durationMin ?? 0;
  const turnInstruction = routeData?.turnInstruction ?? "";
  const turnDistance = routeData?.turnDistance ?? "";

  return (
    <div className={styles.wrapper}>
      <div className={styles.turnInstruction}>
        <div className={styles.turnRow}>
          <div className={styles.turnIcon}>
            <ArrowUp />
          </div>
          <div className={styles.turnInfo}>
            <div className={styles.turnDistance}>{turnDistance}</div>
            <div className={styles.turnText}>{turnInstruction}</div>
          </div>
        </div>
      </div>

      <div className={styles.tripInfo}>
        <div className={styles.tripCell}>
          <div className={styles.tripLabel}>Distance</div>
          <div className={styles.tripValue}>
            {distanceKm >= 1
              ? `${distanceKm.toFixed(1)} km`
              : `${Math.round(distanceKm * 1000)} m`}
          </div>
        </div>
        <div className={styles.tripCellMiddle}>
          <div className={styles.tripLabel}>
            <Clock />
            ETA
          </div>
          <div className={styles.tripValue}>{Math.ceil(durationMin)} min</div>
        </div>
        <div className={styles.tripCell}>
          <div className={styles.tripLabel}>Arrival</div>
          <div className={styles.tripValue}>
            {new Date(
              Date.now() + durationMin * 60000,
            ).toLocaleTimeString("en-US", {
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
