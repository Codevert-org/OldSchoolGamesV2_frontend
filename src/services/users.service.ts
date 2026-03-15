import { checkResponse } from "./checkResponse";

export async function checkPseudoAvailable(pseudo: string): Promise<boolean> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/users/check-pseudo?pseudo=${encodeURIComponent(pseudo)}`
  );
  if (!response.ok) return false;
  const json = await response.json();
  return json.available === true;
}

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

export type StatsPeriod = 'week' | 'month' | 'year';

export interface IGameStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
  ratio: number;
}

export interface IStats {
  global: IGameStats;
  byGame: Record<string, IGameStats>;
}

export async function fetchStats(period: StatsPeriod): Promise<IStats> {
  const response = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/users/me/stats?period=${period}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    }
  );
  return checkResponse(response);
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