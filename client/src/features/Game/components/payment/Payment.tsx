import { Capacitor } from '@capacitor/core';
import React from 'react';
import { createPortal } from 'react-dom';
// import { AiOutlineSetting } from 'react-icons/ai';

import Menu from '@/components/menu/Menu';

import Tab from '@/components/tabs/Tab';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Tabs from '@/components/tabs/Tabs';

import InputSvg from '@/features/Game/components/payment/InputSVG';
import OutputSVG from '@/features/Game/components/payment/OutputSVG';
import PaymentTypes from '@/features/Game/components/payment/PaymentTypes';
import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import NextImage from '@/components/NextImage';
import TransactionBoardTable from '../Quiz/leader-board-table/TransactionBoardTable';
const Payment = () => {
  const { deposit } = useQuizContext();
  return (
    <div>
      {/* {Capacitor.getPlatform() == 'ios' ? (
        <div
          className='sticky top-0 z-[999] flex w-full bg-dark pb-4'
          style={{
            paddingTop: 'calc(2px + env(safe-area-inset-top))',
          }}
        >
          <div className='flex w-full items-center justify-between'>
            <span className='text-2xl text-primary-500'>
              <AiOutlineSetting></AiOutlineSetting>
            </span>
            <div className='flex items-center gap-2'>
              <span className='text-primary-500'>
                <MoneyBag />
              </span>
              t<span className='text-lg text-primary-500'>Balance</span>
            </div>
            <Currency />
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between'>
          <span className='text-2xl text-primary-500'>
            <AiOutlineSetting></AiOutlineSetting>
          </span>
          <div className='flex items-center gap-2'>
            <span className='text-primary-500'>
              <MoneyBag />
            </span>
            <span className='text-lg text-primary-500'>Balance</span>
          </div>
          <Currency />
        </div>
      )} */}
      {createPortal(<Menu />, document.body)}

      <TabGroup>
        <Tabs className='m-10 mx-auto w-full'>
          <Tab>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-xl'>
                <InputSvg />
              </span>
              <span className='font-bold'>Profile</span>
            </div>
          </Tab>
          <Tab>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-3xl'>
                <OutputSVG />
              </span>
              <span className='font-bold'>History</span>
            </div>
          </Tab>
        </Tabs>

        <TabPanels>
          <TabPanel>
            <div className='flex flex-grow flex-col items-center gap-3 overflow-y-auto px-4'>
              <NextImage
                src='/images/demo-profile.png'
                alt='Image placeholder'
                className='relative h-32 w-32 rounded-full border-4 border-primary-500'
                imgClassName='object-cover rounded-full'
                fill
              />
              <span className='mt-4 block text-3xl'>{'Nikku.Dev'}</span>
            </div>

            <div className='text-gradient-primary mt-10 flex items-center justify-center gap-2'>
              <h2 className='text-8xl'>{deposit}</h2>
              <span className='text-4xl'>USDC</span>
            </div>
            <PaymentTypes />
          </TabPanel>
          <TabPanel>
            <div className='flex flex-grow flex-col items-center gap-3 overflow-y-auto px-4'>
              <TransactionBoardTable
                className='mt-8'
                figureClassName='border'
              />
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default Payment;
