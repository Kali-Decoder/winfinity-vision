import { Chain } from '@rainbow-me/rainbowkit';
import { uxuyWallet } from '@/wallets/uxuyWallet';
import { opBNBTestnet, mainnet } from 'wagmi/chains';
import {
  connectorsForWallets,
} from '@rainbow-me/rainbowkit';

import { createConfig, http } from 'wagmi';
import {
  rainbowWallet,
  walletConnectWallet,
  okxWallet,
} from '@rainbow-me/rainbowkit/wallets';
const chains: readonly [Chain, ...Chain[]] = [mainnet, opBNBTestnet];
const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [uxuyWallet, okxWallet, rainbowWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Winfinity',
    projectId: '87106bd465234d097b8a51ba585bf799',
  }
);

export const config = createConfig({
  connectors,
  chains: chains,
  transports: {
    [opBNBTestnet.id]: http('https://opbnb-testnet-rpc.bnbchain.org/'),
    [mainnet.id]: http('https://bsc-dataseed.binance.org/'),
  },
});
