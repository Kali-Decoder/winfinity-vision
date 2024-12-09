export const ChainId = {
  POLYGON_MAINNET: 137,
  BASE_TESTNET: 84532,
  UNICHAIN_SEPOLIA: 1301, // Added Unichain Sepolia Testnet
};

export const supportedChains = [
  ChainId.POLYGON_MAINNET,
  ChainId.BASE_TESTNET,
  ChainId.UNICHAIN_SEPOLIA, // Added Unichain Sepolia Testnet
];

export const getRPCProvider = (chainId: number): string => {
  switch (chainId) {
    case ChainId.POLYGON_MAINNET:
      return "https://polygon-mainnet.infura.io";
    case ChainId.BASE_TESTNET:
      return "https://sepolia.base.org";
    case ChainId.UNICHAIN_SEPOLIA: // RPC URL for Unichain Sepolia
      return "https://sepolia.unichain.org";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

export const getExplorer = (chainId: number): string => {
  switch (chainId) {
    case ChainId.POLYGON_MAINNET:
      return "https://polygonscan.com";
    case ChainId.BASE_TESTNET:
      return "https://sepolia-explorer.base.org";
    case ChainId.UNICHAIN_SEPOLIA: // Explorer URL for Unichain Sepolia
      return "https://sepolia.uniscan.xyz";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};
