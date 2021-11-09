import produce from 'immer';
import findIndex from 'ramda/src/findIndex';
import mergeRight from 'ramda/src/mergeRight';
import propEq from 'ramda/src/propEq';
import create from 'zustand';
import { INotificationsStoresCollection, INotificationStore, IRemoteNotification } from '../../types';
import buildStore from './helpers/buildStore';
import setStoreProps from './helpers/setStoreProps';
import NotificationRepository from './NotificationRepository';

/**
 * Collection of notifications store. It contains all stores of notifications
 * and exposes methods to interact with them.
 *
 * @private Use the `useNotifications` hook instead.
 */
const useNotificationStoresCollection = create<INotificationsStoresCollection>((set, get) => ({
  stores: {},
  _repository: new NotificationRepository(),

  setStore: (storeId, defaultQueryParams = {}, otherProps: Partial<INotificationStore> = {}) => {
    set(
      produce<INotificationsStoresCollection>((draft) => {
        draft.stores[storeId] = buildStore({ ...otherProps, context: defaultQueryParams });
      }),
    );
  },

  fetchStore: async (storeId, queryParams = {}, options = {}) => {
    const { stores, _repository } = get();
    const store = stores[storeId];

    if (store) {
      const response = await _repository.findBy({ ...store.context, ...queryParams });

      set(
        produce<INotificationsStoresCollection>((draft) => {
          draft.stores[storeId] = setStoreProps(store, { ...response, lastFetchedAt: new Date() }, options);
        }),
      );
    } else {
      console.error(`Store not found. Define a store with the ${storeId} ID`);
    }
  },

  fetchAllStores: async (queryParams = {}, options = {}) => {
    const { stores, fetchStore } = get();
    for (const storeId in stores) {
      fetchStore(storeId, queryParams, options);
    }
  },

  markNotificationAsSeen: (notification: IRemoteNotification) => {
    const { stores } = get();
    const notificationId = notification.id;

    set(
      produce<INotificationsStoresCollection>((draft) => {
        for (const storeId in stores) {
          const { notifications, unseenCount } = stores[storeId];
          const index = findIndex(propEq('id', notificationId), notifications);

          if (index > -1) {
            const notification = notifications[index];

            if (!notification.seenAt) {
              draft.stores[storeId].unseenCount = Math.max(0, unseenCount - 1);
              draft.stores[storeId].notifications[index] = mergeRight(notifications[index], {
                seenAt: Date.now() / 1000,
              });
            }
          }
        }
      }),
    );
  },

  markNotificationAsRead: (notification: IRemoteNotification) => {
    const { stores, _repository } = get();
    const notificationId = notification.id;
    const promise = _repository.markAsRead(notificationId);

    set(
      produce<INotificationsStoresCollection>((draft) => {
        for (const storeId in stores) {
          const { notifications, unreadCount } = stores[storeId];
          const index = findIndex(propEq('id', notificationId), notifications);

          if (index > -1) {
            draft.stores[storeId].unreadCount = Math.max(0, unreadCount - 1);
            draft.stores[storeId].notifications[index] = mergeRight(notifications[index], {
              readAt: Date.now() / 1000,
            });
          }
        }
      }),
    );

    return promise;
  },

  markNotificationAsUnread: (notification: IRemoteNotification) => {
    const { stores, _repository } = get();
    const notificationId = notification.id;
    const promise = _repository.markAsUnread(notificationId);

    set(
      produce<INotificationsStoresCollection>((draft) => {
        for (const storeId in stores) {
          const { notifications, unreadCount } = stores[storeId];
          const index = findIndex(propEq('id', notificationId), notifications);

          if (index > -1) {
            draft.stores[storeId].unreadCount = unreadCount + 1;
            draft.stores[storeId].notifications[index] = mergeRight(notifications[index], { readAt: null });
          }
        }
      }),
    );

    return promise;
  },

  deleteNotification: (notification: IRemoteNotification, options = {}) => {
    const { stores, _repository } = get();
    const notificationId = notification.id;
    const promise = options.persist === false ? Promise.resolve(true) : _repository.delete(notificationId);

    set(
      produce<INotificationsStoresCollection>((draft) => {
        for (const storeId in stores) {
          const { notifications, total, unseenCount, unreadCount } = stores[storeId];
          const index = findIndex(propEq('id', notificationId), notifications);

          if (index > -1) {
            const notification = notifications[index];

            if (!notification.seenAt) draft.stores[storeId].unseenCount = Math.max(0, unseenCount - 1);
            if (!notification.readAt) draft.stores[storeId].unreadCount = Math.max(0, unreadCount - 1);

            draft.stores[storeId].total = Math.max(0, total - 1);
            draft.stores[storeId].notifications.splice(index, 1);
          }
        }
      }),
    );

    return promise;
  },

  markAllAsSeen: (options = { persist: true, updateModels: true }) => {
    const { stores, _repository } = get();
    const promise = options.persist !== false ? _repository.markAllAsSeen() : Promise.resolve(true);

    set(
      produce<INotificationsStoresCollection>((draft) => {
        for (const storeId in stores) {
          const { notifications } = stores[storeId];

          draft.stores[storeId].unseenCount = 0;

          if (options.updateModels !== false) {
            notifications.forEach((notification, index) => {
              draft.stores[storeId].notifications[index] = mergeRight(notification, { seenAt: Date.now() / 1000 });
            });
          }
        }
      }),
    );

    return promise;
  },

  markAllAsRead: (options = { persist: true, updateModels: true }) => {
    const { stores, _repository } = get();
    const promise = options.persist !== false ? _repository.markAllAsRead() : Promise.resolve(true);

    set(
      produce<INotificationsStoresCollection>((draft) => {
        for (const storeId in stores) {
          const { notifications } = stores[storeId];

          draft.stores[storeId].unreadCount = 0;

          if (options.updateModels !== false) {
            notifications.forEach((notification, index) => {
              draft.stores[storeId].notifications[index] = mergeRight(notification, { readAt: Date.now() / 1000 });
            });
          }
        }
      }),
    );

    return promise;
  },
}));

export default useNotificationStoresCollection;
