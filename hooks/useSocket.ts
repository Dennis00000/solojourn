import { useEffect, useRef } from 'react';
import { socketService } from '../services/socket';

export function useSocket() {
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current) {
      socketService.connect();
      isInitialized.current = true;
    }

    return () => {
      if (isInitialized.current) {
        socketService.disconnect();
        isInitialized.current = false;
      }
    };
  }, []);

  return {
    socket: socketService,
    connected: socketService.connected,
  };
}

export function useSocketEvent(event: string, callback: Function) {
  useEffect(() => {
    socketService.on(event, callback);
    
    return () => {
      socketService.off(event, callback);
    };
  }, [event, callback]);
}