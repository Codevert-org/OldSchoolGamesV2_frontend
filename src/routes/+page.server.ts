/* eslint-disable @typescript-eslint/no-unused-vars */
import * as loginData from '$lib/server/login.svelte.js';
import { redirect } from '@sveltejs/kit';


export function load({ cookies }) {
  return {
    response: loginData.getResponse(),
  };
}

export const actions = {
  logout: async ({ cookies }) => {
    // Clear the response data on logout
    loginData.setResponse({});
    redirect(302, '/login'); // Redirect to login page after logout
  }
}