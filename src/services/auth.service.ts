interface ApiError {
	status: number;
	statusText: string;
	message: string;
}

export async function fetchAuth (endpoint: 'login' | 'register', body: string | FormData) {
  //? control type of data
  if((endpoint === 'login' && typeof body !== "string")
    || (endpoint === 'register' && typeof body !== "object"))
  {
    throw new Error('invalid body type');
  }

  //? set headers
  const headers = endpoint === 'login' ?
  {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': import.meta.env.VITE_BACKEND_URL
  }
  : undefined;

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/${endpoint}`,
    {
      method: 'POST',
      headers,
      body
    }
  )
  
  if (!response.ok) {
		const error: ApiError = {
			status: response.status,
			statusText: response.statusText,
			message: `Erreur : ${response.status} (${response.statusText})`,
		};
		throw error;
	}
  
  

  return response.json();
}