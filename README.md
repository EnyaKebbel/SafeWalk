# SafeWalk

SafeWalk ist eine App, die wir für ein Projekt im Studium entwickelt haben. Die Idee dahinter ist, dass man abends sicherer nach Hause kommt. Man kann seine Route auf einer Karte planen und die App schätzt, wie lange man braucht. Wenn man nach Ablauf der Zeit nicht bestätigt hat, dass man sicher angekommen ist, ruft die App automatisch einen Notfallkontakt an. 

## Funktionen
- Karte mit Routenberechnung für Fußgänger, Fahrrad und Auto
- Live-Ansicht für den aktuellen Weg nach Hause
- SOS-Button, um schnell Hilfe zu rufen
- Liste für eigene Notfallkontakte
- Automatischer Anruf beim ersten Kontakt auf der Liste, wenn die Zeit abläuft
- SMS-Funktion, um mit einem Klick Bescheid zu geben, dass man da ist

## Was man braucht
Damit man die App auf dem eigenen PC bearbeiten und starten kann, braucht man ein paar Programme:
- Node.js
- Git
- Die kostenlose App "Expo Go" auf dem Handy (gibt es im Apple App Store und Google Play Store)

## Installation und Start
1. Zuerst lädt man sich den Code runter:
```bash
git clone https://github.com/EnyaKebbel/SafeWalk.git
cd SafeWalk
```

2. Dann installiert man die ganzen Pakete mit npm:
```bash
npm install
```

3. Wichtig: Die App braucht API-Keys, sonst funktionieren die Karte und die Datenbank nicht.
Dafür muss man im Hauptordner eine Datei erstellen, die einfach nur `.env` heißt. In diese Datei kopiert man Folgendes rein und trägt seine eigenen Keys ein:

```env
EXPO_PUBLIC_OPENROUTESERVICE_API_KEY="HIER_DER_ORS_KEY"

EXPO_PUBLIC_FIREBASE_API_KEY="HIER_DER_FIREBASE_KEY"
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="HIER_DIE_DOMAIN"
EXPO_PUBLIC_FIREBASE_PROJECT_ID="HIER_DIE_ID"
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="HIER_DER_BUCKET"
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="HIER_DIE_SENDER_ID"
EXPO_PUBLIC_FIREBASE_APP_ID="HIER_DIE_APP_ID"
```
(Die echten Keys können wir aus Sicherheitsgründen hier nicht hochladen.)

4. App starten:
Um die App laufen zu lassen, gibt man das im Terminal ein:
```bash
npm run dev
```

5. Auf dem Handy testen:
Im Terminal taucht dann ein QR-Code auf. Den scannt man einfach mit der normalen Handykamera (bei iOS) oder direkt in der Expo Go App (bei Android). Danach öffnet sich die App auf dem Handy und man kann sie ausprobieren.

## Verwendete Sachen
- React Native und Expo
- Firebase für die Datenbank
- OpenRouteService für die Map
- Expo Router

Entwickelt von Enni und Vanessa.
