import React, { ReactNode, useContext, useEffect, useState } from 'react';
import {
  NFTInfo,
  PreQuestions,
  Question,
  Quiz,
} from '@/features/Game/types/Types';
import { config } from '@/helper';
import { toast } from 'react-toastify';
import { parseEther } from 'ethers';
import { PostQuestions } from '../types/Types';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import {
  mainContractABI,
  mainContractAddress,
  tokenAbi,
  tokenAddress,
} from '@/contract-constant';
import { readContract } from '@wagmi/core';
type QuizContext = {
  activeQuiz: boolean;
  setActiveQuiz: React.Dispatch<React.SetStateAction<boolean>>;
  activeStep: 'pre-questions' | 'questions' | 'post-questions';
  setActiveStep: React.Dispatch<
    React.SetStateAction<'pre-questions' | 'questions' | 'post-questions'>
  >;
  preQuestions: PreQuestions;
  setPreQuestions: React.Dispatch<React.SetStateAction<PreQuestions>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  postQuestions: PostQuestions;
  setPostQuestions: React.Dispatch<React.SetStateAction<PostQuestions>>;
  NFTInfo: NFTInfo;
  setNFTInfo: React.Dispatch<React.SetStateAction<NFTInfo>>;
  deposit: number;
  setDeposit: React.Dispatch<React.SetStateAction<number>>;
  stake: number;
  setStake: React.Dispatch<React.SetStateAction<number>>;
  stakeYourAmount: (amount: string) => Promise<void>;
  yieldAmount: number;
  getStake: () => Promise<void>;
  unstakeYourAmount: (amount: string) => Promise<void>;
  claimYourAmount: () => Promise<void>;
  currentRewardPerToken: number;
};

export const QuizContext = React.createContext<QuizContext>({} as QuizContext);

export const useQuizContext = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizContext must be used within a QuizContextProvider');
  }
  return context;
};

const QuizContextProvider = ({ children }: { children: ReactNode }) => {
  const { address, chain } = useAccount();
  const { data: hash, writeContractAsync, status } = useWriteContract();
  const [yieldAmount, setYieldAmount] = useState<number>(0);
  const [activeQuiz, setActiveQuiz] = useState(false);
  const [currentRewardPerToken, setCurrentRewardPerToken] = useState<number>(0);
  const [activeStep, setActiveStep] =
    useState<Quiz['activeStep']>('pre-questions');
  const [preQuestions, setPreQuestions] = useState<PreQuestions>({
    NFTFlowId: '',
    players: [{ profileImage: '', handle: '', points: 0, countryImage: '' }],
    categoryImage: <></>,
    requiredBet: '',
  });
  const [questions, setQuestions] = useState<Question[]>({} as Question[]);
  const [postQuestions, setPostQuestions] = useState<PostQuestions>(
    {} as PostQuestions
  );
  const [NFTInfo, setNFTInfo] = useState<NFTInfo>({
    NFTId: '',
    NFTName: '',
    NFTDescription: '',
    NFTTotalPrice: '',
    NFTVideoSrc: '',
    maxBet: '',
    version: '',
  });

  const [deposit, setDeposit] = useState<number>(() => {
    const storedDeposit =
      typeof window !== 'undefined' ? localStorage.getItem('deposit') : null;
    return storedDeposit ? JSON.parse(storedDeposit) : 0;
  });

  const [stake, setStake] = useState<number>(() => {
    const storedStake =
      typeof window !== 'undefined' ? localStorage.getItem('stake') : null;
    return storedStake ? JSON.parse(storedStake) : 0;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deposit', JSON.stringify(deposit));
    }
  }, [deposit]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stake', JSON.stringify(stake));
    }
  }, [stake]);

  async function stakeYourAmount(amount: string) {
    let id = toast.loading('Depositing in progress');
    try {
      const amountEther = parseEther(amount); // Parse the amount to Ether
      const allowance = await readContract(config, {
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'allowance',
        args: [address, mainContractAddress],
      });

      if (Number(allowance) < Number(amountEther.toString())) {
        const approveTx = await writeContractAsync(
          {
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'approve',
            args: [mainContractAddress, amountEther],
          },
          {
            onSuccess(data) {
              toast.success('Approval successful');
            },
            onError(error) {
              throw new Error('Approval failed');
            },
            onSettled(data, error) {
              // You can perform additional actions here if needed
              console.log('Approval settled');
            },
          }
        );
      }
      const stakeTx = await writeContractAsync(
        {
          address: mainContractAddress,
          abi: mainContractABI,
          functionName: 'stake',
          args: [amountEther],
        },
        {
          onSuccess(data) {
            console.log('data', data);
            getStake();
            toast.success('Deposit successful',{id});
          },
          onError(error) {
            console.log('error', error);
            throw new Error('Staking failed');
          },
          onSettled(data, error) {
            // You can perform additional actions here if needed
            console.log('Approval settled');
          },
        }
      );
      console.log('stakeTx', stakeTx);
    } catch (error) {
      throw error;
    }
  }

  async function getYieldAmount() {
    try {
      const yieldAmount = await readContract(config, {
        address: mainContractAddress,
        abi: mainContractABI,
        functionName: 'currentUserRewards',
        args: [address],
      });

      setYieldAmount(Number(Number(yieldAmount).toString()) / 10 ** 18);
    } catch (error) {
      console.log('error', error);
    }
  }

  async function getCurrentRewardsPerToken() {
    try {
      const rewardPerToken = await readContract(config, {
        address: mainContractAddress,
        abi: mainContractABI,
        functionName: 'currentRewardsPerToken',
        args: [],
      });
      setCurrentRewardPerToken(
        Number(Number(rewardPerToken).toString()) / 10 ** 18
      );
      console.log('rewardPerToken', rewardPerToken);
    } catch (error) {
      console.log('error', error);
    }
  }

  async function getAccumulatedRewards() {
    try {
      const accumulatedRewards = await readContract(config, {
        address: mainContractAddress,
        abi: mainContractABI,
        functionName: 'accumulatedRewards',
        args: [address],
      });
      console.log('accumulatedRewards', accumulatedRewards);
    } catch (error) {
      console.log('error', error);
    }
  }

  async function getStake() {
    try {
      const stake = await readContract(config, {
        address: mainContractAddress,
        abi: mainContractABI,
        functionName: 'userStake',
        args: [address],
      });
      console.log('stake', stake);
      setStake(Number(Number(stake).toString()) / 10 ** 18);
    } catch (error) {
      console.log('error', error);
    }
  }

  async function unstakeYourAmount(amount: string) {
    try {
      const amountEther = parseEther(amount);
      const unstakeTx = await writeContractAsync(
        {
          address: mainContractAddress,
          abi: mainContractABI,
          functionName: 'unstake',
          args: [amountEther],
        },
        {
          onSuccess(data) {
            console.log('data', data);
            getStake();
            toast.success('Unstaking successful');
          },
          onError(error) {
            console.log('error', error);
            throw new Error('Unstaking failed');
          },
          onSettled(data, error) {
            // You can perform additional actions here if needed
            console.log('Approval settled');
          },
        }
      );
      console.log('unstakeTx', unstakeTx);
    } catch (error) {
      throw error;
    }
  }

  async function claimYourAmount() {
    let id = toast.loading('Claiming in progress');
    try {
      const claimTx = await writeContractAsync(
        {
          address: mainContractAddress,
          abi: mainContractABI,
          functionName: 'claim',
          args: [],
        },
        {
          onSuccess(data) {
            console.log('data', data);
            getStake();
            toast.success('Claim successful',{id});
          },
          onError(error) {
            console.log('error', error);
            throw new Error('Claim failed');
          },
          onSettled(data, error) {
            // You can perform additional actions here if needed
            console.log('Approval settled');
          },
        }
      );
      console.log('claimTx', claimTx);
    } catch (error) {
      throw error;
    }
  }

  useEffect(() => {
    getYieldAmount();
    getStake();
    getCurrentRewardsPerToken();
    // getAccumulatedRewards();
  }, [address]);

  return (
    <QuizContext.Provider
      value={{
        activeQuiz,
        setActiveQuiz,
        activeStep,
        setActiveStep,
        preQuestions,
        setPreQuestions,
        questions,
        setQuestions,
        postQuestions,
        setPostQuestions,
        NFTInfo,
        setNFTInfo,
        deposit,
        stake,
        setDeposit,
        setStake,
        stakeYourAmount,
        yieldAmount,
        getStake,
        unstakeYourAmount,
        claimYourAmount,
        currentRewardPerToken,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContextProvider;
