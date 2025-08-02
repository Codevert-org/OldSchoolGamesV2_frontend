import { redirect } from '@sveltejs/kit';

export function load({ cookies }) {
	return {
		error: cookies.get('error'),
		accessToken: cookies.get('accessToken')
	};
}

export const actions = {
	logout: async ({ cookies }) => {
		// Clear the response data on logout
		cookies.delete('error', { path: '/' });
		cookies.delete('accessToken', { path: '/' });
		redirect(302, '/login'); // Redirect to login page after logout
	}
};
