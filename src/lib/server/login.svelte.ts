import { Login } from './types/login';

const response: Login = $state(new Login());

export function setResponse(data: Login) {
	delete response.error; // Clear previous error if any
	delete response.message; // Clear previous message if any
	delete response.statusCode; // Clear previous statusCode if any
	delete response.accessToken; // Clear previous accessToken if any
	// Merge new data into the response object
	Object.assign(response, data);
}

export function getResponse() {
	return { ...response };
}
