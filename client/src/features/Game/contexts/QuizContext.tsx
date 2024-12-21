import React, { ReactNode, useContext, useEffect, useState } from 'react';
import {
  NFTInfo,
  PreQuestions,
  Question,
  Quiz,
} from '@/features/Game/types/Types';
import { config } from '@/helper';
import { toast } from 'react-hot-toast';
import { parseEther } from 'ethers';
import { PostQuestions } from '../types/Types';
import { useAccount, useWriteContract,useReadContract } from 'wagmi';
import {
  mainContractABI,
  mainContractAddress,
  tokenAbi,
  tokenAddress,
} from '@/contract-constant';
import { readContract } from '@wagmi/core'
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
  const { data: hash, writeContractAsync,status } = useWriteContract();
  const [activeQuiz, setActiveQuiz] = useState(false);
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
      const allowance = await readContract(config,{
        address: tokenAddress,
        abi: tokenAbi,
        functionName: 'allowance',
        args: [address, mainContractAddress],
      });
     
      if (allowance < amountEther) {
        const approveTx = await writeContractAsync(config,{
          address: tokenAddress,
          abi: tokenAbi,
          functionName: "approve",
          args: [mainContractAddress, amountEther],
        });
      }
      const stakeTx = await writeContractAsync(config,{
        address: mainContractAddress,
        abi: mainContractABI,
        functionName: "stake",
        args: [amountEther],
      });
      console.log('stakeTx', stakeTx);
      toast.success("Deposit and Staked successfully");
    } catch (error) {
      throw error;
    }
  }

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
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export default QuizContextProvider;
