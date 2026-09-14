import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

export function useOrderSocket(orderId: string) {
  const [orderState, setOrderState] = useState<any>(null);
  const [driverGps, setDriverGps] = useState<{lat: number, lng: number} | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!orderId || !token) return;

    const socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_SERVICE_URL || 'ws://localhost:3005', {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('connect', () => {
      socket.emit('join_order_room', { orderId });
    });

    socket.on('order_status_changed', (payload) => {
      // Triggered by Kafka 'order.status.updated' event in backend
      setOrderState(payload);
    });

    socket.on('driver_location_update', (payload) => {
      // Triggered by Redis Geo updates
      setDriverGps({ lat: payload.latitude, lng: payload.longitude });
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [orderId, token]);

  return { orderState, driverGps };
}
