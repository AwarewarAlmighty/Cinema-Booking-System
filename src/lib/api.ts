// We are temporarily hardcoding the URL to ensure the connection works.
const API_BASE_URL = 'https://cinema-booking.zapto.org';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  // Construct the full URL for the API endpoint
  const fullUrl = `${API_BASE_URL}${endpoint}`;

  console.log(`Fetching from: ${fullUrl}`); // This will help in debugging

  const response = await fetch(fullUrl, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    // If the response is not OK, we throw an error to be caught by the calling function
    const errorBody = await response.text(); // Get the response body for more details
    console.error(`API call failed with status ${response.status}: ${errorBody}`);
    throw new Error(`API call failed: ${response.statusText}`);
  }

  // If the response is OK, parse it as JSON
  return response.json();
};