export type Coordinates = {
    latitude: number;
    longitude: number;
};

export type RouteSuggestion = {
    destinationLabel: string;
    durationMinutes: number;
    distanceKm: number;
};

const ORS_API_KEY = process.env.EXPO_PUBLIC_OPENROUTE_SERVICE_API_KEY;
const ORS_BASE_URL = "https://api.openrouteservice.org";

// Trennt die API-Key-Pruefung vom Screen, damit die UI nur Fehlertexte anzeigen muss.
function requireApiKey() {
    if (!ORS_API_KEY) {
        throw new Error(
            "Missing OpenRouteService API key. Set EXPO_PUBLIC_OPENROUTE_SERVICE_API_KEY to enable route estimates."
        );
    }

    return ORS_API_KEY;
}

// Wandelt die Ziel-Eingabe in Koordinaten um, die die Directions API braucht.
async function geocodeDestination(destination: string): Promise<{
    label: string;
    coordinates: Coordinates;
}> {
    const apiKey = requireApiKey();
    const response = await fetch(
        `${ORS_BASE_URL}/geocode/search?text=${encodeURIComponent(destination)}&size=1`,
        {
            headers: {
                Authorization: apiKey,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Destination could not be found.");
    }

    const data = await response.json();
    const feature = data.features?.[0];

    if (!feature) {
        throw new Error("Destination could not be found.");
    }

    const [longitude, latitude] = feature.geometry.coordinates;

    return {
        label: feature.properties?.label ?? destination,
        coordinates: {
            latitude,
            longitude,
        },
    };
}

export type TransportMode = 'walk' | 'bike' | 'car';

export async function getRouteSuggestion(
    destination: string,
    origin: Coordinates,
    mode: TransportMode = 'walk'
): Promise<RouteSuggestion> {
    const apiKey = requireApiKey();
    const resolvedDestination = await geocodeDestination(destination);

    // Profil je nach Modus wählen
    let profile = 'foot-walking';
    if (mode === 'bike') profile = 'cycling-regular';
    if (mode === 'car') profile = 'driving-car';

    // ORS erwartet Koordinaten als [longitude, latitude].
    const response = await fetch(`${ORS_BASE_URL}/v2/directions/${profile}`, {
        method: "POST",
        headers: {
            Authorization: apiKey,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            coordinates: [
                [origin.longitude, origin.latitude],
                [
                    resolvedDestination.coordinates.longitude,
                    resolvedDestination.coordinates.latitude,
                ],
            ],
            geometry: false,
            instructions: false,
        }),
    });

    if (!response.ok) {
        throw new Error("Route estimate is currently unavailable.");
    }

    const data = await response.json();
    const summary =
        data.routes?.[0]?.summary ?? data.features?.[0]?.properties?.summary;

    if (!summary?.duration || !summary?.distance) {
        throw new Error("Route estimate is currently unavailable.");
    }

    return {
        destinationLabel: resolvedDestination.label,
        durationMinutes: Math.max(1, Math.ceil(summary.duration / 60)),
        distanceKm: Math.round((summary.distance / 1000) * 10) / 10,
    };
}
