/* eslint-disable @typescript-eslint/no-empty-function */
import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { BigNumber, Contract, ethers } from "ethers";
import { useAccount } from "wagmi";
import { Addresses, mainContractABI, tokenAbi } from "@/contract-constant/index";
import { useEthersSigner } from "@/utils/signer";
import {toast} from "react-hot-toast";
interface UserBalanceContextType {
  deposit: number;
  stake: number;
  setDeposit: React.Dispatch<React.SetStateAction<number>>;
  setStake: React.Dispatch<React.SetStateAction<number>>;

  initialStake: number; // The amount initially staked for the 24-hour period
  stakeLocked: boolean; // Indicates if the stake is locked for 24 hours
  yieldAmount: number; // The total amount returned by the yield after 24 hours

  startStaking: (amount: number) => void; // Start the 24-hour staking period with `amount`
  finalizeStaking: () => void; // Finalize after 24 hours, distribute funds
  setYieldAmount: React.Dispatch<React.SetStateAction<number>>; // Set the yield amount after 24 hours
  stakeAmount: (amount:number) => void;
}

const UserBalanceContext = createContext<UserBalanceContextType>({
  deposit: 0,
  stake: 0,
  setDeposit: () => {},
  setStake: () => {},
  initialStake: 0,
  stakeLocked: false,
  yieldAmount: 0,
  startStaking: () => {},
  finalizeStaking: () => {},
  setYieldAmount: () => {},
  stakeAmount: () => {},
});

export const UserBalanceProvider = ({ children }: { children: ReactNode }) => {
  const { address, chain } = useAccount();
  const [activeChain, setActiveChainId] = useState<number | undefined>(chain?.id);

  useEffect(() => {
    setActiveChainId(chain?.id);
  }, [chain?.id]);

  const signer = useEthersSigner({ chainId: activeChain });

  const [deposit, setDeposit] = useState<number>(() => {
    const storedDeposit = typeof window !== "undefined" ? localStorage.getItem("deposit") : null;
    return storedDeposit ? JSON.parse(storedDeposit) : 0;
  });

  const [stake, setStake] = useState<number>(() => {
    const storedStake = typeof window !== "undefined" ? localStorage.getItem("stake") : null;
    return storedStake ? JSON.parse(storedStake) : 0;
  });

  const [initialStake, setInitialStake] = useState<number>(0);
  const [stakeLocked, setStakeLocked] = useState<boolean>(false);
  const [yieldAmount, setYieldAmount] = useState<number>(0);

  // Whenever deposit changes, write it to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("deposit", JSON.stringify(deposit));
    }
  }, [deposit]);

  const getContractInstance = async (contractAddress: string, contractAbi: any): Promise<Contract | undefined> => {
    try {
      const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);

      return contractInstance;
    } catch (error) {
      console.log("Error in deploying contract");
      return undefined;
    }
  };

  const stakeAmount = async (amount: number) => {
    let id = toast.loading("Depositing...");
    try {
      const mainContract = await getContractInstance(Addresses[activeChain]?.mainContractAddress, mainContractABI);
      let amountEther = ethers.utils.parseEther(amount.toString());
      const tokenContract = await getContractInstance(Addresses[activeChain]?.rewardAddress, tokenAbi);
      
      if (tokenContract) {
        const allowance = await tokenContract.allowance(address, Addresses[activeChain]?.mainContractAddress);
      
        if (allowance.lt(amountEther)) {
          const tx = await tokenContract.approve(Addresses[activeChain]?.mainContractAddress, amountEther);
          await tx.wait();
      
        }
      }
      if (mainContract) {
        const tx = await mainContract?.deposit(amountEther,{from:address});
        await tx.wait();
        toast.success("Deposit and Staked successfully", { id });
      }
    } catch (error) {
      console.log(error, "Error");
      toast.error("Error in staking", { id });
    }
  };


  // Whenever stake changes, write it to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("stake", JSON.stringify(stake));
    }
  }, [stake]);

  useEffect(() => {
    if (!signer) return;
  }, [signer]);

  /**
   * Start the 24-hour staking period with a certain amount.
   * This simulates the user depositing funds that immediately become staked.
   * After calling this, user can't stake more until finalized.
   */
  const startStaking = (amount: number) => {
    if (deposit >= amount && !stakeLocked) {
      // Move from deposit to stake
      setDeposit(deposit - amount);
      setStake(stake + amount);
      setInitialStake(amount);
      setStakeLocked(true);
    }
  };

 
  const finalizeStaking = () => {
    if (!stakeLocked) return; // Not locked, no need to finalize

    const leftover = stake;
    const totalReturned = yieldAmount; // e.g. 136 total from the contract
    const initial = initialStake;

    // Calculate extra yield
    const extraYield = totalReturned - initial; // e.g. 36
    let payout = leftover; // user always gets leftover of what they didn't spend playing

    if (extraYield > 0) {
      const halfExtra = extraYield / 2;
      payout += halfExtra; // Add half the extra yield
    }

    // Reset states
    setDeposit(deposit + payout);
    setStake(0);
    setInitialStake(0);
    setStakeLocked(false);
    setYieldAmount(0);
  };

  return (
    <UserBalanceContext.Provider
      value={{
        deposit,
        stake,
        setDeposit,
        setStake,
        initialStake,
        stakeLocked,
        yieldAmount,
        setYieldAmount,
        startStaking,
        finalizeStaking,
        stakeAmount,
      }}
    >
      {children}
    </UserBalanceContext.Provider>
  );
};

export const useUserBalance = () => useContext(UserBalanceContext);
