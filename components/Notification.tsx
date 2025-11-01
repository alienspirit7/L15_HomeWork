
import React from 'react';

interface NotificationProps {
  message: string | null;
}

export const Notification: React.FC<NotificationProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="absolute top-0 left-0 right-0 p-2 bg-blue-600 text-white text-center shadow-lg transition-opacity duration-300">
      <p>{message}</p>
    </div>
  );
};
