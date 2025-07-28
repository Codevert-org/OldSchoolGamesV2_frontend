export async function load({ cookies }) {
	const getMeResponse = await fetch('https://oldschoolgames-backend.codevert.org/users/me', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${cookies.get('accessToken')}`
    }
  });

  if (!getMeResponse.ok) {
    // Handle error, e.g., redirect to login or show an error message
    return {
      error: 'Failed to fetch user data'
    };
  }

  const userData = await getMeResponse.json();
  return {
    user: userData,
  };
}