import { useCallback, useEffect, useState } from "react";

export type NotificationPrefs = {
  publishAlerts: boolean;
  scheduleReminders: boolean;
  agentErrors: boolean;
  weeklyDigest: boolean;
};

const KEY = "agentflow.notifications";

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  publishAlerts: true,
  scheduleReminders: true,
  agentErrors: true,
  weeklyDigest: false,
};

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setPrefs({ ...DEFAULT_NOTIFICATIONS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) });
    } catch {
      /* storage unavailable */
    }
  }, []);

  const update = useCallback((patch: Partial<NotificationPrefs>) => {
    setPrefs((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable */
      }
      return next;
    });
  }, []);

  return { prefs, update };
}
