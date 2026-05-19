import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';

const UNKNOWN_NAME_FALLBACK = 'Welcome Back';

export const Greeting: React.FC = () => {
  const { profile } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let timeOfDay = '';

      if (hour >= 5 && hour < 12) {
        timeOfDay = 'Good Morning';
      } else if (hour >= 12 && hour < 18) {
        timeOfDay = 'Good Afternoon';
      } else {
        timeOfDay = 'Good Evening';
      }

      const firstName = profile?.full_name?.split(' ')[0] || '';
      
      if (firstName) {
        setGreeting(`${timeOfDay}, ${firstName}`);
      } else {
        setGreeting(UNKNOWN_NAME_FALLBACK);
      }
      setIsReady(true);
    };

    updateGreeting();
    
    // Optional: Refresh greeting every 15 minutes to handle day transitions
    const interval = setInterval(updateGreeting, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [profile]);

  if (!isReady) return <div className="h-8 md:h-10" />; // Prevent layout shift

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="mb-6"
    >
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 font-sans">
        {greeting}
      </h1>
      <div className="h-1 w-12 bg-blue-600 mt-2 rounded-full" />
    </motion.div>
  );
};
