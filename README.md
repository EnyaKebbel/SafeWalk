# SafeWalk

SafeWalk ist eine App, die wir für ein Projekt im Studium entwickelt haben. Die Idee dahinter ist, dass man abends sicherer nach Hause kommt. 
Man kann seine Route auf einer Karte planen und die App schätzt, wie lange man braucht. Wenn man nach Ablauf der Zeit nicht bestätigt hat, 
dass man sicher angekommen ist, ruft die App automatisch einen Notfallkontakt an. 

## Funktionen
- Karte mit Routenberechnung für Fußgänger, Fahrrad und Auto
- Live-Ansicht für den aktuellen Weg nach Hause
- SOS-Button, um schnell Hilfe zu rufen
- Liste für eigene Notfallkontakte
- Automatischer Anruf beim ersten Kontakt auf der Liste, wenn die Zeit abläuft
- SMS-Funktion, um mit einem (drei) Klick Bescheid zu geben, dass man da ist

## Was man braucht
Damit man die App auf dem eigenen PC bearbeiten und starten kann, braucht man:
- Node.js
- Git
- Die App "Expo Go" auf dem Handy

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
EXPO_PUBLIC_OPENROUTESERVICE_KEY=dein_openrouteservice_api_key
```

4. App starten:
Um die App laufen zu lassen, gibt man das im Terminal ein:
```bash
npx expo start
```

5. Auf dem Handy testen:
Im Terminal taucht dann ein QR-Code auf. Den scannt man einfach mit der normalen Handykamera (bei iOS) oder direkt in der Expo Go App 
(bei Android). Danach öffnet sich die App auf dem Handy und man kann sie ausprobieren.

## Verwendete Sachen
- React Native und Expo
- Firebase für die Datenbank
- OpenRouteService für die Map
- Expo Router

## Offline und Caching
SafeWalk speichert wichtige Daten lokal auf dem Gerät, damit ein Teil der App auch ohne stabile Internetverbindung nutzbar bleibt.
Der aktive Walk, die Notification-Einstellung und die zuletzt geladenen Notfallkontakte werden mit AsyncStorage gecacht.
Wenn Firebase gerade nicht erreichbar ist, zeigt die Kontaktliste die zuletzt gespeicherten Kontakte mit einem Offline-Hinweis an.

Die Karten- und Routenfunktionen brauchen weiterhin Internet, weil sie OpenRouteService und den Kartenanbieter verwenden.

Entwickelt von Enya und Vanessa :)
