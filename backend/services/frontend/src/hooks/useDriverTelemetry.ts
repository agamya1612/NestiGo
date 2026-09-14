import { useEffect, useRef } from 'react';
import { apiClient } from '@/lib/api-client';

export function useDriverTelemetry(isOnline: boolean, driverId: string) {
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    if (!isOnline || !driverId) {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
      return;
    }

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          await apiClient.post('/api/dispatch/location', {
            driver_id: driverId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        } catch (error) {
          console.error("Failed to push telemetry", error);
        }
      },
      (err) => console.error(err),
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
    );

    return () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    };
  }, [isOnline, driverId]);
}
