"use client"
import React from 'react';
import { useRouter } from 'next/navigation';

import clsxm from '@/lib/clsxm';
import { menuItems } from '@/components/menu/constants';
import { useTabsContext } from '@/features/Game/contexts/TabsContext';

const Menu = () => {
  const router = useRouter();
  const { setSelectedTab, selectedTab } = useTabsContext();

  return (
    <div className='sticky bottom-5 z-[999] mx-auto flex w-[85vw] items-center justify-around rounded-full border-2 border-primary-500 bg-white p-4 mobile-demo:w-[450px]'>
      {menuItems.map((item) => {
        return (
          <button
            onClick={() => {
              setSelectedTab(item.name);
              router.push(item.path); // Ensure item.path is defined in menuItems
            }}
            className={clsxm([
              'aspect-square text-2xl text-black cursor-pointer',
              selectedTab === item.name && 'text-primary-500',
            ])}
            key={item.name}
            aria-label={`Navigate to ${item.name}`}
          >
            {item.icon}
          </button>
        );
      })}
    </div>
  );
};

export default Menu;
