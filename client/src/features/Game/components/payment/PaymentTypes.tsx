import React, { useEffect, useState } from 'react';

import { BsCalendarCheck } from 'react-icons/bs';
import { RxCopy } from 'react-icons/rx';

import Button from '@/components/buttons/Button';
import TextField from '@/components/inputs/TextField';
import SlideUp from '@/components/modals/SlideUp';
import RadioGroup from '@/components/radio/RadioGroup';
import RadioOption from '@/components/radio/RadioOption';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Dialog from '@/dialog/Dialog';

import { addressFormatter } from '@/features/Game/lib/addressFormatter';
import { useAccount } from 'wagmi';

const PaymentTypes = () => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [userBalance, setUserBalance] = useState(234);
  const account = useAccount();
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 900);
  };

  const makeUserbalance = (percentage: any) => {
    const percentageValue = (percentage / 100) * userBalance;
    setDepositAmount(percentageValue);
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
                >
                  <span className='mx-auto w-full'>
                    {addressFormatter(account?.address as string)}
                  </span>
                </Button>
              </div>
              <div className='grid grid-cols-2 items-center justify-between gap-2'>
                <span className='text-sm'>Balance</span>
                <Button
                  variant='outline'
                  rightIcon={RxCopy}
                  rightIconClassName='text-primary-500 text-xl'
                  size='base'
                  className='w-full px-5 py-3 text-white'
                  onClick={() => handleCopy(`354`)}
                >
                  <span className='mx-auto w-full'>{userBalance}</span>
                </Button>
              </div>

              <Button
                onClick={() => setShowInfo(!showInfo)}
                variant='outline'
                size='lg'
                className='mt-20'
              >
                Deposit
              </Button>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Copy Notification Dialog */}

      {showInfo && (
        <SlideUp open={showInfo} setOpen={setShowInfo}>
          <div className='flex w-full flex-col items-center justify-between space-y-5 text-black'>
            <div className='relative h-56 w-96 select-none p-6'>
              <p className='text-sm uppercase'>
                Deposit Amount (Max {userBalance} USDC)
              </p>
              <input
                type='number'
                name='depositAmount'
                value={depositAmount}
                onChange={(e: any) => setDepositAmount(e.target.value)}
                className='mt-3 h-12 w-full rounded-xl border-2 border-gray-300 px-4 py-2'
                placeholder='Enter Amount'
              />
              <div className='mt-3 flex space-x-2'>
                <div
                  onClick={() => {
                    makeUserbalance(10);
                  }}
                  className='flex h-8 w-12  cursor-pointer items-center justify-center rounded-md bg-sky-200 text-xs font-bold text-blue-900 hover:bg-blue-300'
                >
                  10%
                </div>

                <div
                  onClick={() => {
                    makeUserbalance(50);
                  }}
                  className='flex h-8 w-12  cursor-pointer items-center justify-center rounded-md bg-sky-200 text-xs font-bold text-blue-900 hover:bg-blue-300'
                >
                  50%
                </div>
                <div
                  onClick={() => {
                    makeUserbalance(75);
                  }}
                  className='flex h-8 w-12  cursor-pointer items-center justify-center rounded-md bg-sky-200 text-xs font-bold text-blue-900 hover:bg-blue-300'
                >
                  75%
                </div>
                <div
                  onClick={() => {
                    makeUserbalance(100);
                  }}
                  className='flex h-8 w-12  cursor-pointer items-center justify-center rounded-md bg-sky-200 text-xs font-bold text-blue-900 hover:bg-blue-300'
                >
                  100%
                </div>
              </div>
              <button className='mt-4 w-full rounded-full bg-blue-800 px-10 py-2 font-semibold text-white'>
                Deposit
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
