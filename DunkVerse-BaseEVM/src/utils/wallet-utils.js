import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createConfig } from 'wagmi';
import { baseSepolia, polygon } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';

// Add Unichain Sepolia Testnet
const unichainSepolia = {
  id: 1301,
  name: "Unichain Sepolia Testnet",
  network: "unichain-sepolia",
  nativeCurrency: {
    name: "Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ["https://sepolia.unichain.org"] },
  },
  blockExplorers: {
    default: { name: "Uniscan", url: "https://sepolia.uniscan.xyz" },
  },
};

// Configure chains and providers
const { chains, publicClient } = configureChains(
  [polygon, baseSepolia, unichainSepolia], // Include Unichain Sepolia
  [
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 137) {
          // Polygon Mainnet
          return {
            http: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
            webSocket:
              'wss://polygon-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_API_KEY',
          };
        } else if (chain.id === baseSepolia.id) {
          // Base Sepolia Testnet
          return {
            http: 'https://sepolia.base.org', // Replace with the actual Base Sepolia RPC URL
          };
        } else if (chain.id === unichainSepolia.id) {
          // Unichain Sepolia Testnet
          return {
            http: 'https://sepolia.unichain.org', // RPC URL for Unichain Sepolia
          };
        } else {
          throw new Error(`Unsupported chain ID: ${chain.id}`);
        }
      },
    }),
  ]
);

// Configure wallet connectors
const { connectors } = getDefaultWallets({
  appName: 'Reels-Fi',
  projectId: '87106bd465234d097b8a51ba585bf799',
  chains,
});

// Create Wagmi configuration
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

export { chains, wagmiConfig };
