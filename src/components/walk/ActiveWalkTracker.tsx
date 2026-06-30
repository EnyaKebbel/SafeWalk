import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, Linking } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius, spacing } from "../../constants/theme";
import { ActiveWalk } from "../../services/walkService";
import { geocodeAddress, getRoute, Coordinates, RouteData } from "../../services/mapService";
import { getTopPriorityContact } from "../../services/contactService";
import PrimaryButton from "../buttons/PrimaryButton";
import { triggerTestHaptic } from "../../services/hapticsService";

type ActiveWalkTrackerProps = {
  activeWalk: ActiveWalk;
  onEndWalk: () => void;
};

// Live-Tracking während eines Walks mit Karte, Route, GPS-Follow, SOS und sicher angekommen.
export default function ActiveWalkTracker({ activeWalk, onEndWalk }: ActiveWalkTrackerProps) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        // Initiale Position holen, damit die Karte starten kann.
        let location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);

        // Ziel und Route abrufen, falls Internet/API verfügbar ist.
        const destCoords = await geocodeAddress(activeWalk.destination);
        setDestinationCoords(destCoords);
        const routeData = await getRoute(coords, destCoords, 'walk');
        setRoute(routeData);
        setRouteError(null);

        // Karte auf die aktuelle Position fokussieren.
        if (mapRef.current) {
          mapRef.current.animateCamera({
            center: coords,
            altitude: 150, 
            zoom: 18,      
            pitch: 60,     
            heading: location.coords.heading || 0,
          }, { duration: 1000 });
        }

        // Live-Tracking aktivieren und Kamera laufend nachziehen.
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (newLocation) => {
            const newCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };
            setCurrentLocation(newCoords);

            if (mapRef.current) {
              mapRef.current.animateCamera({
                center: newCoords,
                altitude: 150,
                zoom: 18,
                pitch: 60,
                heading: newLocation.coords.heading || 0,
              }, { duration: 1000 });
            }
          }
        );

      } catch (error) {
        // Offline kann die Karte den Standort zeigen, aber keine neue ORS-Route laden.
        setRouteError(
          error instanceof Error
            ? error.message
            : "Route data is currently unavailable."
        );
      }
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [activeWalk]);

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
      {!currentLocation ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Connecting to GPS...</Text>
        </View>
      ) : (
        <>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            followsUserLocation={true}
          >
            {destinationCoords && (
              <Marker
                coordinate={destinationCoords}
                title="Destination"
                pinColor={colors.primary}
              />
            )}
            {route && (
              <Polyline
                coordinates={route.coordinates}
                strokeWidth={6}
                strokeColor={colors.primary}
              />
            )}
          </MapView>

          <View style={styles.overlay}>
            {routeError && (
              <View style={styles.routeErrorNotice}>
                <Ionicons name="cloud-offline-outline" size={18} color={colors.secondary} />
                <Text style={styles.routeErrorText}>{routeError}</Text>
              </View>
            )}

            <View style={{ flex: 1, marginRight: spacing.md, marginBottom: 15 }}>
                <PrimaryButton
                    title="Arrived Safely"
                    variant="secondary"
                    onPress={onEndWalk}
                    icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.text} />}
                />
            </View>

            <TouchableOpacity 
              style={styles.panicButton} 
              onPress={triggerPanic}
            >
              <Ionicons name="alert-circle" size={40} color="#FFF" />
              <Text style={styles.panicText}>SOS</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: colors.mutedText,
  },
  overlay: {
    position: 'absolute',
    bottom: 30,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  routeErrorNotice: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: spacing.md,
    padding: spacing.md,
    width: "100%",
  },
  routeErrorText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    marginLeft: spacing.sm,
  },
  endWalkButton: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: 14,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  endWalkText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: colors.text,
    fontSize: 16,
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
    fontSize: 15,
    marginTop: 2,
  }
});
