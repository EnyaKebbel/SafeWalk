import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { colors, radius, spacing } from "../../constants/theme";
import { ActiveWalk } from "../../services/walkService";
import { geocodeAddress, getRoute, Coordinates, RouteData } from "../../services/mapService";

type RouteMapPreviewProps = {
  activeWalk?: ActiveWalk | null;
};

export default function RouteMapPreview({ activeWalk }: RouteMapPreviewProps) {
  const mapRef = useRef<MapView>(null);
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(null);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      try {
        let location = await Location.getCurrentPositionAsync({});
        const coords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        setCurrentLocation(coords);

        // Falls wir einen activeWalk haben, Route berechnen
        if (activeWalk?.destination) {
          const destCoords = await geocodeAddress(activeWalk.destination);
          setDestinationCoords(destCoords);
          const routeData = await getRoute(coords, destCoords, 'walk');
          setRoute(routeData);

          if (mapRef.current) {
            mapRef.current.fitToCoordinates([coords, destCoords], {
              edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
              animated: false,
            });
          }
        }
      } catch (err) {
        console.warn("Error fetching map preview data:", err);
      }
    })();
  }, [activeWalk]);

  return (
    <TouchableOpacity 
      style={styles.mapPreviewCard}
      activeOpacity={0.9}
      onPress={() => router.push('/walk')}
    >
      <View style={styles.placeholderMap}>
        {!currentLocation ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.previewText}>Loading Map...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              latitudeDelta: activeWalk ? 0.05 : 0.01,
              longitudeDelta: activeWalk ? 0.05 : 0.01,
            }}
            showsUserLocation={true}
            showsMyLocationButton={false}
            scrollEnabled={false} // Im Preview nicht scrollen, sonst klickt man nicht auf die Card
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {destinationCoords && activeWalk && (
              <Marker
                coordinate={destinationCoords}
                title="Destination"
                pinColor={colors.primary}
              />
            )}
            {route && activeWalk && (
              <Polyline
                coordinates={route.coordinates}
                strokeWidth={5}
                strokeColor={colors.primary}
              />
            )}
          </MapView>
        )}
      </View>
      <View style={styles.cardFooter}>
        <Ionicons name="map" size={20} color={colors.primary} />
        <Text style={styles.footerText}>
          {activeWalk ? "Active Route" : "Tap to select your route"}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mapPreviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.sm,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    marginBottom: spacing.lg,
    flex: 1, 
  },
  placeholderMap: {
    flex: 1,
    minHeight: 200,
    backgroundColor: '#E8F0FE', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    marginTop: 10,
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    marginLeft: spacing.sm,
    color: colors.text,
    fontFamily: "nunito-bold",
    fontSize: 15,
  }
});
