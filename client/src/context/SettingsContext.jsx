import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios'; // Import standard axios for unauthenticated initial fetch
import { API_BASE_URL } from '../config';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    appName: "Journal.",
    slogan: "Your private collection of memories",
    logoUrl: ""
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/settings`);
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch global settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, fetchSettings, loading }}>
      {!loading && children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
