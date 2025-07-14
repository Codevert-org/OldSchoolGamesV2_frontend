/* eslint-disable @typescript-eslint/no-unused-vars */
import * as loginData from '$lib/server/login.svelte.js';

export function load({ cookies }) {
	return {
		response: loginData.getResponse()
	};
}

export const actions = {
	login: async ({ cookies, request }) => {
		const data = await request.formData();
		// Convert FormData to a plain object before multer is implemented on backend
		const json = Object.fromEntries(data);
		const backendResponse = await fetch('https://oldschoolgames-backend.codevert.org/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(json)
		}).then((res) => res.json());
		if (backendResponse.error != undefined) {
			loginData.setResponse({ error: backendResponse.error });
			return;
		}
		loginData.setResponse(backendResponse);
	},

	register: async ({ cookies, request }) => {
		const data = await request.formData();

		// Convert FormData to a plain object before multer is implemented on backend
		const json = Object.fromEntries(data);
		const backendResponse = await fetch(
			'https://oldschoolgames-backend.codevert.org/auth/register',
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(json)
			}
		).then((res) => res.json());
		if (backendResponse.error != undefined) {
			loginData.setResponse({ error: backendResponse.error });
			return;
		}
		loginData.setResponse(backendResponse);
	}
};
