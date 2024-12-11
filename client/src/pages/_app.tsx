import { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { arbitrum, base, mainnet, optimism, polygon } from 'wagmi/chains';

import {
  connectorsForWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';

import {
  rainbowWallet,
  walletConnectWallet,
  okxWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { Chain } from '@rainbow-me/rainbowkit';
import { uxuyWallet } from '@/wallets/uxuyWallet';
function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  const chains: readonly [Chain, ...Chain[]] = [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
  ];
  const connectors = connectorsForWallets(
    [
      {
        groupName: 'Recommended',
        wallets: [uxuyWallet,okxWallet, rainbowWallet, walletConnectWallet],
      },
    ],
    {
      appName: 'Winfinity',
      projectId: '87106bd465234d097b8a51ba585bf799',
    }
  );

  const config = createConfig({
    connectors,
    chains: chains,
    transports: {
      [mainnet.id]: http('<YOUR_RPC_URL>'),
      [polygon.id]: http('<YOUR_RPC_URL>'),
      [optimism.id]: http('<YOUR_RPC_URL>'),
      [arbitrum.id]: http('<YOUR_RPC_URL>'),
      [base.id]: http('<YOUR_RPC_URL>'),
    },
  });

  return (
    <>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <div className='relative'>
              <Component {...pageProps} />
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </>
  );
}

export default MyApp;
