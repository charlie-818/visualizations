# Stock vs Tokenized Stock Comparison Visualizer

A web application that visualizes the performance comparison between traditional stocks (via yfinance data) and tokenized stocks from Vaulto, including fee distributions.

## Features

- **Interactive Comparison**: Compare traditional stock performance with tokenized stocks side-by-side
- **Fee Distribution**: Visualize how fees from liquidity pools enhance tokenized stock returns
- **Multiple Time Periods**: Analyze performance over 24 hours, 7 days, 30 days, or 1 year
- **Real-time Data**: Fetches live stock data using yfinance API
- **Chart Export**: Export comparison charts as PNG images for sharing
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technical Stack

- **Frontend**: 
  - React 18+ with TypeScript (strict mode)
  - Tailwind CSS for styling
  - Recharts for data visualization
  - Vite for build tooling

- **Backend**:
  - Python Flask
  - Direct Yahoo Finance API (free, no API key required)
  - Optional: Alpha Vantage API (free tier available)
  - Flask-CORS for cross-origin requests

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
│   └── app.py                       # Flask API server
├── package.json
├── tsconfig.json
├── requirements.txt
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- pip (Python package manager)

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. Create a virtual environment (recommended):
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. (Optional) Configure stock data provider:
   - **Default**: Uses direct Yahoo Finance API (free, no setup required, but may have rate limits)
   - **Alternative**: Use Alpha Vantage API (free tier: 5 calls/min, 500/day)
     - Get a free API key at: https://www.alphavantage.co/support/#api-key
     - Set environment variable: `export ALPHA_VANTAGE_API_KEY=your_key_here`
     - Or create a `.env` file with: `ALPHA_VANTAGE_API_KEY=your_key_here`

4. Start the Flask server:
```bash
cd backend
python app.py
```

The backend API will be available at `http://localhost:5001` (port 5001 to avoid conflicts with macOS AirPlay)

### Building for Production

1. Build the frontend:
```bash
npm run build
```

2. The production build will be in the `dist/` directory

## Usage

1. Start both the frontend and backend servers
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

## API Endpoints

### GET `/api/stock-data`
Fetches historical stock price data.

**Query Parameters:**
- `symbol` (required): Stock ticker symbol (e.g., 'NVDA', 'AAPL')
- `period` (required): Time period ('24h', '7d', '30d')

**Response:**
```json
{
  "symbol": "NVDA",
  "prices": [
    {
      "date": "2024-01-01T00:00:00",
      "price": 150.25
    }
  ],
  "currentPrice": 155.30
}
```

### GET `/api/health`
Health check endpoint.

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
