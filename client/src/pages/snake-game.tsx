'use client';
import React, { use } from 'react';
import { createPortal } from 'react-dom';
import Menu from '@/components/menu/Menu';
import NextImage from '@/components/NextImage';
import SnakeGame from '@/components/game/SnakeGame';
import TabsContextProvider from '@/features/Game/contexts/TabsContext'; // Import TabsContextProvider
import { useTabsContext } from '@/features/Game/contexts/TabsContext'; // Import useTabsContext
import LeaderBoard from '@/features/Game/components/leader-board/LeaderBoard';
import Profile from '@/components/profiles/Profile';
import TabGroup from '@/components/tabs/TabGroup';
import Payment from '@/features/Game/components/payment/Payment';

const Page = () => {
  const [isClient, setIsClient] = React.useState(false);
  const { selectedTab } = useTabsContext();
  

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const renderContent = () => {
    if (selectedTab === 'snake-game') {
      return <SnakeGame />;
    }
    if (selectedTab === 'home') {
      return <LeaderBoard/>;
    }
    if (selectedTab === 'payment') {
      return <Payment/>;
    }
    return null;
  };

  return (
    
      <div
        className='mt-10 flex min-h-screen flex-col overflow-hidden text-white'
        style={{ backgroundColor: 'transparent' }}
      >
      
          <TabGroup>{renderContent()}</TabGroup>
      
        {isClient ? createPortal(<Menu />, document.body) : null}
      </div>
   
  );
};

export default Page;
