import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem("schoolDarkMode") === "true"; }
    catch { return false; }
  });

  const [language, setLanguage] = useState(() => {
    try { return localStorage.getItem("schoolLanguage") || "English"; }
    catch { return "English"; }
  });

  // Apply or remove the 'dark' class on <html>
  const applyDarkMode = useCallback((isDark) => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    // Force a repaint by accessing a DOM property (no unused expression)
    void document.body.offsetHeight;
  }, []);

  // Run whenever darkMode changes
  useEffect(() => {
    applyDarkMode(darkMode);
    try { localStorage.setItem("schoolDarkMode", String(darkMode)); } catch {}
  }, [darkMode, applyDarkMode]);

  // Sync language to localStorage
  useEffect(() => {
    try { localStorage.setItem("schoolLanguage", language); } catch {}
  }, [language]);

  // On mount, ensure class matches stored preference
  useEffect(() => {
    applyDarkMode(darkMode);
  }, [applyDarkMode, darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const toggleLanguage = (lang) => setLanguage(lang);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleDarkMode, language, setLanguage, toggleLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);