export function load({ cookies }) {
	const userCookie = cookies.get('user');
  let user;
  if (userCookie) {
    user = JSON.parse(userCookie);
  }
  return {
		error: cookies.get('error'),
		user
	};
}

export const actions = {
	default: async ({ cookies, request }) => {
		cookies.delete('error', { path: '/' });
		const data = await request.formData();
		const backendResponse = await fetch('https://oldschoolgames-backend.codevert.org/users/me', {
			method: 'PUT',
      headers: {
        Authorization: `Bearer ${cookies.get('accessToken')}`
      },
			body: data
		}).then((res) => res.json());
		if (backendResponse.error != undefined) {
			cookies.set('error', backendResponse.message, { path: '/' });
			return;
		}
		cookies.set('user', JSON.stringify(backendResponse), { path: '/' });
	},
};
