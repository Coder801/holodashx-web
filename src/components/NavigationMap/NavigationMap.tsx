import { Map, useMap } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

import styles from "./styles.module.scss";
import type { NavigationMapProps } from "./types";

function getHeading(from: google.maps.LatLng, to: google.maps.LatLng): number {
  const dLng = ((to.lng() - from.lng()) * Math.PI) / 180;
  const lat1 = (from.lat() * Math.PI) / 180;
  const lat2 = (to.lat() * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function findCurrentStep(
  steps: google.maps.DirectionsStep[],
  currentIndex: number,
  path: google.maps.LatLng[],
) {
  const currentPos = path[currentIndex];

  for (const step of steps) {
    const stepEnd = step.end_location;
    const dist = google.maps.geometry?.spherical?.computeDistanceBetween(
      currentPos,
      stepEnd,
    );

    if (dist !== undefined && dist < 200) {
      const nextStepIdx = steps.indexOf(step) + 1;
      if (nextStepIdx < steps.length) {
        return steps[nextStepIdx];
      }
      return step;
    }
  }

  for (let i = steps.length - 1; i >= 0; i--) {
    const stepStart = steps[i].start_location;
    const stepEnd = steps[i].end_location;
    const distToStart =
      google.maps.geometry?.spherical?.computeDistanceBetween(
        currentPos,
        stepStart,
      ) ?? Infinity;
    const distToEnd =
      google.maps.geometry?.spherical?.computeDistanceBetween(
        currentPos,
        stepEnd,
      ) ?? Infinity;

    if (distToStart < 500 || distToEnd < 500) {
      return steps[i];
    }
  }

  return steps[0];
}

export const NavigationMap = ({
  isNavigating,
  destination,
  onRouteData,
}: NavigationMapProps) => {
  const [center, setCenter] = useState({ lat: 50.4501, lng: 30.5234 });
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const map = useMap();
  const simIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const simIndexRef = useRef(0);
  const circlesRef = useRef<google.maps.Circle[]>([]);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(
    null,
  );

  // Geolocation
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        console.error("Geolocation error:", error);
      },
    );
  }, []);

  // Camera reset when no destination
  useEffect(() => {
    if (!destination && map) {
      map.panTo(center);
      map.setZoom(17);
      map.setTilt(55);
    }
  }, [destination, center, map]);

  // User location circles (imperative — no CircleF in vis.gl)
  useEffect(() => {
    if (!map) return;

    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];

    const innerCircle = new google.maps.Circle({
      map,
      center,
      radius: 12,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 3,
      zIndex: 10,
    });

    const outerCircle = new google.maps.Circle({
      map,
      center,
      radius: 40,
      fillColor: "#4285F4",
      fillOpacity: 0.15,
      strokeColor: "#4285F4",
      strokeOpacity: 0.3,
      strokeWeight: 1,
      zIndex: 9,
    });

    circlesRef.current = [innerCircle, outerCircle];

    return () => {
      circlesRef.current.forEach((c) => c.setMap(null));
      circlesRef.current = [];
    };
  }, [map, center]);

  // Fetch directions
  useEffect(() => {
    if (!destination) return;

    let cancelled = false;
    const directionsService = new google.maps.DirectionsService();

    directionsService.route(
      {
        origin: center,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (
        result: google.maps.DirectionsResult | null,
        status: google.maps.DirectionsStatus,
      ) => {
        if (cancelled) return;
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);

          const leg = result.routes[0].legs[0];
          onRouteData?.({
            distanceKm: (leg.distance?.value ?? 0) / 1000,
            durationMin: (leg.duration?.value ?? 0) / 60,
            turnInstruction:
              leg.steps[0]?.instructions?.replace(/<[^>]*>/g, "") ?? "",
            turnDistance: leg.steps[0]?.distance?.text ?? "",
          });
        } else {
          console.error("Directions request failed:", status);
        }
      },
    );

    return () => {
      cancelled = true;
      setDirections(null);
    };
  }, [destination, center, onRouteData]);

  // Directions renderer (imperative — no DirectionsRenderer component in vis.gl)
  useEffect(() => {
    if (!map || !directions || !destination) {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
      return;
    }

    if (!directionsRendererRef.current) {
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map,
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: "#00d2ff",
          strokeWeight: 5,
          strokeOpacity: 0.8,
        },
      });
    }

    directionsRendererRef.current.setDirections(directions);

    return () => {
      if (directionsRendererRef.current) {
        directionsRendererRef.current.setMap(null);
        directionsRendererRef.current = null;
      }
    };
  }, [map, directions, destination]);

  // Navigation simulation
  useEffect(() => {
    if (!isNavigating || !directions || !map) {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
      return;
    }

    const path = directions.routes[0].overview_path;
    const leg = directions.routes[0].legs[0];
    const totalDistanceM = leg.distance?.value ?? 0;
    const totalDurationS = leg.duration?.value ?? 0;
    const steps = leg.steps;

    simIndexRef.current = 0;

    // Initial camera setup
    const initHeading = getHeading(path[0], path[1]);
    map.setCenter(path[0]);
    map.setZoom(18);
    map.setTilt(67.5);
    map.setHeading(initHeading);

    // Report initial data
    onRouteData?.({
      distanceKm: totalDistanceM / 1000,
      durationMin: totalDurationS / 60,
      turnInstruction: steps[0]?.instructions?.replace(/<[^>]*>/g, "") ?? "",
      turnDistance: steps[0]?.distance?.text ?? "",
    });

    simIntervalRef.current = setInterval(() => {
      simIndexRef.current++;

      if (simIndexRef.current >= path.length) {
        if (simIntervalRef.current) {
          clearInterval(simIntervalRef.current);
          simIntervalRef.current = null;
        }
        onRouteData?.({
          distanceKm: 0,
          durationMin: 0,
          turnInstruction: "You have arrived!",
          turnDistance: "",
        });
        return;
      }

      const pos = path[simIndexRef.current];

      // Update heading
      if (simIndexRef.current < path.length - 1) {
        const heading = getHeading(pos, path[simIndexRef.current + 1]);
        map.setHeading(heading);
      }

      map.panTo(pos);

      // Calculate remaining
      const progress = simIndexRef.current / path.length;
      const remainingDistKm = (totalDistanceM * (1 - progress)) / 1000;
      const remainingDurMin = (totalDurationS * (1 - progress)) / 60;

      // Find current step
      const currentStep = findCurrentStep(steps, simIndexRef.current, path);

      onRouteData?.({
        distanceKm: remainingDistKm,
        durationMin: remainingDurMin,
        turnInstruction:
          currentStep?.instructions?.replace(/<[^>]*>/g, "") ?? "",
        turnDistance: currentStep?.distance?.text ?? "",
      });
    }, 5000);

    return () => {
      if (simIntervalRef.current) {
        clearInterval(simIntervalRef.current);
        simIntervalRef.current = null;
      }
    };
  }, [isNavigating, directions, map, onRouteData]);

  return (
    <div className={styles.wrapper}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={center}
        defaultZoom={17}
        tilt={55}
        mapId="5db81f2399a01b859e1536e9"
        colorScheme="LIGHT"
        disableDefaultUI
      />
    </div>
  );
};
