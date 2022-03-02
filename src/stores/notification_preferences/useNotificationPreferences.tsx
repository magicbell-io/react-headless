import produce from 'immer';
import create from 'zustand';

import IRemoteNotificationPreferences, { CategoryChannelPreferences } from '../../types/IRemoteNotificationPreferences';
import NotificationPreferencesRepository from './NotificationPreferencesRepository';

export interface INotificationPreferences extends IRemoteNotificationPreferences {
  lastFetchedAt?: number;

  /**
   * Clears the local notification preferences repository without affecting
   * storage.
   */
  clear: () => void;

  /**
   * Fetch the notification preferences for the current user from the MagicBell
   * server.
   */
  fetch: () => Promise<void>;

  /**
   * Update the notification preferences for the current user.
   *
   * @preferences Object containing the new preferences.
   */
  save: (preferences: CategoryChannelPreferences) => Promise<void>;

  _repository: NotificationPreferencesRepository;
}

/**
 * Remote notification preferences store. It contains all preferences stored in
 * MagicBell servers for this user.
 *
 * @example
 * const { fetch } = useNotificationPreferences();
 * useEffect(() => fetch(), []);
 */
const useNotificationPreferences = create<INotificationPreferences>((set, get) => ({
  categories: [],

  _repository: new NotificationPreferencesRepository(),

  clear: () => {
    set(
      produce((draft: INotificationPreferences) => {
        draft.lastFetchedAt = Date.now();
        draft.categories = [];
      }),
    );
  },

  fetch: async () => {
    const { _repository } = get();
    const preferencesFromServer = await _repository.get();
    if (!preferencesFromServer) {
      // TODO: See NotificationPreferencesRepository.update todo
      return;
    }

    set(
      produce((draft: INotificationPreferences) => {
        draft.lastFetchedAt = Date.now();
        draft.categories = preferencesFromServer.categories;
      }),
    );
  },

  save: async (preferences) => {
    const { _repository } = get();
    const preferencesFromServer = await _repository.update(preferences);
    if (!preferencesFromServer) {
      // TODO: See NotificationPreferencesRepository.update todo
      return;
    }
    set(
      produce((draft: INotificationPreferences) => {
        draft.lastFetchedAt = Date.now();
        draft.categories = preferencesFromServer.categories;
      }),
    );
  },
}));

export default useNotificationPreferences;
