export type RouteData = {
  distanceKm: number;
  durationMin: number;
  turnInstruction: string;
  turnDistance: string;
};

export type NavigationMapProps = {
  isNavigating: boolean;
  destination: string;
  onRouteData?: (data: RouteData) => void;
};
