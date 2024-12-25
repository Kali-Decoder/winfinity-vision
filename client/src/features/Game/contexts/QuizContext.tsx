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
    try {
        const amountEther = parseEther(amount); // Parse the amount to Ether

        // Check allowance
        const allowance = await readContract(config, {
            address: tokenAddress,
            abi: tokenAbi,
            functionName: 'allowance',
            args: [address, mainContractAddress],
        });

        // If allowance is insufficient, approve it
        if (Number(allowance) < Number(amountEther.toString())) {
            await toast.promise(
                writeContractAsync(
                    {
                        address: tokenAddress,
                        abi: tokenAbi,
                        functionName: 'approve',
                        args: [mainContractAddress, amountEther],
                    }
                ),
                {
                    pending: 'Approval in progress...',
                    success: 'Approval successful 👌',
                    error: 'Approval failed 🤯',
                }
            );
        }

        // Perform staking
        await toast.promise(
            writeContractAsync(
                {
                    address: mainContractAddress,
                    abi: mainContractABI,
                    functionName: 'stake',
                    args: [amountEther],
                }
            ),
            {
                pending: 'Staking in progress...',
                success: 'Staking successful 👌',
                error: 'Staking failed 🤯',
            }
        );
        getStake();
    } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred. Please try again.');
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

        // Perform unstaking with toast.promise
        await toast.promise(
            writeContractAsync(
                {
                    address: mainContractAddress,
                    abi: mainContractABI,
                    functionName: 'unstake',
                    args: [amountEther],
                }
            ),
            {
                pending: 'Unstaking in progress...',
                success: 'Unstaking successful 👌',
                error: 'Unstaking failed 🤯',
            }
        );

        // Fetch updated stake info after unstaking
        getStake();
    } catch (error) {
        console.error('Error during unstaking:', error);
        toast.error('An error occurred while unstaking. Please try again.');
    }
}


async function claimYourAmount() {
  try {
      // Perform claim operation with toast.promise
      await toast.promise(
          writeContractAsync(
              {
                  address: mainContractAddress,
                  abi: mainContractABI,
                  functionName: 'claim',
                  args: [],
              }
          ),
          {
              pending: 'Claiming in progress...',
              success: 'Claim successful 👌',
              error: 'Claim failed 🤯',
          }
      );

      // Fetch updated stake info after claiming
      getStake();
  } catch (error) {
      console.error('Error during claim:', error);
      toast.error('An error occurred while claiming. Please try again.');
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
