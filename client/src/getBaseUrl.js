// Get the full URL from the document
const fullUrl = window.location.href;

// Create a URL object
const url = new URL(fullUrl);

// Get the base URL without the protocol and port
const baseUrl = url.hostname;

export default baseUrl;
