/**
 * Make a HTTP request and return the typed JSON response.
 * Based on https://www.carlrippon.com/fetch-with-async-await-and-typescript/
 *
 * @param request
 */
export async function fetchJSON<T>(request: RequestInfo): Promise<T> {
  const response = await fetch(request);
  return await response.json();
}
