"use client";

import React, {
  useState,
  useEffect,
  useLayoutEffect,
} from "react";
import { WalletTgSdk } from "@uxuycom/web3-tg-sdk";
import { ethers } from "ethers";
import { approveABI, CHAINS, erc20Abi } from "@/config/index.js";

const DEFAULT_CHAIN_ID = "0x38"; // BSC
const KEY_STORE = {
  Cache_BSC: "Cache_BSC",
};
const walletTgSdk = new WalletTgSdk();
const { ethereum } = walletTgSdk;

const defaultChainConfig = CHAINS.find(
  (chain) => String(chain?.chainId) === DEFAULT_CHAIN_ID
);

export default function Home() {
  const [chainId, setChainId] = useState("0x1");
  const [address, setAddress] = useState("");
  const [btnLoadingConnect, setBtnLoadingConnect] = useState(false);

  const init = async () => {
    // if (typeof window === "undefined") {
    //   console.log("Oops, `window` is not defined")
    // }
    // window?.Telegram?.WebApp?.expand?.();
    const accounts = await ethereum.request({
      method: "eth_accounts",
      params: [],
    });

    console.log("accounts", accounts);
    const chainId = await ethereum.request({
      method: "eth_chainId",
      params: [],
    });
    const isConnected = accounts[0];
    setChainId(chainId);
    setAddress(accounts[0]);
    initEventListener();
    isConnected && switchChain(DEFAULT_CHAIN_ID);
  };

  function initEventListener() {
    // events
    ethereum.removeAllListeners();
    function handleAccountsChanged(accounts) {
      setAddress(accounts[0]);
    }
    function handleChainChanged(_chainId) {
      setChainId("0x" + Number(_chainId).toString(16));
    }

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
  }

  useLayoutEffect(() => {
    init();
  }, []);

  useEffect(() => {
    if (!chainId) {
      return;
    }
    const chainConfig = CHAINS.find(
      (chain) => parseInt(chain?.chainId) == parseInt(chainId)
    );
    if (!chainConfig) {
      return;
    }
    const RPC_URL = chainConfig?.chainRPCs?.[0] || "";

    console.log("RPC_URL", RPC_URL,chainId);
  }, [chainId]);

  const connectWallet = async () => {
    console.log("ethereum Hello", ethereum);
 
    try {
      await ethereum.request({
        method: "eth_requestAccounts",
        params: [],
      });

      console.log("Connected:", acc);

      const accounts = await ethereum.request({
        method: "eth_accounts",
        params: [],
      });

      const chainId = await ethereum.request({
        method: "eth_chainId",
        params: [],
      });
      setAddress(accounts[0]);
      setChainId(chainId);
      switchChain(DEFAULT_CHAIN_ID);


      console.log("Connected:", accounts[0],chainId);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  
  };

  // Switch chian Event
  const switchChain = async (chainId) => {
    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      });
      console.log("Chain switch successful");
    } catch (error) {
      console.error("Chain switch failed:", error);
      console.error("Chain switch failed:", error.message);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <p className="mb-2">Arcade Games !!!</p>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={connectWallet}
        >
          Connect Wallet
        </button>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        Nikku.Dev {chainId} {address}
      </footer>
    </div>
  );
}
