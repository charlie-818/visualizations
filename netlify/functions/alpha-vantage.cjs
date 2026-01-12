exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get query parameters
  const { symbol, period, outputsize } = event.queryStringParameters || {};

  if (!symbol) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Symbol parameter is required' }),
    };
  }

  // Get API key from environment variable
  // Note: VITE_ prefix is only available during frontend build, not in serverless functions
  // Check both ALPHA_VANTAGE_API_KEY (preferred) and VITE_ALPHA_VANTAGE_API_KEY (for compatibility)
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.VITE_ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API key not configured. Set ALPHA_VANTAGE_API_KEY environment variable' }),
    };
  }

  try {
    // Build Alpha Vantage API URL
    const functionType = 'TIME_SERIES_DAILY';
    // Use 'compact' (100 data points) - 'full' is a premium feature
    const outputSize = outputsize || 'compact';
    
    const url = new URL('https://www.alphavantage.co/query');
    url.searchParams.set('function', functionType);
    url.searchParams.set('symbol', symbol.toUpperCase());
    url.searchParams.set('apikey', apiKey);
    url.searchParams.set('outputsize', outputSize);
    url.searchParams.set('datatype', 'json');

    // Fetch from Alpha Vantage API
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Alpha Vantage API error: ${response.statusText}` }),
      };
    }

    const data = await response.json();

    // Check for API errors
    if (data['Error Message']) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data['Error Message'] }),
      };
    }

    if (data['Note']) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'API rate limit exceeded. Please try again later.' }),
      };
    }

    // Return the data with CORS headers
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET',
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};
