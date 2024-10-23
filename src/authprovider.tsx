import { getConf } from "./Config";
import { parseJwt } from "./util.tsx";

export const authProvider = {
  login: async ({ username, password }: { username: string; password: string }) => {
    
    const conf = getConf();
    const loginUrl = conf.authentication?.endpoint;

    const requestOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: username ? JSON.stringify({ username, password }) : "{}",
    };

    console.log("Logging in:", loginUrl, requestOptions);

    if (!username) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      };
    }

    try {
      const response = await fetch(loginUrl, requestOptions);
      if (response.status === 401 || response.status === 403 || response.status === 422) {
        if (conf.authentication?.redirect) {
          window.location.href = conf.authentication.redirect;
        }
        return Promise.reject();
      } else if (response.status !== 200) {
        return Promise.reject();
      }

      const data = await response.json();
      localStorage.setItem("auth_token", data.access_token);
      localStorage.setItem("username", username);
      
    } catch (err) {
      console.warn(`Authentication Failed: ${err}`);
      return Promise.reject();
    }
  },

  logout: () => {
    console.log("logging out")
    localStorage.removeItem("auth_token");
    return Promise.resolve();
  },

  checkAuth: () => {
    return localStorage.getItem("auth_token") ? Promise.resolve() : Promise.reject();
  },

  checkError: (error: { status: number }) => {
    const { status } = error;
    console.warn("AuthenticationError?", error);
    if (status === 401 || status === 403 || status === 422) {
      return Promise.reject({ redirectTo: '/login' });
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const claims = parseJwt(localStorage.getItem("auth_token") || "");
    return Promise.resolve({
      id: claims?.sub || "public",
      fullName: localStorage.getItem("username") || "public",
      claims: claims
    });
  },

  getPermissions: () => {
    return Promise.resolve("");
  },
};

export default authProvider;