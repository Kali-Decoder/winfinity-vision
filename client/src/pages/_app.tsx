import { AppProps } from 'next/app';
import '@/styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toaster from 'react-hot-toast';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

import { WagmiProvider } from 'wagmi';
import { config } from '@/helper';
import QuizContextProvider from '@/features/Game/contexts/QuizContext';
import TabsContextProvider from '@/features/Game/contexts/TabsContext';

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>     
          {/* Provide contexts and render the page */}
          <QuizContextProvider>
            <TabsContextProvider>
              <Component {...pageProps} />
            </TabsContextProvider>
          </QuizContextProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
      
    </WagmiProvider>
  );
}

export default MyApp;
