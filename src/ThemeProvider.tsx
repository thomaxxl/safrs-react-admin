import React, { useState } from "react";

export const ThemeColorContext = React.createContext(null);

export const ThemeColorProvider: React.FC = ({ children }) => {
  const [themeColor, setThemeColor] = useState(
    localStorage.getItem("ThemeColor") || "default"
  );

  return (
    <ThemeColorContext.Provider
      value={{
        themeColor,
        setThemeColor,
      }}
    >
      {children}
    </ThemeColorContext.Provider>
  );
};
