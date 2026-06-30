import { useEffect } from "react";
import { Linking, Alert } from "react-native";
import { getActiveWalk, markWalkAlarmTriggered } from "../services/walkService";
import {
  getCachedTrustedContacts,
  getTopPriorityContact,
} from "../services/contactService";
import { triggerTestHaptic } from "../services/hapticsService";

// Bereinigt Telefonnummern fuer den tel:-Link, damit Leerzeichen/Klammern nicht stoeren.
function sanitizePhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/[^\d+#*]/g, "");
}

// Holt den wichtigsten Notfallkontakt; offline nutzen wir den lokalen Cache als Rueckfall.
async function getAlarmPhoneNumber() {
  try {
    const topContact = await getTopPriorityContact();
    if (topContact?.contactNumber) {
      return topContact.contactNumber;
    }
  } catch (contactErr) {
    console.error("Error fetching top priority contact", contactErr);
  }

  try {
    const cachedContacts = await getCachedTrustedContacts();
    if (cachedContacts.length > 0) {
      return cachedContacts[0].contactNumber;
    }
  } catch (contactErr) {
    console.error("Error fetching cached contacts", contactErr);
  }

  return "112";
}

export function useWalkAlarm() {
  useEffect(() => {
    // Der Hook laeuft appweit und prueft regelmaessig, ob ein aktiver Walk ueberfaellig ist.
    const interval = setInterval(async () => {
      try {
        const activeWalk = await getActiveWalk();
        if (activeWalk && !activeWalk.hasTriggeredAlarm) {
          const remainingMs = new Date(activeWalk.endsAt).getTime() - Date.now();
          if (remainingMs <= 0) {
            // Sofort markieren, damit der Dialer nicht mehrfach geoeffnet wird.
            await markWalkAlarmTriggered();
            
            triggerTestHaptic();
            
            const phoneToCall = await getAlarmPhoneNumber();
            
            try {
              await Linking.openURL(`tel:${sanitizePhoneNumber(phoneToCall)}`);
            } catch (err) {
              console.error("Error opening dialer", err);
              Alert.alert("Error", "Could not open the phone dialer automatically.");
            }
          }
        }
      } catch (err) {
        console.error("Error checking walk alarm:", err);
      }
    }, 2000); // Alle 2 Sekunden pruefen reicht fuer den Alarm und schont Ressourcen.

    return () => clearInterval(interval);
  }, []);
}
