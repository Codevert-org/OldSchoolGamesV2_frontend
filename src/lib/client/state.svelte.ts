import type { Socket } from 'socket.io-client';
import { writable } from 'svelte/store';

type appStateType = {
	logStatus: {
		isLoggedIn: boolean;
		accessToken: string;
	};
	webSocket: Socket | null;
};

export const appState: appStateType = $state({
	logStatus: {
		isLoggedIn: false,
		accessToken: ''
	},
	webSocket: null
});

export function setLogStatus(status: { isLoggedIn: boolean; accessToken: string }) {
	appState.logStatus = status;
}

export function resetLogStatus() {
	appState.logStatus = { isLoggedIn: false, accessToken: '' };
}

export function getLogStatus() {
	return appState.logStatus;
}

export const webSocket = writable();
