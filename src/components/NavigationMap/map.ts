// eslint-ignore-start
let map;
let geocoder;

// Маршрут
let directionsService;
let directionsRenderer;
let originMarker = null;
let destinationMarker = null;
let originLatLng = null;
let destinationLatLng = null;

// Данные маршрута
let lastRouteResponse = null;

// Симуляция навигации
let routePath = [];
let simIndex = 0;
let simInterval = null;
let carMarker = null;

export function initMap() {
  const defaultCenter = { lat: 50.4501, lng: 30.5234 }; // Киев

  map = new google.maps.Map(document.getElementById("map"), {
    center: defaultCenter,
    zoom: 12,
    mapId: "5db81f2399a01b852988cb46",
  });

  geocoder = new google.maps.Geocoder();

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#00d2ff",
      strokeWeight: 5,
      strokeOpacity: 0.8,
    },
  });

  // Показ координат курсора
  map.addListener("mousemove", (e) => {
    document.getElementById("cursor-coords").textContent =
      `${e.latLng.lat().toFixed(6)}, ${e.latLng.lng().toFixed(6)}`;
  });

  // Клик по карте — ставит точку A, затем Б
  map.addListener("click", (e) => {
    if (!originLatLng) {
      setRoutePoint("origin", e.latLng);
    } else if (!destinationLatLng) {
      setRoutePoint("destination", e.latLng);
    }
  });

  // Поиск
  document
    .getElementById("search-btn")
    .addEventListener("click", searchAddress);
  document.getElementById("search-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchAddress();
  });

  // Моё местоположение
  document.getElementById("locate-btn").addEventListener("click", locateMe);

  // Маршрут
  document
    .getElementById("build-route-btn")
    .addEventListener("click", buildRoute);
  document
    .getElementById("clear-route-btn")
    .addEventListener("click", clearRoute);
  document
    .getElementById("export-route-btn")
    .addEventListener("click", exportRouteJSON);
  document
    .getElementById("export-roads-btn")
    .addEventListener("click", exportNearbyRoads);

  // Навигация
  document
    .getElementById("start-nav-btn")
    .addEventListener("click", startNavigation);
  document
    .getElementById("pause-nav-btn")
    .addEventListener("click", pauseNavigation);
  document
    .getElementById("stop-nav-btn")
    .addEventListener("click", stopNavigation);
}

// --- Поиск адреса ---

function searchAddress() {
  const address = document.getElementById("search-input").value.trim();
  if (!address) return;

  geocoder.geocode({ address }, (results, status) => {
    if (status === "OK" && results[0]) {
      const loc = results[0].geometry.location;
      map.setCenter(loc);
      map.setZoom(15);
    } else {
      alert("Адрес не найден: " + status);
    }
  });
}

// --- Геолокация ---

function locateMe() {
  if (!navigator.geolocation) {
    alert("Геолокация не поддерживается вашим браузером");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const loc = new google.maps.LatLng(
        pos.coords.latitude,
        pos.coords.longitude,
      );
      map.setCenter(loc);
      map.setZoom(15);

      if (!originLatLng) {
        setRoutePoint("origin", loc);
      } else if (!destinationLatLng) {
        setRoutePoint("destination", loc);
      }
    },
    () => {
      alert("Не удалось определить местоположение");
    },
  );
}

// --- Маршрут ---

function setRoutePoint(type, latLng) {
  if (type === "origin") {
    if (originMarker) originMarker.setMap(null);
    originLatLng = latLng;
    originMarker = new google.maps.Marker({
      position: latLng,
      map,
      label: { text: "A", color: "#fff", fontWeight: "bold" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#4CAF50",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });
    reverseGeocode(latLng, "route-origin");
  } else {
    if (destinationMarker) destinationMarker.setMap(null);
    destinationLatLng = latLng;
    destinationMarker = new google.maps.Marker({
      position: latLng,
      map,
      label: { text: "Б", color: "#fff", fontWeight: "bold" },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: "#f44336",
        fillOpacity: 1,
        strokeColor: "#fff",
        strokeWeight: 2,
      },
    });
    reverseGeocode(latLng, "route-destination");
  }
}

function reverseGeocode(latLng, inputId) {
  geocoder.geocode({ location: latLng }, (results, status) => {
    if (status === "OK" && results[0]) {
      document.getElementById(inputId).value = results[0].formatted_address;
    } else {
      document.getElementById(inputId).value =
        `${latLng.lat().toFixed(6)}, ${latLng.lng().toFixed(6)}`;
    }
  });
}

function buildRoute() {
  const originInput = document.getElementById("route-origin").value.trim();
  const destInput = document.getElementById("route-destination").value.trim();

  if (!originInput && !originLatLng) {
    alert("Укажите точку отправления (А)");
    return;
  }
  if (!destInput && !destinationLatLng) {
    alert("Укажите точку назначения (Б)");
    return;
  }

  const origin = originLatLng || originInput;
  const destination = destinationLatLng || destInput;

  directionsService.route(
    {
      origin,
      destination,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);

        const leg = response.routes[0].legs[0];
        document.getElementById("route-distance").textContent =
          leg.distance.text;
        document.getElementById("route-duration").textContent =
          leg.duration.text;
        document.getElementById("route-info").style.display = "";

        // Сохраняем данные маршрута
        lastRouteResponse = response;
        routePath = response.routes[0].overview_path;

        if (!originLatLng) {
          setRoutePoint("origin", leg.start_location);
        }
        if (!destinationLatLng) {
          setRoutePoint("destination", leg.end_location);
        }
      } else {
        alert("Не удалось построить маршрут: " + status);
      }
    },
  );
}

function clearRoute() {
  stopNavigation();
  directionsRenderer.setDirections({ routes: [] });

  if (originMarker) {
    originMarker.setMap(null);
    originMarker = null;
  }
  if (destinationMarker) {
    destinationMarker.setMap(null);
    destinationMarker = null;
  }
  originLatLng = null;
  destinationLatLng = null;
  routePath = [];
  lastRouteResponse = null;

  document.getElementById("route-origin").value = "";
  document.getElementById("route-destination").value = "";
  document.getElementById("route-info").style.display = "none";
}

// --- Симуляция навигации ---

function getHeading(from, to) {
  const dLng = ((to.lng() - from.lng()) * Math.PI) / 180;
  const lat1 = (from.lat() * Math.PI) / 180;
  const lat2 = (to.lat() * Math.PI) / 180;
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function startNavigation() {
  if (routePath.length < 2) {
    alert("Сначала постройте маршрут");
    return;
  }

  simIndex = 0;

  // Скрыть маркеры A/Б
  if (originMarker) originMarker.setMap(null);
  if (destinationMarker) destinationMarker.setMap(null);

  // Создать маркер-автомобиль
  const heading = getHeading(routePath[0], routePath[1]);
  carMarker = new google.maps.Marker({
    position: routePath[0],
    map,
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 2,
      fillColor: "#00d2ff",
      fillOpacity: 1,
      strokeColor: "#fff",
      strokeWeight: 2,
      rotation: heading,
    },
    zIndex: 999,
  });

  const initHeading = getHeading(routePath[0], routePath[1]);
  map.setCenter(routePath[0]);
  map.setZoom(18);
  map.setTilt(75);
  map.setHeading(initHeading);

  // UI
  document.getElementById("start-nav-btn").style.display = "none";
  document.getElementById("pause-nav-btn").style.display = "";
  document.getElementById("stop-nav-btn").style.display = "";
  document.getElementById("nav-info").style.display = "";

  // Запуск интервала
  simInterval = setInterval(simStep, getSimDelay());

  // Слайдер скорости
  document
    .getElementById("speed-range")
    .addEventListener("input", onSpeedChange);
}

function getSimDelay() {
  const speed = document.getElementById("speed-range").value;
  // speed 1 = 200ms, speed 10 = 20ms
  return 220 - speed * 20;
}

function onSpeedChange() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = setInterval(simStep, getSimDelay());
  }
}

function simStep() {
  simIndex++;

  if (simIndex >= routePath.length) {
    finishNavigation();
    return;
  }

  const pos = routePath[simIndex];
  carMarker.setPosition(pos);

  // Поворот стрелки и камеры
  if (simIndex < routePath.length - 1) {
    const heading = getHeading(pos, routePath[simIndex + 1]);
    const icon = carMarker.getIcon();
    icon.rotation = heading;
    carMarker.setIcon(icon);
    map.setHeading(heading);
  }

  map.panTo(pos);

  // Оставшееся расстояние (используем простой подсчёт по точкам)
  const stepsLeft = routePath.length - simIndex;
  const totalSteps = routePath.length;
  const totalDistText = document.getElementById("route-distance").textContent;
  const totalDistMatch = totalDistText.match(/([\d.,]+)/);
  if (totalDistMatch) {
    const totalKm = parseFloat(totalDistMatch[1].replace(",", "."));
    const remainingKm = totalKm * (stepsLeft / totalSteps);
    document.getElementById("nav-remaining").textContent =
      remainingKm >= 1
        ? remainingKm.toFixed(1) + " км"
        : Math.round(remainingKm * 1000) + " м";
  }
}

function finishNavigation() {
  clearInterval(simInterval);
  simInterval = null;

  document.getElementById("nav-remaining").textContent = "0 м";

  // Показать маркер Б обратно
  if (destinationMarker) destinationMarker.setMap(map);

  setTimeout(() => {
    alert("Вы прибыли!");
    stopNavigation();
  }, 300);
}

function pauseNavigation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }

  const btn = document.getElementById("pause-nav-btn");
  btn.textContent = "Продолжить";
  btn.classList.remove("btn-pause");
  btn.classList.add("btn-start");
  btn.removeEventListener("click", pauseNavigation);
  btn.addEventListener("click", resumeNavigation);
}

function resumeNavigation() {
  simInterval = setInterval(simStep, getSimDelay());

  const btn = document.getElementById("pause-nav-btn");
  btn.textContent = "Пауза";
  btn.classList.remove("btn-start");
  btn.classList.add("btn-pause");
  btn.removeEventListener("click", resumeNavigation);
  btn.addEventListener("click", pauseNavigation);
}

function stopNavigation() {
  if (simInterval) {
    clearInterval(simInterval);
    simInterval = null;
  }

  if (carMarker) {
    carMarker.setMap(null);
    carMarker = null;
  }

  // Вернуть маркеры A/Б
  if (originMarker) originMarker.setMap(map);
  if (destinationMarker) destinationMarker.setMap(map);

  simIndex = 0;

  // UI
  document.getElementById("start-nav-btn").style.display = "";
  document.getElementById("pause-nav-btn").style.display = "none";
  document.getElementById("stop-nav-btn").style.display = "none";
  document.getElementById("nav-info").style.display = "none";

  // Сбросить кнопку паузы в исходное состояние
  const btn = document.getElementById("pause-nav-btn");
  btn.textContent = "Пауза";
  btn.classList.remove("btn-start");
  btn.classList.add("btn-pause");
  btn.removeEventListener("click", resumeNavigation);
  btn.addEventListener("click", pauseNavigation);

  document
    .getElementById("speed-range")
    .removeEventListener("input", onSpeedChange);
}

// --- Экспорт маршрута ---

function exportRouteJSON() {
  if (!lastRouteResponse) {
    alert("Сначала постройте маршрут");
    return;
  }

  const route = lastRouteResponse.routes[0];
  const leg = route.legs[0];

  const data = {
    summary: route.summary,
    origin: {
      address: leg.start_address,
      lat: leg.start_location.lat(),
      lng: leg.start_location.lng(),
    },
    destination: {
      address: leg.end_address,
      lat: leg.end_location.lat(),
      lng: leg.end_location.lng(),
    },
    distance: leg.distance,
    duration: leg.duration,
    overview_polyline: route.overview_polyline,
    path: route.overview_path.map((p) => ({
      lat: p.lat(),
      lng: p.lng(),
    })),
    steps: leg.steps.map((step) => ({
      instruction: step.instructions,
      distance: step.distance,
      duration: step.duration,
      start: { lat: step.start_location.lat(), lng: step.start_location.lng() },
      end: { lat: step.end_location.lat(), lng: step.end_location.lng() },
      polyline: step.polyline,
      path: step.path.map((p) => ({ lat: p.lat(), lng: p.lng() })),
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "route.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- Экспорт ближайших дорог ---

async function exportNearbyRoads() {
  if (!originLatLng) {
    alert("Сначала укажите точку отправления (А)");
    return;
  }

  const lat = originLatLng.lat();
  const lng = originLatLng.lng();
  const radius = 200;

  const query = `
        [out:json][timeout:10];
        (
            way["highway"~"^|primary|secondary|tertiary|residential|unclassified|service|living_street)$"](around:${radius},${lat},${lng});
        );
        out body;
        >;
        out skel qt;
    `;

  const btn = document.getElementById("export-roads-btn");
  btn.textContent = "Загрузка...";
  btn.disabled = true;

  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!resp.ok) throw new Error("Overpass API: " + resp.status);

    const osm = await resp.json();

    // Собрать ноды в словарь
    const nodes = {};
    for (const el of osm.elements) {
      if (el.type === "node") {
        nodes[el.id] = { lat: el.lat, lng: el.lon };
      }
    }

    // Собрать дороги
    const roads = [];
    for (const el of osm.elements) {
      if (el.type === "way" && el.tags) {
        const path = el.nodes.map((id) => nodes[id]).filter(Boolean);

        if (path.length < 2) continue;

        roads.push({
          id: el.id,
          type: el.tags.highway,
          name: el.tags.name || null,
          oneway: el.tags.oneway === "yes",
          lanes: el.tags.lanes ? parseInt(el.tags.lanes) : null,
          maxspeed: el.tags.maxspeed || null,
          path,
        });
      }
    }

    const data = {
      center: { lat, lng },
      radius,
      roads_count: roads.length,
      roads,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "nearby-roads.json";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Ошибка загрузки дорог: " + err.message);
  } finally {
    btn.textContent = "Экспорт дорог (миникарта)";
    btn.disabled = false;
  }
}

window.initMap = initMap;
