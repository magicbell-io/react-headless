import { isNil } from 'ramda';

import { IRemoteNotification } from '../../../types';
import { IStrategyComparator } from '../../../types/INotificationStore';

function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

function ensureArray(value) {
  return Array.isArray(value) ? value : [value];
}

export type NotificationCompareStrategy = (
  notification: IRemoteNotification,
  context: Record<string, unknown>,
  comparator?: IStrategyComparator,
) => { result: boolean; delta: string[] };

/**
 * Check if a notification satisfies all conditions of the given `context`. It
 * Uses equal to compare.
 *
 * @param notification Notification to test
 * @param context Set of rules to test the notification against
 * @param comparator Function used to compare notification attributes and context values
 */
export function objMatchesContext(
  notification: IRemoteNotification,
  context: Record<string, unknown>,
  comparator: IStrategyComparator = eq,
) {
  const diff: string[] = [];

  Object.keys(context).forEach((attr) => {
    const value = context[attr];

    if (
      (attr === 'read' && !comparator(!isNil(notification.readAt), value)) ||
      (attr === 'seen' && !comparator(!isNil(notification.seenAt), value)) ||
      (attr === 'categories' && ensureArray(value).some((category) => !comparator(notification.category, category))) ||
      (Object.hasOwnProperty.call(notification, attr) && !comparator(notification[attr], value))
    ) {
      diff.push(attr);
    }
  });

  return { result: diff.length === 0, delta: diff };
}
