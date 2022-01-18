import { useEffect } from 'react';
import { eventAggregator } from '../lib/realtime';

/**
 * React hook to listen to events.
 *
 * @param event Name of the event
 * @param handler
 */
export default function useMagicBellEvent(event: string, handler: (data?: any) => void) {
  useEffect(() => {
    eventAggregator.on(event, handler);

    return () => {
      eventAggregator.off(event, handler);
    };
  }, []);
}
