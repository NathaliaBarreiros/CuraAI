import React from 'react';
import { PrivyProvider as BasePrivyProvider } from '@privy-io/react-auth';
import { WagmiProvider } from '@privy-io/wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http } from 'wagmi';
import {mainnet, sepolia} from 'viem/chains';

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function PrivyProvider({ children }) {
  // For Chrome extension, we'll use a demo App ID or environment variable
  const appId = process.env.REACT_APP_PRIVY_APP_ID || 'cmey8r7xh00gcl80bojtalleb';


  if (!appId) {
    console.warn('Privy App ID not found, authentication features will not be available');
    return <>{children}</>;
  }

  try {
    return (
      <BasePrivyProvider
        appId={appId}
        config={{
          appearance: {
            theme: 'light',
            accentColor: '#667eea',
          },
          embeddedWallets: {
            createOnLogin: 'users-without-wallets',
          },
          loginMethods: ['email', 'google', 'wallet'],
          supportedChains: [mainnet, sepolia],
        }}
      >
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </BasePrivyProvider>
    );
  } catch (error) {
    console.error('Failed to initialize Privy Provider:', error);
    return <>{children}</>;
  }
}

export default PrivyProvider;
