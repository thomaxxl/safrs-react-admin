import { getConf } from "./Config";

export const authProvider = {
  login: ({ username, password }: { username: string; password: string }) => {
    const conf = getConf();

    const login_url = `${conf.authentication?.endpoint}`;

    const requestOptions: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: username
        ? JSON.stringify({ username: username, password: password })
        : "{}",
    };
    console.log('auth: ', login_url)
    if (!username) {
      requestOptions.headers = {
        ...requestOptions.headers,
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      };
    }

    return fetch(login_url, requestOptions)
      .then((response) => {
        if (response.status === 403 || response.status === 422) {
          if (conf?.authentication?.redirect) {
            window.location.href = conf.authentication.redirect;
          }
        } else if (response.status !== 200) {
          return Promise.reject();
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem("auth_token", data.access_token);
        localStorage.setItem("username", username);
      })
      .catch((err) => {
        console.warn(`Authentication Failed: ${err}`);
        return Promise.reject();
      });
  },
  logout: () => {
    localStorage.removeItem("auth_token");
    return Promise.resolve();
  },
  checkAuth: () =>
    localStorage.getItem("auth_token") ? Promise.resolve() : Promise.reject(),
  checkError: (error: { status: number }) => {
    console.log("error: ", error);
    const status = error.status;
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getIdentity: () =>
    Promise.resolve({
      id: "user",
      fullName: localStorage.getItem("username") || undefined,
    }),
  getPermissions: () => Promise.resolve(""),
};

export default authProvider;
