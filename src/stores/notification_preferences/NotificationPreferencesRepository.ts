import humps from 'humps';

import { fetchAPI, putAPI } from '../../lib/ajax';
import IRemoteNotificationPreferences from '../../types/IRemoteNotificationPreferences';

interface IWrappedNotificationPreferences {
  notificationPreferences: IRemoteNotificationPreferences;
}

/**
 * Class to interact with the notification preferences API endpoints.
 *
 * @example
 * const repo = new NotificationPreferencesRepository();
 * const preferences = repo.get();
 */
export default class NotificationPreferencesRepository {
  remotePathOrUrl: string;

  constructor(remotePathOrUrl = '/notification_preferences') {
    this.remotePathOrUrl = remotePathOrUrl;
  }

  /**
   * Get the user preferences from the API server. Object properties will be camelized.
   * Wrapping of message to server is handled for us (Design Principle: The Principle of Least
   * Knowledge).
   */
  async get(): Promise<IWrappedNotificationPreferences | false> {
    try {
      const url = this.remotePathOrUrl;
      const json = await fetchAPI(url);

      return humps.camelizeKeys(json);
    } catch (error) {
      // To maintain interface compatability as much as possible, we need to
      // return a 403 error but false on a 500 error based on existing test.
      if (error.message === 'Request failed with status code 403') {
        throw error;
      } else {
        return false;
      }
    }
  }

  /**
   * Update user preferences in the API server. Object properties will be decamelized before
   * being send to the server.
   *
   * @param data Preferences to send to the server.
   */
  async update(data: IRemoteNotificationPreferences): Promise<IRemoteNotificationPreferences | false> {
    try {
      const url = this.remotePathOrUrl;
      const payload = humps.decamelizeKeys({ notificationPreferences: data });
      const json = await putAPI(url, payload);

      return humps.camelizeKeys(json);
    } catch (error) {
      // To maintain interface compatability as much as possible, we need to
      // return a 403 error but false on a 500 error based on existing test.
      if (error.message === 'Request failed with status code 403') {
        throw error;
      } else {
        return false;
      }
    }
  }
}
