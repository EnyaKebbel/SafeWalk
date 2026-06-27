import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { Stack } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";

import { colors, radius, spacing } from "../src/constants/theme";
import AddressSearch from "../src/components/walk/AddressSearch";
import RouteInfoCard from "../src/components/walk/RouteInfoCard";
import { geocodeAddress, getRoute, Coordinates, RouteData } from "../src/services/mapService";
import {
  triggerImpactHaptic,
  triggerSelectionHaptic,
  triggerTestHaptic,
} from "../src/services/hapticsService";

type TransportMode = 'walk' | 'bike' | 'car';

export default function MapFullscreenScreen() {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isActiveWalk, setIsActiveWalk] = useState(false);
  const [mode, setMode] = useState<TransportMode>('walk');

  // Beim Starten GPS abfragen und überwachen
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      try {
        // Initiale Position holen
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        // GPS live überwachen
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 2000,
            distanceInterval: 5,
          },
          (newLocation) => {
            const coords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };
            setCurrentLocation(coords);

            // Wenn der Active Walk an ist, soll die Kamera dem User folgen
            if (isActiveWalk && mapRef.current) {
              mapRef.current.animateCamera({
                center: coords,
                altitude: 150, // Für iOS
                zoom: 18,      // Für Android
                pitch: 60,     // 3D Winkel
                heading: newLocation.coords.heading || 0,
              }, { duration: 1000 });
            }
          }
        );
      } catch (err) {
        setErrorMsg('Could not fetch location.');
      }
    })();

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [isActiveWalk]);

  const handleSearch = async (address: string) => {
    if (!currentLocation) {
      Alert.alert("Error", "Your current location is not known yet.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Adresse zu Koordinaten
      const destCoords = await geocodeAddress(address);
      setDestination(destCoords);

      // 2. Route berechnen mit aktuellem Modus
      const routeData = await getRoute(currentLocation, destCoords, mode);
      setRoute(routeData);

      // 3. Karte so zoomen, dass Start und Ziel sichtbar sind
      if (mapRef.current) {
        mapRef.current.fitToCoordinates([currentLocation, destCoords], {
          edgePadding: { top: 150, right: 50, bottom: 200, left: 50 },
          animated: true,
        });
      }
    } catch (error) {
      // Erwartete Offline-/API-Fehler als normale App-Meldung statt Expo-Console-Overlay anzeigen.
      Alert.alert(
        "Route unavailable",
        error instanceof Error
          ? error.message
          : "Could not calculate route. Please try another address."
      );
      setRoute(null);
      setDestination(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Wenn der Modus (Walk/Bike/Car) gewechselt wird und es schon ein Ziel gibt, Route neu berechnen
  const changeMode = async (newMode: TransportMode) => {
    triggerSelectionHaptic();
    setMode(newMode);
    if (destination && currentLocation) {
      setIsLoading(true);
      try {
        const routeData = await getRoute(currentLocation, destination, newMode);
        setRoute(routeData);
      } catch (error) {
        // Auch beim Wechsel des Transportmodus kann die Routen-API offline sein.
        Alert.alert(
          "Route unavailable",
          error instanceof Error
            ? error.message
            : "Could not calculate route. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const startWalk = () => {
    triggerImpactHaptic();
    setIsActiveWalk(true);
    if (mapRef.current && currentLocation) {
      mapRef.current.animateCamera({
        center: currentLocation,
        altitude: 150, // Extrem wichtig für iOS (Apple Maps ignoriert zoom)
        zoom: 18,      // Wichtig für Android (Google Maps)
        pitch: 60,     // Stärkerer 3D Winkel
      }, { duration: 1500 });
    }
  };

  const stopWalk = () => {
    triggerSelectionHaptic();
    setIsActiveWalk(false);
    setRoute(null);
    setDestination(null);
    // Zurück zoomen
    if (mapRef.current && currentLocation) {
      mapRef.current.animateCamera({
        center: currentLocation,
        altitude: 4000, // Wieder weiter weg auf iOS
        zoom: 15,       // Wieder weiter weg auf Android
        pitch: 0,
      }, { duration: 1000 });
    }
  };

  const triggerPanic = () => {
    // SOS gibt sofort haptisches Feedback, bevor der Warnhinweis erscheint.
    triggerTestHaptic();
    Alert.alert("EMERGENCY", "Panic Button pressed! Contacting ONLY your configured Safe Contacts. Emergency Services (112) will NOT be called automatically due to legal reasons.", [
      { text: "Cancel", style: "cancel" },
      { text: "Alert Contacts", style: "destructive", onPress: () => console.log("Calling Safe Contacts!") }
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: isActiveWalk ? "Active Walk" : "Plan your Route",
          headerBackTitle: "Back",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerShown: !isActiveWalk, // Header ausblenden beim Gehen
        }} 
      />
      
      {/* Wenn noch geladen wird (GPS-Suche) */}
      {!currentLocation && !errorMsg && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Finding your location...</Text>
        </View>
      )}

      {/* Fehleranzeige GPS */}
      {errorMsg && (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}

      {/* Karte */}
      {currentLocation && (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={!isActiveWalk} // Button verstecken im Walk-Modus
            followsUserLocation={isActiveWalk}
          >
            {/* Ziel-Marker */}
            {destination && (
              <Marker
                coordinate={destination}
                title="Destination"
                pinColor={colors.primary}
              />
            )}

            {/* Routen-Linie */}
            {route && (
              <Polyline
                coordinates={route.coordinates}
                strokeWidth={6}
                strokeColor={colors.primary}
              />
            )}
          </MapView>

          {/* UI Overlays im Planungs-Modus */}
          {!isActiveWalk && (
            <>
              <View style={styles.topContainer} pointerEvents="box-none">
                <AddressSearch onSearch={handleSearch} isLoading={isLoading} />
                
                {/* Transport Mode Selector */}
                <View style={styles.modeSelector}>
                  <TouchableOpacity 
                    style={[styles.modeButton, mode === 'walk' && styles.modeButtonActive]} 
                    onPress={() => changeMode('walk')}
                  >
                    <Ionicons name="walk" size={20} color={mode === 'walk' ? '#FFF' : colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modeButton, mode === 'bike' && styles.modeButtonActive]} 
                    onPress={() => changeMode('bike')}
                  >
                    <Ionicons name="bicycle" size={20} color={mode === 'bike' ? '#FFF' : colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.modeButton, mode === 'car' && styles.modeButtonActive]} 
                    onPress={() => changeMode('car')}
                  >
                    <Ionicons name="car" size={20} color={mode === 'car' ? '#FFF' : colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {route && (
                <RouteInfoCard 
                  summary={route.summary} 
                  mode={mode}
                  onStartNavigation={startWalk} 
                />
              )}
            </>
          )}

          {/* UI Overlays im Active Walk Modus */}
          {isActiveWalk && (
            <View style={styles.activeWalkOverlay}>
              <TouchableOpacity style={styles.endWalkButton} onPress={stopWalk}>
                <Ionicons name="close" size={24} color={colors.text} />
                <Text style={styles.endWalkText}>End Walk</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.panicButton} onPress={triggerPanic}>
                <Ionicons name="alert-circle" size={36} color="#FFF" />
                <Text style={styles.panicText}>PANIC</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    width: "100%",
    height: "100%",
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
  errorText: {
    color: colors.danger,
    textAlign: "center",
    padding: 20,
  },
  topContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  modeSelector: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: colors.card,
    borderRadius: radius.full,
    marginTop: 15, // Dicht unter dem Suchfeld
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modeButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  activeWalkOverlay: {
    position: 'absolute',
    bottom: 50,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  endWalkButton: {
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  endWalkText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: colors.text,
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
