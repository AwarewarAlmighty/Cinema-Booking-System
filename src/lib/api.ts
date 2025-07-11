/**
 * A centralized API fetch function.
 * It makes requests to relative endpoints (e.g., /api/movies), and Netlify's
 * proxy will forward them to the backend server defined in the netlify.toml file.
 *
 * @param {string} endpoint - The API endpoint to call (e.g., '/api/movies').
 * @param {RequestInit} [options={}] - Optional fetch options (method, body, etc.).
 * @returns {Promise<any>} A promise that resolves to the JSON response.
 */
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // The endpoint should always start with '/api/' for the proxy to work.
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // If the server's response is not OK, we throw an error to be caught
  // by the calling function, which helps in debugging.
  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`API call to ${endpoint} failed with status ${response.status}: ${errorBody}`);
    throw new Error(`API call failed: ${response.statusText}`);
  }

  // If the response is successful, parse and return the JSON body.
  return response.json();
};