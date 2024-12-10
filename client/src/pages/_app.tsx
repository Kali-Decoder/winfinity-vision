import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { AppProps } from 'next/app';
import { WagmiConfig } from 'wagmi';

import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { chains, wagmiConfig } from '@/utils/wallet-utils';
import { UserBalanceProvider } from '@/context/UserBalanceContext';
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
        <WagmiConfig config={wagmiConfig}>
          <RainbowKitProvider chains={chains}>
            <UserBalanceProvider>
            <div className='relative'>
              <Component {...pageProps} />
            </div>
            </UserBalanceProvider>
          </RainbowKitProvider>
        </WagmiConfig>
    </>
  );
}

export default MyApp;
