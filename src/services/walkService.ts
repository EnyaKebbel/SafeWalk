import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteSuggestion } from "./routeService";
import {
    cancelWalkReminderNotification,
    scheduleWalkReminderNotification,
} from "./notificationService";

const ACTIVE_WALK_STORAGE_KEY = "@safewalk_active_walk";

// Gemeinsames Datenmodell fuer den laufenden Walk auf Home und Walk Details.
export type ActiveWalk = {
    destination: string;
    estimatedMinutes: number;
    startedAt: string;
    endsAt: string;
    reminderNotificationId?: string | null;
    routeSuggestion?: RouteSuggestion;
};

export async function startActiveWalk(input: {
    destination: string;
    estimatedMinutes: number;
    routeSuggestion?: RouteSuggestion;
}) {
    const startedAt = new Date();
    // Die Endzeit ist die zentrale Grundlage fuer Timer und spätere Alarm-Logik.
    const endsAt = new Date(
        startedAt.getTime() + input.estimatedMinutes * 60 * 1000
    );
    let reminderNotificationId: string | null = null;

    try {
        reminderNotificationId = await scheduleWalkReminderNotification(
            endsAt.toISOString()
        );
    } catch (error) {
        console.warn("Walk reminder notification could not be scheduled:", error);
    }

    const activeWalk: ActiveWalk = {
        destination: input.destination,
        estimatedMinutes: input.estimatedMinutes,
        routeSuggestion: input.routeSuggestion,
        startedAt: startedAt.toISOString(),
        endsAt: endsAt.toISOString(),
        reminderNotificationId,
    };

    await AsyncStorage.setItem(
        ACTIVE_WALK_STORAGE_KEY,
        JSON.stringify(activeWalk)
    );

    return activeWalk;
}

export async function getActiveWalk() {
    // AsyncStorage hält den Walk auch nach Navigation oder App-Neustart bereit.
    const value = await AsyncStorage.getItem(ACTIVE_WALK_STORAGE_KEY);

    if (!value) {
        return null;
    }

    return JSON.parse(value) as ActiveWalk;
}

export async function clearActiveWalk() {
    const activeWalk = await getActiveWalk();
    try {
        await cancelWalkReminderNotification(
            activeWalk?.reminderNotificationId ?? undefined
        );
    } catch (error) {
        console.warn("Walk reminder notification could not be cancelled:", error);
    }
    await AsyncStorage.removeItem(ACTIVE_WALK_STORAGE_KEY);
}

export async function updateActiveWalkReminderNotificationId(
    reminderNotificationId: string | null
) {
    const activeWalk = await getActiveWalk();

    if (!activeWalk) {
        return;
    }

    await AsyncStorage.setItem(
        ACTIVE_WALK_STORAGE_KEY,
        JSON.stringify({
            ...activeWalk,
            reminderNotificationId,
        })
    );
}
