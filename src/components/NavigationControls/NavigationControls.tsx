import {
  Ban,
  Menu,
  Navigation,
  Settings,
  User,
  Volume2,
  X,
} from "lucide-react";

import styles from "./styles.module.scss";
import type { NavigationControlsProps } from "./types";

export const NavigationControls = ({
  isNavigating,
  hasRoute,
  onStartNavigation,
  onStopNavigation,
  onOpenSettings,
  username,
}: NavigationControlsProps) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <button className={styles.iconButton}>
          <Menu />
        </button>

        <div className={styles.centerControls}>
          {isNavigating ? (
            <button
              onClick={onStopNavigation}
              className={styles.endRouteButton}
            >
              <X />
              <span>End Route</span>
            </button>
          ) : hasRoute ? (
            <>
              <button
                onClick={onStartNavigation}
                className={styles.startRouteButton}
              >
                <Navigation />
                <span>Start</span>
              </button>
              <button
                onClick={onStartNavigation}
                className={styles.startRouteButton}
              >
                <Ban />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <div className={styles.welcomeText}>
              <User />
              <span>Welcome, {username}</span>
            </div>
          )}
        </div>

        <div className={styles.rightControls}>
          <button className={styles.iconButton}>
            <Volume2 />
          </button>
          <button onClick={onOpenSettings} className={styles.iconButton}>
            <Settings />
          </button>
        </div>
      </div>
    </div>
  );
};
