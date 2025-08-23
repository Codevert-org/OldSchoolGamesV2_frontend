import { checkResponse } from "./checkResponse";

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
  const json = await checkResponse(response);
  return json;
}