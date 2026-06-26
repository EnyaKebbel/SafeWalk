import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { colors, spacing } from "../../src/constants/theme";
import AppCard from "../../src/components/cards/AppCard";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import RouteMapPreview from "../../src/components/map/RouteMapPreview";
import ActiveWalkCard from "../../src/components/walk/ActiveWalkCard";
import { ActiveWalk, clearActiveWalk, getActiveWalk } from "../../src/services/walkService";

// Berechnet die Anzeige fuer den laufenden Timer aus der gespeicherten Endzeit.
function formatRemainingTime(endsAt: string) {
    const remainingMs = new Date(endsAt).getTime() - Date.now();

    if (remainingMs <= 0) {
        return "Time is up";
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Home screen as central entry point for map, active route and quick actions.
export default function HomeScreen() {
    const [activeWalk, setActiveWalk] = useState<ActiveWalk | null>(null);
    const [remainingTime, setRemainingTime] = useState("");

    // Laedt den aktiven Walk immer neu, wenn der Home Screen wieder sichtbar wird.
    const loadActiveWalk = useCallback(async () => {
        const walk = await getActiveWalk();
        setActiveWalk(walk);
        setRemainingTime(walk ? formatRemainingTime(walk.endsAt) : "");
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadActiveWalk();
        }, [loadActiveWalk])
    );

    useEffect(() => {
        if (!activeWalk) {
            return;
        }

        // Aktualisiert nur die Anzeige; die eigentliche Endzeit bleibt im Storage.
        const intervalId = setInterval(() => {
            setRemainingTime(formatRemainingTime(activeWalk.endsAt));
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeWalk]);

    const arrivalTime = useMemo(() => {
        if (!activeWalk) {
            return "";
        }

        return new Date(activeWalk.endsAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    }, [activeWalk]);

    const handleArrivedSafely = async () => {
        // Beendet den Walk lokal. Die spaetere Notfalllogik kann hier andocken.
        await clearActiveWalk();
        setActiveWalk(null);
        setRemainingTime("");
    };

    return (
        <View style={styles.container}>
            <RouteMapPreview />

            {activeWalk ? (
                <ActiveWalkCard
                    activeWalk={activeWalk}
                    remainingTime={remainingTime}
                    arrivalTime={arrivalTime}
                    onArrivedSafely={handleArrivedSafely}
                />
            ) : (
                <AppCard>
                    <Text style={styles.emptyTitle}>Ready when you are</Text>
                    <Text style={styles.emptyText}>
                        Start a walk to track your expected arrival time.
                    </Text>
                    <PrimaryButton
                        title="Start Walk"
                        style={styles.startButton}
                        onPress={() => router.push("/walk")}
                        icon={<Ionicons name="walk-outline" size={20} color={colors.text} />}
                    />
                </AppCard>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
    },
    emptyTitle: {
        color: colors.text,
        fontFamily: "nunito-bold",
        fontSize: 20,
    },
    emptyText: {
        color: colors.mutedText,
        fontFamily: "nunito-regular",
        fontSize: 14,
        lineHeight: 20,
        marginTop: spacing.xs,
    },
    startButton: {
        marginTop: spacing.md,
    },
});
