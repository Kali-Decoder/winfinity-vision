import React, { useEffect, useState } from 'react';


import { RxCopy } from 'react-icons/rx';

import Button from '@/components/buttons/Button';

import SlideUp from '@/components/modals/SlideUp';

import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Dialog from '@/dialog/Dialog';

import { addressFormatter } from '@/features/Game/lib/addressFormatter';
import { useAccount } from 'wagmi';
import { useQuizContext } from '../../contexts/QuizContext';

const PaymentTypes = () => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [unstakeShowInfo, setUnstakeShowInfo] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState(0);

  const [timeLeft, setTimeLeft] = useState<number>(24 * 60 * 60);
  const {
   
    setStake,
   
    stake,
    yieldAmount,
    unstakeYourAmount,
  } = useQuizContext();
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer); // Cleanup interval on component unmount
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const account = useAccount();
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 900);
  };


 

  const handleUnstake = async () => {
    try {
      console.log('depositAmount', unstakeAmount);
      await unstakeYourAmount(unstakeAmount.toString());
      setStake((prev: any) => Number(prev) - Number(unstakeAmount));
      setShowInfo(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TabGroup>
        <TabPanels className='mt-8'>
          {/* Panel 1: Wallet and Balance Info */}
          <TabPanel>
            <div className='space-y-6'>
              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Address Wallet</span>
                <Button
                  variant='outline'
                  rightIcon={RxCopy}
                  rightIconClassName='text-primary-500 text-xl'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                  onClick={() => handleCopy(account?.address as string)}
                >
                  <span className='mx-auto w-full'>
                    {addressFormatter(account?.address as string)}
                  </span>
                </Button>
              </div>
              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Stake Amount</span>
                <Button
                  variant='outline'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                >
                  <span className='mx-auto w-full'>{stake} USDC</span>
                </Button>
              </div>

              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Yield</span>
                <Button
                  variant='outline'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                >
                  <span className='mx-auto w-full'>{yieldAmount} USDC</span>
                </Button>
              </div>

              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Lock Period</span>
                <Button
                  variant='outline'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                >
                  <span className='mx-auto w-full'>{formatTime(timeLeft)}</span>
                </Button>
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Copy Notification Dialog */}

     
      {unstakeShowInfo && (
        <SlideUp open={unstakeShowInfo} setOpen={setUnstakeShowInfo}>
          <div className='flex w-full flex-col items-center justify-between space-y-5 text-black'>
            <div className='relative h-56 w-96 select-none p-6'>
              <p className='text-sm uppercase'>
                Stake Amount (Max {stake} USDC)
              </p>
              <input
                type='number'
                name='unstakeAmount'
                value={unstakeAmount}
                onChange={(e: any) => setUnstakeAmount(e.target.value)}
                className='mt-3 h-12 w-full rounded-xl border-2 border-gray-300 px-4 py-2'
                placeholder='Enter Amount'
              />
              <button
                onClick={handleUnstake}
                className='mt-4 w-full rounded-full bg-blue-800 px-10 py-2 font-semibold text-white'
              >
                Unstake
              </button>
            </div>
          </div>
        </SlideUp>
      )}
      <Dialog
        isOpen={copiedNotification}
        onClose={() => setCopiedNotification(false)}
        childrenClassName='text-center h3'
      >
        <span>Copied</span>
      </Dialog>
    </>
  );
};

export default PaymentTypes;
