import React, { useState, useEffect } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Text, ScrollView, Keyboard } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, spacing, radius } from "../../constants/theme";
import { fetchAutocompleteSuggestions, AddressSuggestion } from "../../services/mapService";

interface AddressSearchProps {
  onSearch: (address: string) => void;
  isLoading?: boolean;
}

export default function AddressSearch({ onSearch, isLoading = false }: AddressSearchProps) {
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Debouncing effect für API Calls
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (address.length >= 3) {
        setIsTyping(true);
        const results = await fetchAutocompleteSuggestions(address);
        setSuggestions(results);
        setIsTyping(false);
      } else {
        setSuggestions([]);
      }
    }, 500); // 500ms warten nach letztem Tastendruck

    return () => clearTimeout(delayDebounceFn);
  }, [address]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim().length > 0) {
      Keyboard.dismiss();
      setSuggestions([]); // Dropdown schließen
      onSearch(searchQuery.trim());
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={colors.mutedText} style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Where do you want to walk to?"
          placeholderTextColor={colors.mutedText}
          value={address}
          onChangeText={setAddress}
          onSubmitEditing={() => handleSearch(address)}
          returnKeyType="search"
        />
        {isLoading || isTyping ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity onPress={() => handleSearch(address)} disabled={address.length === 0}>
            <Ionicons 
              name="arrow-forward-circle" 
              size={28} 
              color={address.length > 0 ? colors.primary : colors.border} 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Autocomplete Dropdown */}
      {suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 200 }}>
            {suggestions.map((item, index) => (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.suggestionItem, index < suggestions.length - 1 && styles.suggestionBorder]}
                onPress={() => {
                  setAddress(item.label);
                  handleSearch(item.label);
                }}
              >
                <Ionicons name="location-outline" size={18} color={colors.mutedText} style={{ marginRight: 10 }} />
                <Text style={styles.suggestionText} numberOfLines={2}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    zIndex: 10,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 8,
  },
  dropdown: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    overflow: "hidden",
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  }
});
