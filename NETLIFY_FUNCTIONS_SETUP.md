# Netlify Functions Setup & Troubleshooting Guide

## Configuration Summary

This document summarizes the Netlify Functions setup and how to ensure full compatibility.

## Function Location

The Netlify function is located at:
- **Path**: `netlify/functions/alpha-vantage.cjs`
- **Type**: CommonJS (`.cjs` extension)
- **Function name**: `alpha-vantage`

## Configuration Files

### 1. `netlify.toml`

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"  # Explicitly specifies functions directory

[dev]
  command = "npm run dev"
  targetPort = 5173

# Proxy API requests to Netlify Function (must come before SPA fallback)
[[redirects]]
  from = "/api/alpha-vantage"
  to = "/.netlify/functions/alpha-vantage"
  status = 200

# SPA fallback (must be last)
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**Key Points**:
- `functions = "netlify/functions"` explicitly tells Netlify where to find functions
- Redirect rule order matters: API routes must come before the catch-all `/*` rule
- Redirects use `status = 200` (rewrites), not `status = 301` (redirects)

### 2. Environment Variables

**Critical**: Netlify Functions cannot access `VITE_` prefixed environment variables at runtime.

- `VITE_*` variables are only available during the **frontend build process**
- Functions run as separate serverless processes and need variables **without** the `VITE_` prefix

**Correct Setup**:

**Local Development (`.env` file)**:
```bash
ALPHA_VANTAGE_API_KEY=your_api_key_here
# Optional: Also set VITE_ prefix if frontend needs it
VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

**Production (Netlify Dashboard)**:
- Go to: Site settings → Environment variables
- Add: `ALPHA_VANTAGE_API_KEY` = `your_api_key_here` (without `VITE_` prefix)

**Function Code**:
The function checks both variables for compatibility:
```javascript
const apiKey = process.env.ALPHA_VANTAGE_API_KEY || process.env.VITE_ALPHA_VANTAGE_API_KEY;
```

## Testing

### Run Comprehensive Tests

```bash
node test-function-comprehensive.js
```

This tests:
1. ✅ Direct function endpoint (`.netlify/functions/alpha-vantage`)
2. ✅ Proxied endpoint (`/api/alpha-vantage`)
3. ✅ CORS headers
4. ✅ Error handling
5. ✅ Routing configuration

### Manual Testing

**Test direct endpoint**:
```bash
curl "http://localhost:8888/.netlify/functions/alpha-vantage?symbol=AAPL"
```

**Test proxied endpoint**:
```bash
curl "http://localhost:8888/api/alpha-vantage?symbol=AAPL"
```

**Test error handling**:
```bash
curl "http://localhost:8888/.netlify/functions/alpha-vantage"
# Should return 400 with error message
```

## Common Issues & Solutions

### Issue 1: Function not found

**Symptoms**: 404 errors when calling function

**Solutions**:
- Ensure function is in `netlify/functions/` directory
- Check `netlify.toml` has `functions = "netlify/functions"` specified
- Verify function file name matches the function name in the URL

### Issue 2: API key not configured

**Symptoms**: 500 error with "API key not configured" message

**Solutions**:
- Ensure `.env` file has `ALPHA_VANTAGE_API_KEY` (without `VITE_` prefix)
- In production, set `ALPHA_VANTAGE_API_KEY` in Netlify dashboard (not `VITE_ALPHA_VANTAGE_API_KEY`)
- Restart `netlify dev` after changing `.env` file

### Issue 3: CORS errors in browser

**Symptoms**: CORS errors when calling function from frontend

**Solutions**:
- Function already includes CORS headers:
  ```javascript
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET',
  }
  ```
- Verify function is being called via the proxied endpoint (`/api/alpha-vantage`)

### Issue 4: Redirect rule not working

**Symptoms**: `/api/alpha-vantage` returns 404 or HTML instead of JSON

**Solutions**:
- Ensure redirect rule comes **before** the catch-all `/*` rule in `netlify.toml`
- Check redirect uses `status = 200` (rewrite), not `status = 301` (redirect)
- Verify function exists and is accessible via direct endpoint

### Issue 5: Rate limiting from Alpha Vantage API

**Symptoms**: Function returns rate limit messages

**Note**: This is **expected behavior** with Alpha Vantage free tier:
- 5 calls per minute
- 500 calls per day

**Solutions**:
- Wait before making more requests
- Use Alpha Vantage premium tier for higher limits
- Implement caching in your application

## Production Deployment Checklist

- [ ] Function file exists at `netlify/functions/alpha-vantage.cjs`
- [ ] `netlify.toml` specifies `functions = "netlify/functions"`
- [ ] Redirect rule is configured in `netlify.toml`
- [ ] Environment variable `ALPHA_VANTAGE_API_KEY` is set in Netlify dashboard (without `VITE_` prefix)
- [ ] Function code checks for both `ALPHA_VANTAGE_API_KEY` and `VITE_ALPHA_VANTAGE_API_KEY` for compatibility
- [ ] Redirect rule order is correct (API routes before catch-all)
- [ ] CORS headers are included in function response

## Architecture

```
Frontend (React)
    ↓
/api/alpha-vantage (redirect rule)
    ↓
/.netlify/functions/alpha-vantage (Netlify Function)
    ↓
Alpha Vantage API
```

The redirect rule in `netlify.toml` rewrites `/api/alpha-vantage` to `/.netlify/functions/alpha-vantage` transparently, so the frontend doesn't need to know about the underlying function path.

## Additional Resources

- [Netlify Functions Documentation](https://docs.netlify.com/functions/overview/)
- [Netlify Redirect Rules](https://docs.netlify.com/routing/redirects/)
- [Alpha Vantage API Documentation](https://www.alphavantage.co/documentation/)
