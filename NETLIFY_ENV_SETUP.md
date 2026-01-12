# Netlify Environment Variable Setup for StockData.org

## Issue

If you're getting "API token not configured" error from the Netlify function, the environment variable needs to be set in Netlify dashboard.

## Important: Netlify Functions Cannot Use VITE_ Prefix

**Critical**: Netlify Functions run as separate serverless processes and **cannot access** `VITE_` prefixed environment variables at runtime.

- `VITE_*` variables are only available during the **frontend build process**
- Functions need variables **without** the `VITE_` prefix

## Setup Steps

### 1. Set Environment Variable in Netlify Dashboard

1. Go to your Netlify site dashboard: https://app.netlify.com
2. Select your site (info.vaulto.dev)
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable**
5. Add the following:
   - **Key**: `STOCKDATA_ORG_API_TOKEN`
   - **Value**: `qlrkDMzhLXDSHQQAZaVn9QAODHdGa6kDeAXYacul` (your API token)
   - **Scopes**: Select all (Production, Deploy previews, Branch deploys)
6. Click **Save**

### 2. Trigger a New Deploy

After setting the environment variable, you need to trigger a new deploy:

**Option A: Redeploy from Netlify Dashboard**
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

**Option B: Push a commit (triggers automatic deploy)**
```bash
git commit --allow-empty -m "Trigger deploy to pick up env vars"
git push origin main
```

### 3. Verify the Variable is Set

The function will now look for `STOCKDATA_ORG_API_TOKEN` environment variable. After redeploy, the function should work correctly.

## Environment Variable Name

- ✅ **Correct**: `STOCKDATA_ORG_API_TOKEN` (without VITE_ prefix)
- ❌ **Wrong**: `VITE_STOCKDATA_ORG_API_TOKEN` (Functions can't access VITE_ variables)

## Troubleshooting

### Still Getting "API token not configured"?

1. **Verify the variable name**: Must be exactly `STOCKDATA_ORG_API_TOKEN` (case-sensitive)
2. **Check scopes**: Make sure the variable is available for Production
3. **Redeploy**: Functions only pick up environment variables on deploy
4. **Check Netlify logs**: Go to Functions tab → stockdata-org → View logs

### Check Function Logs

1. Go to Netlify dashboard → Your site
2. Go to **Functions** tab
3. Click on **stockdata-org**
4. Click **View logs** to see if there are any errors

## Local Development

For local development with `netlify dev`, the environment variable can be set in:
- `.env` file (in project root)
- Or export in terminal: `export STOCKDATA_ORG_API_TOKEN=your_token`

The `.env` file is gitignored and should not be committed.
