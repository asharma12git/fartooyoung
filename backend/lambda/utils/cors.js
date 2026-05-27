// Returns the correct CORS origin based on the incoming request
const getAllowedOrigin = (event) => {
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    // Production also allows root domain
    ...(process.env.FRONTEND_URL === 'https://www.fartooyoung.org' 
      ? ['https://fartooyoung.org'] 
      : [])
  ];

  const requestOrigin = event?.headers?.origin || event?.headers?.Origin || '';
  
  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }
  
  // Default to FRONTEND_URL if no match
  return process.env.FRONTEND_URL;
};

module.exports = { getAllowedOrigin };
