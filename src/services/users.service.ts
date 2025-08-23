import { checkResponse } from "./checkResponse";

export async function fetchMe() {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`,
    {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Access-Control-Allow-Origin': import.meta.env.VITE_BACKEND_URL
      }
    }
  )
  await checkResponse(response);
  return await response.json();
}

export async function fetchUpdateUser(formData: FormData) {
  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/users/me`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Access-Control-Allow-Origin': import.meta.env.VITE_BACKEND_URL
    },
    body: formData
  })
  const json = await checkResponse(response);
  return await json;
}