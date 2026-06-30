import { useEffect } from "react";
import { Linking, Alert } from "react-native";
import { getActiveWalk, markWalkAlarmTriggered } from "../services/walkService";
import { getCachedTrustedContacts } from "../services/contactService";
import { triggerTestHaptic } from "../services/hapticsService";

export function useWalkAlarm() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const activeWalk = await getActiveWalk();
        if (activeWalk && !activeWalk.hasTriggeredAlarm) {
          const remainingMs = new Date(activeWalk.endsAt).getTime() - Date.now();
          if (remainingMs <= 0) {
            await markWalkAlarmTriggered();
            
            triggerTestHaptic();
            
            let phoneToCall = "112";
            try {
              const cachedContacts = await getCachedTrustedContacts();
              if (cachedContacts && cachedContacts.length > 0) {
                phoneToCall = cachedContacts[0].contactNumber;
              }
            } catch (contactErr) {
              console.error("Error fetching cached contacts", contactErr);
            }
            
            try {
              await Linking.openURL(`tel:${phoneToCall}`);
            } catch (err) {
              console.error("Error opening dialer", err);
              Alert.alert("Error", "Could not open the phone dialer automatically.");
            }
          }
        }
      } catch (err) {
        console.error("Error checking walk alarm:", err);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, []);
}
