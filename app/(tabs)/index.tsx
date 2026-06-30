import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View, Linking, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import * as SMS from 'expo-sms';
import { colors, spacing } from "../../src/constants/theme";
import AppCard from "../../src/components/cards/AppCard";
import PrimaryButton from "../../src/components/buttons/PrimaryButton";
import RouteMapPreview from "../../src/components/map/RouteMapPreview";
import ActiveWalkCard from "../../src/components/walk/ActiveWalkCard";
import { ActiveWalk, clearActiveWalk, getActiveWalk } from "../../src/services/walkService";
import NotifyContactModal from "../../src/components/modals/NotifyContactModal";
import { TrustedContact, getTopPriorityContact } from "../../src/services/contactService";
import { triggerTestHaptic } from "../../src/services/hapticsService";

function getRemainingMs(endsAt: string) {
    return new Date(endsAt).getTime() - Date.now();
}

// Berechnet die Anzeige für den laufenden Timer aus der gespeicherten Endzeit.
function formatRemainingTime(endsAt: string) {
    const remainingMs = getRemainingMs(endsAt);

    if (remainingMs <= 0) {
        return "Time is up";
    }

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

// Home-Screen: Einstieg mit Karten-Vorschau, aktivem Walk, sicher angekommen und SOS.
export default function HomeScreen() {
    const [activeWalk, setActiveWalk] = useState<ActiveWalk | null>(null);
    const [remainingTime, setRemainingTime] = useState("");
    
    const [notifyModalVisible, setNotifyModalVisible] = useState(false);

    // Lädt den aktiven Walk immer neu, wenn der Home Screen wieder sichtbar wird.
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

    const isExpiringSoon = useMemo(() => {
        if (!activeWalk) {
            return false;
        }

        const remainingMs = getRemainingMs(activeWalk.endsAt);
        return remainingMs > 0 && remainingMs <= 60 * 1000;
    }, [activeWalk, remainingTime]);

    // Öffnet die Kontaktauswahl, bevor der Walk wirklich beendet wird.
    const handleArrivedSafelyClick = () => {
        setNotifyModalVisible(true);
    };

    // Beendet den Walk lokal und räumt den Timer-Status im Screen auf.
    const finishWalkAndClose = async () => {
        setNotifyModalVisible(false);
        await clearActiveWalk();
        setActiveWalk(null);
        setRemainingTime("");
    };

    // Öffnet die SMS-App mit allen ausgewählten Kontakten.
    const handleNotifyContact = async (contacts: TrustedContact[]) => {
        const message = "I just arrived safely at my destination!";
        const phoneNumbers = contacts.map(c => c.contactNumber);
        
        try {
            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                await SMS.sendSMSAsync(phoneNumbers, message);
            } else {
                console.error("SMS is not available on this device");
                // Fallback falls es ein Simulator ohne SMS-App ist
                alert("SMS not available: " + phoneNumbers.join(", "));
            }
        } catch (e) {
            console.error("Could not open SMS app", e);
        }
        
        finishWalkAndClose();
    };

    const triggerPanic = async () => {
        // SOS gibt sofort haptisches Feedback, bevor der Anrufdialog geöffnet wird.
        triggerTestHaptic();
        try {
            const topContact = await getTopPriorityContact();
            const phoneToCall = topContact ? topContact.contactNumber : "112";
            await Linking.openURL(`tel:${phoneToCall}`);
        } catch (err) {
            console.error("Error opening dialer", err);
            Alert.alert("Error", "Could not open the phone dialer.");
        }
    };

    return (
        <View style={styles.container}>
            <RouteMapPreview activeWalk={activeWalk} />

            {activeWalk ? (
                <ActiveWalkCard
                    activeWalk={activeWalk}
                    remainingTime={remainingTime}
                    arrivalTime={arrivalTime}
                    isExpiringSoon={isExpiringSoon}
                    onArrivedSafely={handleArrivedSafelyClick}
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
                    <PrimaryButton
                        title="Mark as Safe"
                        variant="secondary"
                        style={{ marginTop: spacing.sm }}
                        onPress={handleArrivedSafelyClick}
                        icon={<Ionicons name="home-outline" size={20} color={colors.text} />}
                    />
                </AppCard>
            )}

            <View style={styles.floatingPanicContainer}>
                <TouchableOpacity 
                    style={styles.panicButton} 
                    onPress={triggerPanic}
                >
                    <Ionicons name="alert-circle" size={40} color="#FFF" />
                    <Text style={styles.panicText}>SOS</Text>
                </TouchableOpacity>
            </View>

            <NotifyContactModal
                visible={notifyModalVisible}
                onClose={() => setNotifyModalVisible(false)}
                onSelectContacts={handleNotifyContact}
                onSkip={finishWalkAndClose}
            />
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
    floatingPanicContainer: {
        position: 'absolute',
        bottom: spacing.xxl,
        right: spacing.lg,
        zIndex: 10,
    },
    panicButton: {
        backgroundColor: colors.danger,
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.danger,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    panicText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: 2,
    }
});
