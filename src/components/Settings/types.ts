export type SettingsProps = {
  onClose: () => void;
  onLogout: () => void;
  username: string;
};

export type SettingToggleProps = {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  checked: boolean;
  onChange: (checked: boolean) => void;
};
