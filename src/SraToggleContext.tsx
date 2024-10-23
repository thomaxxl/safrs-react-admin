import React, { useState, createContext, useContext } from "react";
import { getCurrentConf } from "./Config";
import { get } from "http";

// Provide a default value for the context that matches the shape of the value you're going to provide.
const SraContext = createContext([false, () => {}]);

export function useInfoToggle() {
  return useContext(SraContext);
}

export function SraProvider({ children }: any) {
  const conf = getCurrentConf();
  const iTog = localStorage.getItem("infoswitch") === "true" || sessionStorage.getItem("infoswitch") === "true" || conf?.info_toggle_checked === true;
  const [infoToggle, setInfoToggle] = useState(iTog);
  
  return (
    <SraContext.Provider value={[infoToggle, setInfoToggle]}>
      {children}
    </SraContext.Provider>
  );
}
