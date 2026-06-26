import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteSuggestion } from "./routeService";

const ACTIVE_WALK_STORAGE_KEY = "@safewalk_active_walk";

// Gemeinsames Datenmodell fuer den laufenden Walk auf Home und Walk Details.
export type ActiveWalk = {
    destination: string;
    estimatedMinutes: number;
    startedAt: string;
    endsAt: string;
    routeSuggestion?: RouteSuggestion;
};

export async function startActiveWalk(input: {
    destination: string;
    estimatedMinutes: number;
    routeSuggestion?: RouteSuggestion;
}) {
    const startedAt = new Date();
    // Die Endzeit ist die zentrale Grundlage fuer Timer und spaetere Alarm-Logik.
    const endsAt = new Date(
        startedAt.getTime() + input.estimatedMinutes * 60 * 1000
    );

    const activeWalk: ActiveWalk = {
        destination: input.destination,
        estimatedMinutes: input.estimatedMinutes,
        routeSuggestion: input.routeSuggestion,
        startedAt: startedAt.toISOString(),
        endsAt: endsAt.toISOString(),
    };

    await AsyncStorage.setItem(
        ACTIVE_WALK_STORAGE_KEY,
        JSON.stringify(activeWalk)
    );

    return activeWalk;
}

export async function getActiveWalk() {
    // AsyncStorage haelt den Walk auch nach Navigation oder App-Neustart bereit.
    const value = await AsyncStorage.getItem(ACTIVE_WALK_STORAGE_KEY);

    if (!value) {
        return null;
    }

    return JSON.parse(value) as ActiveWalk;
}

export async function clearActiveWalk() {
    await AsyncStorage.removeItem(ACTIVE_WALK_STORAGE_KEY);
}

export async function addTimeToActiveWalk(minutesToAdd: number) {
    const walk = await getActiveWalk();
    if (!walk) return null;

    const newEndsAt = new Date(new Date(walk.endsAt).getTime() + minutesToAdd * 60 * 1000);
    walk.endsAt = newEndsAt.toISOString();
    walk.estimatedMinutes += minutesToAdd;

    await AsyncStorage.setItem(ACTIVE_WALK_STORAGE_KEY, JSON.stringify(walk));
    return walk;
}
