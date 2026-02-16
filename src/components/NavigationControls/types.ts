export type NavigationControlsProps = {
  isNavigating: boolean;
  hasRoute: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  onOpenSettings: () => void;
  username: string;
};
