import React from 'react';
import { createPortal } from 'react-dom';

import Menu from '@/components/menu/Menu';
import MoneyBag from '@/components/SVGs/MoneyBag';
import Tab from '@/components/tabs/Tab';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Tabs from '@/components/tabs/Tabs';
import OutputSVG from '@/features/Game/components/payment/OutputSVG';
import { useQuizContext } from '@/features/Game/contexts/QuizContext';
import DepositSection from './DepositSection';
import WithdrawSection from './WithdrawSection';
const MoneyBagComponent = () => {
  const { deposit } = useQuizContext();
  return (
    <div>
      {createPortal(<Menu />, document.body)}

      <TabGroup>
        <Tabs className='m-10 mx-auto w-full'>
          <Tab>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-xl'>
                <MoneyBag />
              </span>
              <span className='font-bold'>Deposit</span>
            </div>
          </Tab>
          <Tab>
            <div className='flex items-center justify-center gap-2'>
              <span className='text-3xl'>
                <OutputSVG />
              </span>
              <span className='font-bold'>Withdraw</span>
            </div>
          </Tab>
        </Tabs>

        <TabPanels>
          <TabPanel>
            <DepositSection />
          </TabPanel>
          <TabPanel>
            <WithdrawSection />
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default MoneyBagComponent;
