# Stock vs Tokenized Stock Comparison Visualizer

A web application that visualizes the performance comparison between traditional stocks (via Alpha Vantage API) and tokenized stocks from Vaulto, including fee distributions. Fully frontend-only - no backend required!

## Features

- **Interactive Comparison**: Compare traditional stock performance with tokenized stocks side-by-side
- **Fee Distribution**: Visualize how fees from liquidity pools enhance tokenized stock returns
- **Multiple Time Periods**: Analyze performance over 24 hours, 7 days, 30 days, or 1 year
- **Real-time Data**: Fetches live stock data directly from Alpha Vantage API (frontend-only)
- **Chart Export**: Export comparison charts as PNG images for sharing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technical Stack

- **Frontend**: 
  - React 18+ with TypeScript (strict mode)
  - Tailwind CSS for styling
  - Recharts for data visualization
  - Vite for build tooling

- **API**: 
  - Alpha Vantage API (free tier: 5 calls/min, 500/day)
  - Fetches stock data directly from the browser (no backend required)
  - Get a free API key at: https://www.alphavantage.co/support/#api-key

## Project Structure

```
visualizations/
├── src/
│   ├── types/
│   │   ├── stock.types.ts      # Stock and calculation type definitions
│   │   └── vaulto.types.ts     # Vaulto tokenized stock types and data
│   ├── components/
│   │   ├── StockSelector.tsx        # Stock selection dropdown
│   │   ├── InvestmentInput.tsx      # Investment amount input
│   │   ├── TimePeriodSelector.tsx   # Time period selector
│   │   ├── ComparisonChart.tsx      # Dual-line comparison chart
│   │   ├── MetricsSummary.tsx       # Performance metrics display
│   │   ├── LoadingSkeleton.tsx      # Loading state component
│   │   └── ErrorMessage.tsx         # Error display component
│   ├── services/
│   │   ├── yfinance.service.ts      # API service for stock data
│   │   └── vaulto.service.ts        # Vaulto data service
│   ├── utils/
│   │   ├── calculations.ts          # Calculation functions
│   │   └── formatters.ts            # Formatting utilities
│   ├── App.tsx                      # Main application component
│   ├── main.tsx                     # Application entry point
│   └── index.css                    # Global styles
├── backend/
│   └── (legacy - not used)          # Backend is no longer needed
├── package.json
├── tsconfig.json
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Alpha Vantage API key (free) - Get one at: https://www.alphavantage.co/support/#api-key
- Python 3.8+ and pip (for Flask backend option)
- (Optional) Netlify CLI (for Netlify Dev option) - Install with: `npm install -g netlify-cli`

### Local Development Setup

You have **two options** for local development:

#### Option 1: Using Netlify Dev (Recommended - matches production)

This uses Netlify Functions locally, exactly like production:

1. Install dependencies:
```bash
npm install
```

2. Install Netlify CLI globally (if not already installed):
```bash
npm install -g netlify-cli
```

3. Set up Alpha Vantage API key:
   - Create a `.env` file in the project root:
   ```bash
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   # Optional: Also set VITE_ prefix for frontend (if needed)
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```
   **Important**: Netlify Functions cannot access `VITE_` prefixed variables at runtime. The function uses `ALPHA_VANTAGE_API_KEY` (without `VITE_` prefix).

4. Start Netlify Dev:
```bash
npm run netlify:dev
```

The application will be available at `http://localhost:8888` (Netlify Dev's default port)

#### Option 2: Using Flask Backend (Alternative)

This uses a Python Flask backend instead of Netlify Functions:

1. Install Node.js dependencies:
```bash
npm install
```

2. Install Python dependencies:
```bash
cd backend
pip install -r ../requirements.txt
cd ..
```

3. Set up Alpha Vantage API key:
   - Create a `.env` file in the project root:
   ```bash
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   # Or for consistency with Netlify:
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

4. Start Flask backend (in one terminal):
```bash
cd backend
python app.py
```

5. Start Vite dev server (in another terminal):
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

**Note**: Alpha Vantage free tier limitations:
- 5 calls per minute
- 500 calls per day
- No intraday data (24h period uses last 2 days of daily data)

### Building for Production

1. Build the frontend:
```bash
npm run build
```

2. The production build will be in the `dist/` directory

## Usage

### Local Development

1. Choose your preferred local development method (see Setup Instructions above):
   - **Option 1**: Run `npm run netlify:dev` (opens at `http://localhost:8888`)
   - **Option 2**: Run Flask backend (`python backend/app.py`) and then `npm run dev` (opens at `http://localhost:3000`)

2. Open your browser to the appropriate URL

3. Select a tokenized stock from the dropdown (e.g., NVDAon, TSLAon)

4. Enter an investment amount (minimum $1)

5. Select a time period (24h, 7d, or 30d)

6. Click "Compare Performance" to see the visualization

7. Use the "Export PNG" button to download the chart

## Available Tokenized Stocks

The application includes the following tokenized stocks:
- SLVon, CRCLon, NVDAon, SPYon, TSLAon, QQQon
- GOOGLon, BABAon, TLTon, AAPLon, COINon
- HOODon, MSFTon, MSTRon, NKEon, SPGIon

## Calculation Methodology

### Traditional Stock Return
```
Traditional Return = (Price End - Price Start) / Price Start × Investment Amount
```

### Tokenized Stock Return
```
User TVL Fraction = Investment Amount / Pool TVL
Fees Claimable = Total Fees × User TVL Fraction
Tokenized Return = Traditional Return + Fees Claimable
```

The chart shows:
- **Blue Line**: Traditional stock value over time
- **Green Line**: Tokenized stock value over time (traditional + accumulated fees)

## About Vaulto Tokenized Stocks

Vaulto tokenized stocks represent ownership in traditional stocks through blockchain tokens. In addition to tracking the underlying stock price, tokenized stocks earn fees from trading activity in liquidity pools. This means investors can earn additional returns through fees while still benefiting from stock price appreciation.

## Netlify Deployment

1. Get an Alpha Vantage API key: https://www.alphavantage.co/support/#api-key
2. In Netlify, go to Site settings → Environment variables
3. Add: `ALPHA_VANTAGE_API_KEY` = `your_api_key_here` (without `VITE_` prefix)
   - **Important**: Netlify Functions cannot access `VITE_` prefixed variables at runtime
   - The function code checks both `ALPHA_VANTAGE_API_KEY` (preferred) and `VITE_ALPHA_VANTAGE_API_KEY` (for compatibility)
4. Connect your GitHub repository to Netlify
5. Deploy!

The application uses Netlify Functions to proxy Alpha Vantage API requests (avoids CORS issues). No backend servers needed!

**Note**: For local testing that matches production, use Option 1 in the Setup Instructions (`npm run netlify:dev`). This runs Netlify Functions locally and avoids the "Unexpected token '<'" error you might encounter with other local setups.

## Development

### TypeScript Configuration
- Strict mode enabled
- All types are explicitly defined
- No implicit any types

### Code Style
- Functional components with hooks
- TypeScript interfaces for all data structures
- Error handling with typed error responses
- Input validation with type guards

## License

This project is for educational and demonstration purposes.
