import React, { useState, createContext, useContext } from "react";
const ToggleContext = createContext();
export function useInfoToggle() {
  console.log(JSON.parse(localStorage.getItem("raconf")).info_toggle_checked);
  return useContext(ToggleContext);
}
export function InfoToggleProvider({ children }) {
  const [infoToggle, setInfoToggle] = useState(
    typeof JSON.parse(localStorage.getItem("raconf")).info_toggle_checked ===
      typeof true
      ? JSON.parse(localStorage.getItem("raconf")).info_toggle_checked
      : localStorage.getItem("infoswitch") === "true"
  );
  return (
    <ToggleContext.Provider value={[infoToggle, setInfoToggle]}>
      {children}
    </ToggleContext.Provider>
  );
}

