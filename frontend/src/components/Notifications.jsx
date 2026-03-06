import React from 'react';
import { useApp } from '@context/AppContext';

export default function Notifications() {
  const { notifications, removeNotification } = useApp();

  if (!notifications.length) return null;

  return (
    <div className="notification">
      {notifications.map((n) => (
        <div
          key={n.id}
          className="notif"
          onClick={() => removeNotification(n.id)}
          style={{ cursor: 'pointer' }}
        >
          {n.msg}
        </div>
      ))}
    </div>
  );
}
