import { useState, useEffect } from "react";

export function useNotifications() {
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("glowup_notifications");
    return saved ? JSON.parse(saved) : {
      workout: true,
      water: true,
      progress: true,
      permission: false,
    };
  });

  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    localStorage.setItem("glowup_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const requestPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotifications(n => ({ ...n, permission: permission === "granted" }));
      return permission === "granted";
    }
    return false;
  };

  const sendNotification = (title, body, icon = "✨") => {
    if (notifications.permission && "Notification" in window) {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
    // Always show in-app toast
    const id = Date.now();
    setToasts(t => [...t, { id, title, body, icon }]);
    setTimeout(() => setToasts(t => t.filter(toast => toast.id !== id)), 4000);
  };

  const toggle = (key) => setNotifications(n => ({ ...n, [key]: !n[key] }));

  // Schedule reminders using setInterval (simplified for demo)
  useEffect(() => {
    if (!notifications.workout) return;
    const now = new Date();
    const reminderHour = 8; // 8 AM workout reminder
    const msUntil8AM = ((reminderHour - now.getHours()) * 60 * 60 + (0 - now.getMinutes()) * 60) * 1000;
    if (msUntil8AM > 0 && msUntil8AM < 86400000) {
      const t = setTimeout(() => sendNotification("💪 Workout Time!", "Time for your daily workout. Let's crush it!"), msUntil8AM);
      return () => clearTimeout(t);
    }
  }, [notifications.workout]);

  useEffect(() => {
    if (!notifications.water) return;
    // Water reminder every 2 hours
    const interval = setInterval(() => {
      sendNotification("💧 Water Reminder", "Time to drink water! Stay hydrated.");
    }, 2 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [notifications.water]);

  return { notifications, toggle, requestPermission, sendNotification, toasts };
}
