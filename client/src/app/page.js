"use client";

import React, { useState, useEffect, useLayoutEffect } from "react";
import { WalletTgSdk } from "@uxuycom/web3-tg-sdk";
import { ethers } from "ethers";
import { approveABI, CHAINS, erc20Abi } from "@/config/index.js";

const DEFAULT_CHAIN_ID = "0x38"; // BSC
const KEY_STORE = {
  Cache_BSC: "Cache_BSC",
};
const walletTgSdk = new WalletTgSdk();

export default function Home() {
  const [chainId, setChainId] = useState("0x1"); // Default to Ethereum Mainnet
  const [address, setAddress] = useState("");
  const [btnLoadingConnect, setBtnLoadingConnect] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure the component knows it's running on the client
    setIsClient(true);
  }, []);

  const init = async () => {
    if (!isClient) {
      console.log("Not running in the client environment");
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
      initEventListener();

      if (accounts[0]) {
        switchChain(DEFAULT_CHAIN_ID);
      }
    } catch (error) {
      console.error("Initialization failed:", error);
    }
  };

  function initEventListener() {
    const { ethereum } = walletTgSdk;

    if (!ethereum) {
      console.error("Ethereum provider not found");
      return;
    }

    // Remove existing listeners to avoid duplicates
    ethereum.removeAllListeners();

    // Account and chain change handlers
    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0] || "");
    };

    const handleChainChanged = (_chainId) => {
      setChainId("0x" + Number(_chainId).toString(16));
    };

    // Attach new listeners
    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);
  }

  useEffect(() => {
    if (isClient) {
      init();
    }
  }, [isClient]);

  useEffect(() => {
    if (!chainId || !isClient) {
      return;
    }

    const chainConfig = CHAINS.find(
      (chain) => parseInt(chain?.chainId) === parseInt(chainId)
    );

    if (!chainConfig) {
      console.warn("Unknown chain ID:", chainId);
      return;
    }

    const RPC_URL = chainConfig?.chainRPCs?.[0] || "";

    console.log("RPC_URL", RPC_URL, chainId);
  }, [chainId, isClient]);

  const connectWallet = async () => {
    if (!isClient) {
      console.error("Not running in the client environment");
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
    if (!isClient) {
      console.error("Not running in the client environment");
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
