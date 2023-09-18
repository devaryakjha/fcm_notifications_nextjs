"use client";
import { useEffect, useState } from "react";

const useNotificationPermissionStatus = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");

  useEffect(() => {
    const handler = () => setPermission(Notification.permission);
    handler();
    Notification.requestPermission().then(handler);

    navigator.permissions
      .query({ name: "notifications" })
      .then((notificationPerm) => {
        notificationPerm.onchange = handler;
      });
  }, []);

  return permission;
};

export default useNotificationPermissionStatus;
