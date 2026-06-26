# SafeWalk 🛡️

SafeWalk ist ein studentisches App-Projekt, das entwickelt wurde, um den abendlichen Heimweg sicherer zu gestalten. Die App ermöglicht es Benutzern, ihre Route und eine voraussichtliche Ankunftszeit (ETA) festzulegen. Vertrauenswürdige Notfallkontakte können hinterlegt werden, die bei Ablauf der Zeit oder beim Auslösen des SOS-Buttons automatisch kontaktiert werden.

## 🚀 Funktionen
- **Live-Tracking & Routenberechnung:** Integrierte Map zur Berechnung der voraussichtlichen Ankunftszeit für Fußgänger, Rad- und Autofahrer.
- **Aktiver Walk-Modus:** Übersichtliches Interface mit Live-Countdown und SOS-Schnellzugriff.
- **Notfallkontakte:** Verwalte vertrauenswürdige Kontakte mit individuellen Prioritäten.
- **Automatischer Notruf:** Läuft der Timer ab, ohne dass die Ankunft bestätigt wurde, ruft die App automatisch den primären Notfallkontakt (oder 112) an.
- **"Arrived Safely" SMS:** Mit nur einem Klick können Kontakte per vorausgefüllter SMS über die sichere Ankunft informiert werden.

---

## 🛠️ Voraussetzungen

Um die App lokal auszuführen, müssen folgende Tools auf deinem System installiert sein:

1. **Node.js** (Empfohlene LTS-Version): [https://nodejs.org/](https://nodejs.org/)
2. **Git** (zum Klonen des Repositories): [https://git-scm.com/](https://git-scm.com/)
3. **Expo Go App**: Installiere dir die App "Expo Go" auf deinem [iOS (App Store)](https://apps.apple.com/app/expo-go/id982107779) oder [Android (Play Store)](https://play.google.com/store/apps/details?id=host.exp.exponent) Smartphone, um die App physisch testen zu können.

---

## 💻 Installation & Inbetriebnahme

### 1. Repository klonen
Klone das GitHub-Repository auf deinen lokalen Rechner und navigiere in das Verzeichnis:
```bash
git clone https://github.com/EnyaKebbel/SafeWalk.git
cd SafeWalk
```

### 2. Abhängigkeiten (Dependencies) installieren
Installiere alle benötigten Bibliotheken und Module mit npm:
```bash
npm install
```

### 3. Umgebungsvariablen (.env) konfigurieren
Die App benötigt verschiedene API-Keys für Firebase (Datenbank) und OpenRouteService (Map-Routing), um korrekt zu funktionieren. 
Erstelle im Hauptverzeichnis des Projekts (neben der `package.json`) eine Datei namens `.env` und füge deine Keys dort nach folgendem Muster ein:

```env
# OpenRouteService API
EXPO_PUBLIC_OPENROUTESERVICE_API_KEY="DEIN_ORS_API_KEY_HIER"

# Firebase Config
EXPO_PUBLIC_FIREBASE_API_KEY="DEIN_FIREBASE_API_KEY_HIER"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="DEIN_FIREBASE_AUTH_DOMAIN_HIER"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="DEIN_FIREBASE_PROJECT_ID_HIER"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="DEIN_FIREBASE_STORAGE_BUCKET_HIER"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="DEIN_FIREBASE_MESSAGING_SENDER_ID_HIER"
EXPO_PUBLIC_FIREBASE_APP_ID="DEIN_FIREBASE_APP_ID_HIER"
```
*(Hinweis: Diese Datei wird durch `.gitignore` absichtlich nicht bei GitHub hochgeladen, um deine Passwörter zu schützen.)*

### 4. App starten (Development Server)
Starte den Expo-Entwicklungsserver (Metro Bundler) mit dem folgenden Befehl:
```bash
npm run dev
# Alternativ: npx expo start -c (um sicherzustellen, dass der Cache geleert ist)
```

### 5. Auf dem Smartphone ausführen
Sobald der Server läuft, erscheint in deinem Terminal ein großer **QR-Code**.
- **iOS:** Öffne die Standard-Kamera-App deines iPhones und scanne den QR-Code. Tippe auf die Benachrichtigung "In Expo Go öffnen".
- **Android:** Öffne die "Expo Go" App auf deinem Smartphone und nutze die integrierte "Scan QR Code"-Funktion.

Die App wird nun gebündelt und live auf deinem Smartphone ausgeführt! Alle Änderungen, die du ab jetzt im Code vornimmst, werden (dank Hot Reloading) in Echtzeit auf das Smartphone übertragen.

---

## 🎨 Verwendete Technologien
- **React Native** & **Expo** (Framework & Laufzeitumgebung)
- **Expo Router** (Dateibasiertes Routing für Navigation)
- **Firebase** (Backend für Datenspeicherung)
- **React Native Maps** & **OpenRouteService API** (Kartendarstellung & Routenberechnung)
- **Expo Location & Expo SMS** (Zugriff auf Smartphone-Hardware-Funktionen)

---
*Entwickelt im Rahmen eines studentischen Projekts.*
