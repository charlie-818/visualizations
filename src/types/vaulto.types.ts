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
  { symbol: "SLVon", poolTVL: 1050000, fees24h: 20760, volume24h: 2080000, fees30d: 82590, volume30d: 8260000, apr: 93.95 },
  { symbol: "CRCLon", poolTVL: 14140, fees24h: 137.56, volume24h: 13760, fees30d: 916.51, volume30d: 91650, apr: 77.76 },
  { symbol: "NVDAon", poolTVL: 11640, fees24h: 36.77, volume24h: 3680, fees30d: 738.73, volume30d: 73870, apr: 76.13 },
  { symbol: "SPYon", poolTVL: 10860, fees24h: 2.13, volume24h: 213.10, fees30d: 80.27, volume30d: 8030, apr: 8.87 },
  { symbol: "QQQon", poolTVL: 8760, fees24h: 15.11, volume24h: 1510, fees30d: 234.97, volume30d: 23500, apr: 32.19 },
  { symbol: "TSLAon", poolTVL: 6270, fees24h: 19.44, volume24h: 1940, fees30d: 406.02, volume30d: 40600, apr: 77.76 },
  { symbol: "GOOGLon", poolTVL: 5680, fees24h: 11.73, volume24h: 1170, fees30d: 222.31, volume30d: 22230, apr: 46.95 },
  { symbol: "BABAon", poolTVL: 2780, fees24h: 2.11, volume24h: 210.95, fees30d: 73.16, volume30d: 7320, apr: 31.56 },
  { symbol: "TLTon", poolTVL: 1400, fees24h: 1.72, volume24h: 171.59, fees30d: 81.59, volume30d: 8160, apr: 69.72 },
  { symbol: "AAPLon", poolTVL: 629.43, fees24h: 0.57, volume24h: 56.77, fees30d: 14.42, volume30d: 1440, apr: 27.49 },
  { symbol: "COINon", poolTVL: 77.82, fees24h: 5.27, volume24h: 526.76, fees30d: 123.77, volume30d: 12380, apr: null },
  { symbol: "MSFTon", poolTVL: 31.00, fees24h: 0.00, volume24h: 0.00, fees30d: 6.02, volume30d: 601.84, apr: null },
  { symbol: "HOODon", poolTVL: 8.56, fees24h: 0.00, volume24h: 0.00, fees30d: 13.24, volume30d: 1320, apr: null },
  { symbol: "MSTRon", poolTVL: 0.99, fees24h: 0.00, volume24h: 0.00, fees30d: 20.00, volume30d: 2000, apr: null },
  { symbol: "NKEon", poolTVL: 0.10, fees24h: 0.00, volume24h: 0.00, fees30d: 0.10, volume30d: 9.78, apr: null },
  { symbol: "SPGIon", poolTVL: 0.00, fees24h: 0.00, volume24h: 0.00, fees30d: 0.01, volume30d: 1.99, apr: null },
];
