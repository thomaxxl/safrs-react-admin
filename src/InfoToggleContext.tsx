import React, { useState, createContext, useContext } from "react";

// Provide a default value for the context that matches the shape of the value you're going to provide.
const ToggleContext = createContext([false, () => {}]);

export function useInfoToggle() {
  return useContext(ToggleContext);
}

export function InfoToggleProvider({ children }: any) {
  const [infoToggle, setInfoToggle] = useState(
    typeof JSON.parse(localStorage.getItem("raconf") || "{}")
      .info_toggle_checked === typeof true
      ? JSON.parse(localStorage.getItem("raconf") || "{}").info_toggle_checked
      : localStorage.getItem("infoswitch") === "true"
  );
  return (
    <ToggleContext.Provider value={[infoToggle, setInfoToggle]}>
      {children}
    </ToggleContext.Provider>
  );
}
