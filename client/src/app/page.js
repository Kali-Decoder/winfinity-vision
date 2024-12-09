"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic"; // Ensures client-side loading of components
import { ethers } from "ethers";
import { approveABI, CHAINS, erc20Abi } from "@/config/index.js";

// Dynamically import WalletTgSdk to prevent server-side execution
const WalletTgSdk = dynamic(
  () => import("@uxuycom/web3-tg-sdk").then((mod) => mod.WalletTgSdk),
  { ssr: false } // Disable server-side rendering
);

const DEFAULT_CHAIN_ID = "0x38"; // BSC

export default function Home() {
  const [chainId, setChainId] = useState("0x1"); // Default to Ethereum Mainnet
  const [address, setAddress] = useState("");
  const [btnLoadingConnect, setBtnLoadingConnect] = useState(false);
  const [walletTgSdk, setWalletTgSdk] = useState(null);

  useEffect(() => {
    // Initialize WalletTgSdk only on the client
    const sdk = new WalletTgSdk();
    setWalletTgSdk(sdk);
  }, []);

  const init = async () => {
    if (!walletTgSdk) {
      console.error("Wallet SDK not initialized");
      return;
    }

    const { ethereum } = walletTgSdk;

    try {
      const accounts = await ethereum.request({
        method: "eth_accounts",
      });

      const chainId = await ethereum.request({
        method: "eth_chainId",
      });

      setChainId(chainId);
      setAddress(accounts[0]);
      initEventListener(ethereum);

      if (accounts[0]) {
        switchChain(DEFAULT_CHAIN_ID);
      }
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  };

  const initEventListener = (ethereum) => {
    if (!ethereum) {
      console.error("Ethereum provider not found");
      return;
    }

    ethereum.removeAllListeners();

    ethereum.on("accountsChanged", (accounts) => {
      setAddress(accounts[0] || "");
    });

    ethereum.on("chainChanged", (_chainId) => {
      setChainId("0x" + Number(_chainId).toString(16));
    });
  };

  useEffect(() => {
    if (walletTgSdk) {
      init();
    }
  }, [walletTgSdk]);

  const connectWallet = async () => {
    if (!walletTgSdk) {
      console.error("Wallet SDK not initialized");
      return;
    }

    const { ethereum } = walletTgSdk;

    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await ethereum.request({
        method: "eth_chainId",
      });

      setAddress(accounts[0]);
      setChainId(chainId);
      switchChain(DEFAULT_CHAIN_ID);

      console.log("Connected:", accounts[0], chainId);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const switchChain = async (targetChainId) => {
    if (!walletTgSdk) {
      console.error("Wallet SDK not initialized");
      return;
    }

    const { ethereum } = walletTgSdk;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });

      console.log("Chain switch successful");
    } catch (error) {
      console.error("Chain switch failed:", error.message);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <p className="mb-2">Winfinity GAMES GAME Games !!!</p>
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
