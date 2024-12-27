'use client';
import React, { use, useState } from 'react';
import { createPortal } from 'react-dom';
import Menu from '@/components/menu/Menu';
import { useTabsContext } from '@/features/Game/contexts/TabsContext'; // Import useTabsContext
import LeaderBoard from '@/features/Game/components/leader-board/LeaderBoard';
import TabGroup from '@/components/tabs/TabGroup';
import Payment from '@/features/Game/components/payment/Payment';
import SpinWheel from '@/components/game/SpinWheel';
import { ISegments, ISpinWheelProps } from '@/types/types';

const Page = () => {
  const [isClient, setIsClient] = React.useState(false);
  const { selectedTab } = useTabsContext();
  const [spinResult, setSpinResult] = useState<string>('');
  const segments = [
    { segmentText: "1", segColor: "#EE4040", frequency: 30 },
    { segmentText: "2", segColor: "#F0CF50", frequency: 20 },
    { segmentText: "5", segColor: "#815CD1", frequency: 15 },
    { segmentText: "10", segColor: "#3DA5E0", frequency: 10 },
    { segmentText: "20", segColor: "#34A24F", frequency: 5 },
    { segmentText: "50", segColor: "#34A246", frequency: 3 },
    { segmentText: "Bullseye", segColor: "#FF4500", frequency: 1 },
  ];
  const generateSegments = (segments:any) => {
    const result: [] = [];
    segments.forEach(({ segmentText, segColor, frequency } : any) => {
      for (let i = 0; i < frequency; i++) {
        result.push({ segmentText, segColor });
      }
    });
    return result;
  };
  
  const shuffleArray = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };
  
  const wheelSegments = shuffleArray(generateSegments(segments));

  const handleSpinFinish = (value: string) => {
    console.log('value:', value);
    setSpinResult(value);
  };

  const spinWheelProps: ISpinWheelProps = {
    segments:wheelSegments,
    onFinished: handleSpinFinish,
    primaryColor: 'black',
    contrastColor: 'white',
    buttonText: 'Spin',
    isOnlyOnce: false,
    size: 290,
    upDuration: 100,
    downDuration: 600,
    fontFamily: 'Arial',
    arrowLocation: 'top',
    showTextOnSpin: true,
    isSpinSound: true,
  };

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const renderContent = () => {
    if (selectedTab === 'spin-wheel') {
      return (
        <>
          <div className='flex justify-center items-center border w-[100%] '>
            {' '}
            <SpinWheel {...spinWheelProps} />
          </div>
          {spinResult && (
            <h1 className='textBox'> Spin Result:- {spinResult}</h1>
          )}
        </>
      );
    }
    if (selectedTab === 'home') {
      return <LeaderBoard />;
    }
    if (selectedTab === 'payment') {
      return <Payment />;
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
