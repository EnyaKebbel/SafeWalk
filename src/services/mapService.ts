// API Setup
const ORS_BASE_URL = "https://api.openrouteservice.org";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface RouteSummary {
  distance: number; // in meters
  duration: number; // in seconds
}

export interface RouteData {
  coordinates: Coordinates[];
  summary: RouteSummary;
}

export interface AddressSuggestion {
  id: string;
  label: string;
}

function isNetworkRequestError(error: unknown) {
  // Expo meldet echte Offline-Fetches als TypeError mit dieser Meldung.
  return error instanceof TypeError && error.message.includes("Network request failed");
}

// Hilfsfunktion: Holt den API-Key aus der .env Datei
const getApiKey = () => {
  const key = process.env.EXPO_PUBLIC_OPENROUTESERVICE_KEY;
  if (!key || key === "DEIN_API_KEY_HIER") {
    throw new Error("API Key fehlt! Bitte in der .env Datei eintragen.");
  }
  return key;
};

/**
 * Holt Autovervollständigungs-Vorschläge für eine eingetippte Adresse.
 */
export const fetchAutocompleteSuggestions = async (text: string): Promise<AddressSuggestion[]> => {
  if (text.length < 3) return []; // Erst ab 3 Zeichen suchen, um API zu schonen
  
  try {
    const apiKey = getApiKey();
    const url = `${ORS_BASE_URL}/geocode/autocomplete?api_key=${apiKey}&text=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    if (data.features) {
      return data.features.map((feature: any) => ({
        id: feature.properties.id || Math.random().toString(),
        label: feature.properties.label,
      }));
    }
    return [];
  } catch (error) {
    if (!isNetworkRequestError(error)) {
      console.warn("Autocomplete unavailable:", error);
    }
    // Offline soll das Suchfeld leer bleiben, aber keine rote Expo-Fehlerseite oeffnen.
    return [];
  }
};

/**
 * Nimmt einen Text (z.B. "Hauptstraße 1, Berlin") und fragt die API
 * nach den genauen GPS-Koordinaten.
 */
export const geocodeAddress = async (address: string): Promise<Coordinates> => {
  try {
    const apiKey = getApiKey();
    const url = `${ORS_BASE_URL}/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(address)}&size=1`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Netzwerkfehler beim Geocoding");
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // ORS gibt Koordinaten als [Longitude, Latitude] zurück
      const [lon, lat] = data.features[0].geometry.coordinates;
      return { latitude: lat, longitude: lon };
    }
    
    throw new Error("Adresse nicht gefunden");
  } catch (error) {
    if (isNetworkRequestError(error)) {
      // Route und Adresse kommen von OpenRouteService und brauchen daher Internet.
      throw new Error("Address search needs an internet connection.");
    }

    console.warn("Geocoding unavailable:", error);
    throw error instanceof Error ? error : new Error("Adresse nicht gefunden");
  }
};

/**
 * Berechnet eine Route zwischen zwei Koordinaten mit dem gewählten Transportmittel.
 */
export const getRoute = async (
  start: Coordinates, 
  end: Coordinates, 
  mode: 'walk' | 'bike' | 'car' = 'walk'
): Promise<RouteData> => {
  try {
    const apiKey = getApiKey();
    // ORS braucht das Format: start=lon,lat & end=lon,lat
    const startStr = `${start.longitude},${start.latitude}`;
    const endStr = `${end.longitude},${end.latitude}`;
    
    // Profil je nach Modus wählen
    let profile = 'foot-walking';
    if (mode === 'bike') profile = 'cycling-regular';
    if (mode === 'car') profile = 'driving-car';
    
    const url = `${ORS_BASE_URL}/v2/directions/${profile}?api_key=${apiKey}&start=${startStr}&end=${endStr}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fehler bei der Routenberechnung");
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      
      // ORS gibt ein Array von [lon, lat] Arrays zurück. Wir mappen es für react-native-maps
      const coords = feature.geometry.coordinates.map((point: number[]) => ({
        latitude: point[1],
        longitude: point[0]
      }));
      
      const summary = {
        distance: feature.properties.summary.distance,
        duration: feature.properties.summary.duration
      };
      
      return { coordinates: coords, summary };
    }
    
    throw new Error("Keine Route gefunden");
  } catch (error) {
    if (isNetworkRequestError(error)) {
      // Route und Adresse kommen von OpenRouteService und brauchen daher Internet.
      throw new Error("Route calculation needs an internet connection.");
    }

    console.warn("Routing unavailable:", error);
    throw error instanceof Error ? error : new Error("Fehler bei der Routenberechnung");
  }
};
