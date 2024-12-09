'use  client';
import React from 'react';
import { createPortal } from 'react-dom';
import Menu from '@/components/menu/Menu';

import FlappyBird from '@/components/game/FlappyBird';
const page = () => {
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div
      className='mt-10 flex min-h-screen flex-col overflow-hidden text-white'
      style={{ backgroundColor: 'transparent' }}
    >
      <div className='flex flex-grow flex-col items-center gap-3 overflow-y-auto px-4'>
        <FlappyBird />
      </div>
      {isClient ? createPortal(<Menu />, document.body) : null}
    </div>
  );
};

export default page;
