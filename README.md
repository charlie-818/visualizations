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

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Alpha Vantage API key:
   - Get a free API key at: https://www.alphavantage.co/support/#api-key
   - Create a `.env` file in the project root:
   ```bash
   VITE_ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```

3. Start the development server:
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

1. Start the development server: `npm run dev`
2. Open your browser to `http://localhost:3000`
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
3. Add: `VITE_ALPHA_VANTAGE_API_KEY` = `your_api_key_here`
4. Connect your GitHub repository to Netlify
5. Deploy!

The application uses Netlify Functions to proxy Alpha Vantage API requests (avoids CORS issues). No backend servers needed!

**Note**: For local testing with Netlify Functions, install Netlify CLI and use `netlify dev` instead of `npm run dev`.

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
