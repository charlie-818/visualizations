exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // Get query parameters
  const { symbol, date_from, date_to } = event.queryStringParameters || {};

  if (!symbol) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Symbol parameter is required' }),
    };
  }

  // Get API token from environment variable
  const apiToken = process.env.STOCKDATA_ORG_API_TOKEN;
  if (!apiToken) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'API token not configured' }),
    };
  }

  try {
    // Build StockData.org API URL
    const url = new URL('https://api.stockdata.org/v1/data/eod');
    url.searchParams.set('api_token', apiToken);
    url.searchParams.set('symbols', symbol.toUpperCase());
    url.searchParams.set('interval', 'day');
    url.searchParams.set('sort', 'asc');
    
    // Add date parameters if provided
    if (date_from) {
      url.searchParams.set('date_from', date_from);
    }
    if (date_to) {
      url.searchParams.set('date_to', date_to);
    }

    // Fetch from StockData.org API
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `StockData.org API error: ${response.statusText}` }),
      };
    }

    const data = await response.json();

    // Check for API errors
    if (data.error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data.error }),
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
