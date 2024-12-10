import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  mainnet,
  optimism,
  polygon,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Winfinity',
  projectId: '87106bd465234d097b8a51ba585bf799',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
  ],
});