import { useEffect } from 'react';
import { eventAggregator, EventSource } from '../lib/realtime';

interface HookOptions {
  source: EventSource | 'any';
}

/**
 * React hook to listen to events.
 *
 * @param event Name of the event
 * @param handler Callback function
 * @param options
 */
export default function useMagicBellEvent(
  event: string,
  handler: (data?: unknown) => void,
  options: HookOptions = { source: 'any' },
) {
  useEffect(() => {
    const callback = ({ data, source }: { data: unknown; source: EventSource }) => {
      if (options.source === 'remote' && source !== 'remote') return;
      handler(data);
    };

    eventAggregator.on(event, callback);

    return () => {
      eventAggregator.off(event, callback);
    };
  }, []);
}
