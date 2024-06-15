import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ThemeColorProvider } from "./ThemeProvider"; // Make sure to import ThemeColorProvider

const rootElement = document.getElementById("root");

if (rootElement) {
  ReactDOM.render(
    <ThemeColorProvider>
      <App />
    </ThemeColorProvider>,
    rootElement
  );
} else {
  console.error("Could not find root element");
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals({});
