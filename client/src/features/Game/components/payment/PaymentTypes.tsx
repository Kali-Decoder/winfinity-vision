
import React, { useEffect, useState } from 'react';

import { BsCalendarCheck } from 'react-icons/bs';
import { RxCopy } from 'react-icons/rx';


import Button from '@/components/buttons/Button';
import TextField from '@/components/inputs/TextField';

import RadioGroup from '@/components/radio/RadioGroup';
import RadioOption from '@/components/radio/RadioOption';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Dialog from '@/dialog/Dialog';

import { addressFormatter } from '@/features/Game/lib/addressFormatter';
import { useAccount } from 'wagmi';
import Carousel from '@/components/carousel/Carousel';
import { Tab } from '@headlessui/react';
import clsxm from '@/lib/clsxm';
import NextImage from '@/components/NextImage';
import { paymentTypes } from '../../constants/paymentTypes';

const PaymentTypes = () => {
  const [copiedNotification, setCopiedNotification] = useState(false);
  const account = useAccount();
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => {
      setCopiedNotification(false);
    }, 900);
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
                  <span className='mx-auto w-full'>345</span>
                </Button>
              </div>

              <Button variant='outline' size='lg' className='mt-20'>
                Deposit
              </Button>
            </div>
          </TabPanel>

          {/* Panel 2: Deposit Form */}
          <TabPanel>
            <form className='space-y-6'>
              <TextField
                required={true}
                inputClassName='bg-transparent border-primary-500 rounded-full text-white placeholder:text-gray-300'
                placeHolder='Card Number'
                type='number'
              />
              <TextField
                required={true}
                inputClassName='bg-transparent border-primary-500 rounded-full text-white placeholder:text-gray-300'
                placeHolder='CVV'
                type='number'
              />
              <TextField
                required={true}
                inputClassName='bg-transparent border-primary-500 rounded-full text-white invalid:text-gray-300'
                placeHolder='Expiry Date'
                type='month'
                endAdornment={<BsCalendarCheck />}
                endAdornmentClassName='cursor-pointer'
              />
              <TextField
                required={true}
                inputClassName='bg-transparent border-primary-500 rounded-full text-white placeholder:text-gray-300'
                placeholder='Amount'
              />
              <div className='flex items-center gap-4'>
                <RadioGroup>
                  <div className='flex items-center gap-4'>
                    <RadioOption
                      className='inline-block'
                      value="I agree to the terms of use of the 'One-click pay'"
                    />
                    <span className='text-2xs'>
                      I agree to the terms of use of the "One-click pay"
                    </span>
                  </div>
                </RadioGroup>
              </div>
              <Button variant='outline' size='lg' className='!mt-12'>
                Deposit
              </Button>
            </form>
          </TabPanel>

          {/* Panel 3: Coming Soon */}
          <TabPanel className='mt-20 flex w-full justify-center'>
            <span className='h2'>COMING SOON</span>
          </TabPanel>
        </TabPanels>
      </TabGroup>

      {/* Copy Notification Dialog */}
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
