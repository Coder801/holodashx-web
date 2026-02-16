import {
  Bell,
  Globe,
  LogOut,
  Map,
  Moon,
  Navigation2,
  User,
  Volume2,
  X,
} from "lucide-react";
import { useState } from "react";

import styles from "./styles.module.scss";
import type { SettingsProps, SettingToggleProps } from "./types";

export const Settings = ({ onClose, onLogout, username }: SettingsProps) => {
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [nightMode, setNightMode] = useState(false);
  const [avoidTolls, setAvoidTolls] = useState(false);
  const [units, setUnits] = useState<"metric" | "imperial">("metric");

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <div className={styles.headerAvatar}>
              <User />
            </div>
            <div>
              <h2 className={styles.headerTitle}>Settings</h2>
              <p className={styles.headerUsername}>{username}</p>
            </div>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X />
          </button>
        </div>

        <div className={styles.content}>
          <div>
            <h3 className={styles.sectionTitle}>
              <Navigation2 />
              Navigation
            </h3>
            <div className={styles.toggleList}>
              <SettingToggle
                label="Voice Guidance"
                description="Turn-by-turn voice instructions"
                icon={Volume2}
                checked={voiceGuidance}
                onChange={setVoiceGuidance}
              />
              <SettingToggle
                label="Avoid Tolls"
                description="Use toll-free routes when possible"
                icon={Map}
                checked={avoidTolls}
                onChange={setAvoidTolls}
              />
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>
              <Moon />
              Display
            </h3>
            <div className={styles.toggleList}>
              <SettingToggle
                label="Night Mode"
                description="Darker colors for nighttime driving"
                icon={Moon}
                checked={nightMode}
                onChange={setNightMode}
              />
              <SettingToggle
                label="Notifications"
                description="Traffic alerts and updates"
                icon={Bell}
                checked={notifications}
                onChange={setNotifications}
              />
            </div>
          </div>

          <div>
            <h3 className={styles.sectionTitle}>
              <Globe />
              Units
            </h3>
            <div className={styles.unitsSelector}>
              <button
                onClick={() => setUnits("metric")}
                className={
                  units === "metric"
                    ? styles.unitButtonActive
                    : styles.unitButton
                }
              >
                Metric (km)
              </button>
              <button
                onClick={() => setUnits("imperial")}
                className={
                  units === "imperial"
                    ? styles.unitButtonActive
                    : styles.unitButton
                }
              >
                Imperial (mi)
              </button>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onLogout} className={styles.logoutButton}>
            <LogOut />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

function SettingToggle({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
}: SettingToggleProps) {
  return (
    <div className={styles.toggleRow}>
      <div className={styles.toggleInfo}>
        <div className={styles.toggleIcon}>
          <Icon />
        </div>
        <div>
          <div className={styles.toggleLabel}>{label}</div>
          <div className={styles.toggleDescription}>{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={checked ? styles.toggleSwitchOn : styles.toggleSwitchOff}
      >
        <div className={checked ? styles.toggleKnobOn : styles.toggleKnob} />
      </button>
    </div>
  );
}
