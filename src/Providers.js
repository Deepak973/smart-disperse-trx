"use client";
import React, { useMemo, useState } from "react";
import "@rainbow-me/rainbowkit/styles.css";
import {
  RainbowKitProvider,
  getDefaultWallets,
  getDefaultConfig,
} from "@rainbow-me/rainbowkit";
import { metaMaskWallet } from "@rainbow-me/rainbowkit/wallets";
import {
  scroll,
  scrollSepolia,
  sepolia,
  optimismSepolia,
  baseSepolia,
  base,
  optimism,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import Navbar from "./Components/Navbar/Navbar";
// import {
//   WalletDisconnectedError,
//   WalletNotFoundError,
// } from "@tronweb3/tronwallet-abstract-adapter";
import {
  WalletProvider,
  useWallet,
} from "@tronweb3/tronwallet-adapter-react-hooks";
import { WalletModalProvider } from "@tronweb3/tronwallet-adapter-react-ui";
import toast from "react-hot-toast";
import {
  TronLinkAdapter,
  TokenPocketAdapter,
  BitKeepAdapter,
} from "@tronweb3/tronwallet-adapters";
import { WalletConnectAdapter } from "@tronweb3/tronwallet-adapter-walletconnect";
import { LedgerAdapter } from "@tronweb3/tronwallet-adapter-ledger";
import Cookies from "universal-cookie";
const { wallets } = getDefaultWallets();
const modeTestnet = {
  id: 919,
  name: "Mode Testnet",
  network: "Mode",
  nativeCurrency: {
    decimals: 18,
    name: "Mode Testnet",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://sepolia.mode.network/"] },
    default: { http: ["https://sepolia.mode.network/"] },
  },
};

const modeMainnet = {
  id: 34443,
  name: "Mode Mainnet",
  network: "Mode",
  nativeCurrency: {
    decimals: 18,
    name: "Mode Mainnet",
    symbol: "ETH",
  },
  rpcUrls: {
    public: { http: ["https://mainnet.mode.network/"] },
    default: { http: ["https://mainnet.mode.network/"] },
  },
};

// const root = ReactDOM.createRoot(document.getElementById("root"));

export function Providers({ children }) {
  const [isSigned, setIsSigned] = useState();
  const cookie = new Cookies();
  function onError(e) {
    console.log(e);
    // if (e instanceof WalletNotFoundError) {
    //   toast.error(e.message);
    // } else if (e instanceof WalletDisconnectedError) {
    //   toast.error(e.message);
    // } else toast.error(e.message);
  }
  const adapters = useMemo(function () {
    const tronLink1 = new TronLinkAdapter();
    const walletConnect1 = new WalletConnectAdapter({
      network: "Nile",
      options: {
        relayUrl: "wss://relay.walletconnect.com",
        // example WC app project ID
        projectId: "5fc507d8fc7ae913fff0b8071c7df231",
        metadata: {
          name: "Test DApp",
          description: "JustLend WalletConnect",
          url: "https://your-dapp-url.org/",
          icons: ["https://your-dapp-url.org/mainLogo.svg"],
        },
      },
      web3ModalConfig: {
        themeMode: "dark",
        themeVariables: {
          "--w3m-z-index": "1000",
        },
        // explorerRecommendedWalletIds: 'NONE',
        enableExplorer: true,
        explorerRecommendedWalletIds: [
          "225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f",
          "1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369",
          "4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0",
        ],
        // mobileWallets: [],
        // desktopWallets: []
        // explorerExcludedWalletIds: [
        //   '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
        //   '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
        //   '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
        //   '802a2041afdaf4c7e41a2903e98df333c8835897532699ad370f829390c6900f',
        //   'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
        //   '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
        //   '6464873279d46030c0b6b005b33da6be5ed57a752be3ef1f857dc10eaf8028aa',
        //   '2c81da3add65899baeac53758a07e652eea46dbb5195b8074772c62a77bbf568'
        // ]
      },
    });
    const ledger = new LedgerAdapter({
      accountNumber: 2,
    });
    const tokenPocket = new TokenPocketAdapter();
    const bitKeep = new BitKeepAdapter();
    // const okxWalletAdapter = new OkxWalletAdapter();
    // return [
    //   tronLink1,
    //   walletConnect1,
    //   ledger,
    //   tokenPocket,
    //   bitKeep,
    //   okxWalletAdapter,
    // ];
  }, []);
  function onConnect() {
    console.log("onConnect");
  }
  function onDisconnect() {
    cookie.set("jwt_token", null);
  }
  async function onAccountsChanged() {
    console.log("onAccountsChanged");
  }
  async function onAdapterChanged(adapter) {
    console.log("onAdapterChanged", adapter);
  }

  const chains = [
    modeMainnet,
    scroll,
    modeTestnet,
    scrollSepolia,
    sepolia,
    optimismSepolia,
    baseSepolia,
    base,
    optimism,
  ];
  const config = getDefaultConfig({
    appName: "RainbowKit demo",
    projectId: "f8a6524307e28135845a9fe5811fcaa2",
    wallets: [
      {
        groupName: "Other",
        wallets: [metaMaskWallet],
      },
    ],
    chains: chains,
    ssr: true,
  });
  const queryClient = new QueryClient();

  return (
    <WalletProvider
      onError={onError}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onAccountsChanged={onAccountsChanged}
      onAdapterChanged={onAdapterChanged}
      autoConnect={true}
      adapters={adapters}
      disableAutoConnectOnLoad={true}
    >
      <WalletModalProvider>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              <>
                <Navbar />
                {children}
              </>
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </WalletModalProvider>
    </WalletProvider>
  );
}
