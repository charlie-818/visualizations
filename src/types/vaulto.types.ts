export interface TokenizedStock {
  symbol: string;
  poolTVL: number;
  fees24h: number;
  volume24h: number;
  fees30d: number;
  volume30d: number;
  apr: number | null;
}

export const vaultoData: TokenizedStock[] = [
  { symbol: "SLVon", poolTVL: 657460, fees24h: 965.50, volume24h: 96550, fees30d: 32380, volume30d: 3240000, apr: 59.11 },
  { symbol: "CRCLon", poolTVL: 18580, fees24h: 22.25, volume24h: 2230, fees30d: 753.22, volume30d: 75320, apr: 48.65 },
  { symbol: "NVDAon", poolTVL: 15720, fees24h: 1.44, volume24h: 143.80, fees30d: 444.45, volume30d: 44450, apr: 33.93 },
  { symbol: "SPYon", poolTVL: 10960, fees24h: 0.19, volume24h: 18.59, fees30d: 98.99, volume30d: 9900, apr: 10.84 },
  { symbol: "TSLAon", poolTVL: 8640, fees24h: 15.72, volume24h: 1570, fees30d: 597.04, volume30d: 59700, apr: 82.90 },
  { symbol: "QQQon", poolTVL: 6000, fees24h: 2.38, volume24h: 238.45, fees30d: 153.31, volume30d: 15330, apr: 30.65 },
  { symbol: "GOOGLon", poolTVL: 5000, fees24h: 1.74, volume24h: 173.95, fees30d: 140.44, volume30d: 14040, apr: 33.68 },
  { symbol: "BABAon", poolTVL: 1910, fees24h: 0.18, volume24h: 18.24, fees30d: 85.95, volume30d: 8590, apr: 54.13 },
  { symbol: "TLTon", poolTVL: 1230, fees24h: 3.19, volume24h: 318.50, fees30d: 85.15, volume30d: 8520, apr: 83.13 },
  { symbol: "AAPLon", poolTVL: 688.94, fees24h: 0.81, volume24h: 81.49, fees30d: 103.92, volume30d: 10390, apr: 181.01 },
  { symbol: "COINon", poolTVL: 571.11, fees24h: 2.85, volume24h: 285.11, fees30d: 93.87, volume30d: 9390, apr: 197.23 },
  { symbol: "HOODon", poolTVL: 400, fees24h: 0.5, volume24h: 50, fees30d: 15, volume30d: 1500, apr: null },
  { symbol: "MSFTon", poolTVL: 350, fees24h: 0.3, volume24h: 30, fees30d: 9, volume30d: 900, apr: null },
  { symbol: "MSTRon", poolTVL: 280, fees24h: 0.4, volume24h: 40, fees30d: 12, volume30d: 1200, apr: null },
  { symbol: "NKEon", poolTVL: 200, fees24h: 0.2, volume24h: 20, fees30d: 6, volume30d: 600, apr: null },
  { symbol: "SPGIon", poolTVL: 150, fees24h: 0.15, volume24h: 15, fees30d: 4.5, volume30d: 450, apr: null },
];
