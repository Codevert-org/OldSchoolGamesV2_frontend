import type { IApiError } from "../interfaces/IApiError";

export async function checkResponse(response: Response) {
  const json = await response.json();
  if (!response.ok) {
    const error: IApiError = {
      status: response.status,
      statusText: response.statusText,
      message: json.message,
    };
    throw error;
  }
  return json;
}
