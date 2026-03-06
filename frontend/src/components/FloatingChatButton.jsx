import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@context/AppContext';

export default function FloatingChatButton() {
  const navigate = useNavigate();
  const { user, profile } = useApp();
  
  // Only show for logged-in users (not on login/signup/admin pages)
  const location = window.location.pathname;
  const isAuthPage = location === '/login' || location === '/signup';
  const isAdminPage = location === '/admin' || location.startsWith('/admin');
  
  if (!user || isAuthPage || isAdminPage) {
    return null;
  }

  return (
    <div
      className="floating-chat-btn"
      onClick={() => navigate('/dashboard?tab=chat')}
      title="Chat with Support"
    >
      <span style={{ fontSize: 20 }}>◎</span>
      <span className="floating-chat-tooltip">Chat with Support</span>
    </div>
  );
}

