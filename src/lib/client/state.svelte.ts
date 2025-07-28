import type { Socket } from 'socket.io-client';
import socketIOClient from 'socket.io-client';

type appStateType = {
	logStatus: {
		isLoggedIn: boolean;
		accessToken: string;
		user: {
			id: number;
			pseudo: string;
			avatarUrl: string;
		} | null;
	};
	webSocket: Socket | null;
};

export const appState: appStateType = $state({
	logStatus: {
		isLoggedIn: false,
		accessToken: '',
		user: null
	},
	webSocket: null
});

export function setLogStatus(status: { isLoggedIn: boolean; accessToken: string }) {
	appState.logStatus.isLoggedIn = status.isLoggedIn;
	appState.logStatus.accessToken = status.accessToken;
}

export function resetLogStatus() {
	appState.logStatus = { isLoggedIn: false, accessToken: '', user: null };
	appState.webSocket = null;
}

export function getLogStatus() {
	return appState.logStatus;
}

export function setWebSocket(token: string) {
	appState.webSocket ??= socketIOClient('https://oldschoolgames-backend.codevert.org/events', {
		extraHeaders: { Authorization: `Bearer ${token}` }
	});
}
