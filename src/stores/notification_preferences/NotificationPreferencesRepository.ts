import humps from 'humps';

import { fetchAPI, putAPI } from '../../lib/ajax';
import { CategoryChannelPreferences } from '../../types/IRemoteNotificationPreferences';

/**
 * The shape of a Notification preferences for a given user is of the form:
 *
 *  {
 *    "notification_preferences": {
 *      "categories": [
 *        {
 *          "category": {
 *            "label": "Billing",
 *            "slug": "billing"
 *          },
 *          "channels": [
 *            {
 *              "label": "In app",
 *              "slug": "in_app",
 *              "enabled": true
 *            },
 *            ...
 *            {
 *              "label": "Slack",
 *              "slug": "slack",
 *              "enabled": true
 *            }
 *          ]
 *        }
 *      ]
 *    }
 *  }
 */

interface IWrappedNotificationPreferences {
  notificationPreferences: CategoryChannelPreferences;
}

const isWrappedNotificationPreferences = (item: unknown): item is IWrappedNotificationPreferences => {
  if (null === item || typeof item !== 'object') {
    return false;
  }
  if ('notificationPreferences' in (item as IWrappedNotificationPreferences)) {
    const preferences = (item as IWrappedNotificationPreferences).notificationPreferences;
    return 'categories' in (preferences as CategoryChannelPreferences);
  }
  return false;
};

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
   * Get the user preferences from the API server. Object properties will be
   * camelized. Wrapping of message to server is handled for us (Design
   * Principle: The Principle of Least Knowledge).
   */
  async get(): Promise<CategoryChannelPreferences | false> {
    try {
      const json = await fetchAPI(this.remotePathOrUrl);
      const wrappedResult = humps.camelizeKeys(json);
      if (isWrappedNotificationPreferences(wrappedResult)) {
        return wrappedResult.notificationPreferences;
      } else {
        // TODO: We may want to consider doing something other than logging the error
        // eslint-disable-next-line no-console
        // console.warn(
        //   `Error while fetching category channel preferences. Type returned by a call to ${this.remotePathOrUrl} wasn't an IWrappedNotificationPreferences.`,
        // );
        return false;
      }
    } catch (err) {
      // To maintain interface compatability as much as possible, we need to
      // return a 403 error but false on a 500 error based on existing test.
      if (err.message === 'Request failed with status code 403') {
        throw err;
      } else {
        return false;
      }
    }
  }

  /**
   * Update user preferences in the API server. Object properties will be
   * decamelized before being send to the server.
   *
   * @param categories Categories to send to the server.
   */
  async update(categories: CategoryChannelPreferences): Promise<CategoryChannelPreferences | false> {
    const wrappedPreferences: IWrappedNotificationPreferences = {
      notificationPreferences: categories,
    };
    try {
      const json = await putAPI(this.remotePathOrUrl, humps.decamelizeKeys(wrappedPreferences));
      const wrappedResult = humps.camelizeKeys(json);
      if (isWrappedNotificationPreferences(wrappedResult)) {
        return wrappedResult.notificationPreferences;
      } else {
        // TODO: We may want to consider doing something other than logging the error
        // eslint-disable-next-line no-console
        // console.warn(
        //   `Error while updating category channel preferences. Type returned by a call to ${this.remotePathOrUrl} wasn't an IWrappedNotificationPreferences.`,
        // );
        return false;
      }
    } catch (err) {
      // To maintain interface compatability as much as possible, we need to
      // return a 403 error but false on a 500 error based on existing test.
      if (err.message === 'Request failed with status code 403') {
        throw err;
      } else {
        return false;
      }
    }
  }
}
