/**
 * The types here are used to define a json schema with the following example
 * structure:
 *
 * "categories": [
 *     {
 *       "category": {
 *         "label": "Billing",
 *         "slug": "billing"
 *       },
 *       "channels": [
 *       {
 *         "label": "In app",
 *         "slug": "in_app",
 *         "enabled": true
 *       },
 *       ...
 *       {
 *         "label": "Slack",
 *         "slug": "slack",
 *         "enabled": true
 *       }
 *     ]
 *   }
 * ]
 */

/** A category preference is definded by a lable and slug.
 */
export type CategoryPreference = {
  /** A human readable label often shown in the UI.
   * The value is unique per project and/or user */
  label: string;
  /** A human readable and machine usable value unique per project and/or user.
   */
  slug: string;
};

/** A channel preference defines the enabled/disabled state of a given
 * channel for a given category. For example, an email channel for the Billing
 * category may be disabled meaning any notificaitons sent to the Billing
 * category would not have a notification sent to the email channel.
 */
export type ChannelPreference = {
  /** A human readable label often shown in the UI. The value is unique
   * across MagicBell. Example values are In app and Mobile push.
   */
  label: string;
  /** A human readable and machine usable value unique across MagicBell.
   * Example values are web_push and in_app.
   */
  slug: string;
  /** When true, the channel has been configured to be enabled and any
   * notifications sent to the category may be sent to this channel (additional
   * filtering may occurr).
   */
  enabled: boolean;
};

/**
 * The category channel preferences assocites a category preference with the
 * channel preferrences.
 */
export type CategoryChannelPreference = {
  category: CategoryPreference;
  channels: ChannelPreference[];
};

/**
 * All category preferences: in practice containing category preferences for a
 * given project and/or user.
 */
export type CategoryChannelPreferences = {
  categories: CategoryChannelPreference[];
};

/**
 * All category preferences: in practice containing category preferences for a
 * given project and/or user.
 */
export default interface IRemoteNotificationPreferences {
  categories: CategoryChannelPreference[];
}
