import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingService } from '../services/settingService';
import { getWhatsAppLink, getCallLink } from '../utils/formatters';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    business_name: 'Shree Radha kripa Reality',
    phone: '+91 8510992504',
    whatsapp: '+918510992504',
    email: 'shreeradhakripareality@gmail.com',
    address: 'Plot 42, Sector 62, Noida, Uttar Pradesh 201309',
    maps_url: 'https://maps.google.com',
    default_whatsapp_message: 'Hi, I am interested in property {property_code} - {bhk} {furnishing} in {locality}.'
  });
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const data = await settingService.getPublicSettings();
      setSettings(data);
    } catch (err) {
      console.warn('Could not fetch remote settings, using defaults.', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const getWhatsAppUrl = (property) => {
    return getWhatsAppLink(settings.whatsapp, settings.default_whatsapp_message, property);
  };

  const getCallUrl = () => {
    return getCallLink(settings.phone);
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, getWhatsAppUrl, getCallUrl }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
