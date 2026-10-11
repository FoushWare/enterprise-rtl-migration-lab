import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "@atlas/design-system";
import App from "./App";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
