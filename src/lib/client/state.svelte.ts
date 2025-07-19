export const appState = $state({
  logStatus: {
    isLoggedIn: false,
    accessToken: ''
  }
})

export function setLogStatus(status: { isLoggedIn: boolean; accessToken: string }) {
  appState.logStatus = status;
}

export function resetLogStatus() {
  appState.logStatus = { isLoggedIn: false, accessToken: '' };
}