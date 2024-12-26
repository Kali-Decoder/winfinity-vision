'use client';
import { Capacitor } from '@capacitor/core';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { IoDiamondOutline } from 'react-icons/io5';
import { RiVipCrownLine } from 'react-icons/ri';

import Account from '@/components/account/Account';

import Menu from '@/components/menu/Menu';
import NextImage from '@/components/NextImage';

import Tab from '@/components/tabs/Tab';
import TabGroup from '@/components/tabs/TabGroup';
import TabPanel from '@/components/tabs/TabPanel';
import TabPanels from '@/components/tabs/TabPanels';
import Tabs from '@/components/tabs/Tabs';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import NFTS from '@/features/Game/components/leader-board/NFTS';
import NFTPreview from '@/features/Game/components/NFTpreview/NFTPreview';
import LeaderBoardTable from '@/features/Game/components/Quiz/leader-board-table/LeaderBoardTable';

const LeaderBoard = () => {
  const [showNFTPreview, setShowNFTPreview] = useState(false);
  const [NFTFlowId, setNFTFlowId] = useState<string | undefined>();
  const account = useAccount();

  const main = () => {
    return (
      <div>
        {account?.address && (
          <>
            <div
              className={
                Capacitor.isNativePlatform()
                  ? 'sticky top-0 z-[999] flex flex-col bg-dark pb-4'
                  : 'flex flex-col gap-4 '
              }
            >
              <div className='flex items-center justify-between flex-col px-0'>
                <NextImage
                  src='/images/demo-profile.png'
                  alt='Image placeholder'
                  className='relative h-20 w-20 rounded-full border-2 border-primary-500'
                  imgClassName='object-cover rounded-full'
                  fill
                />

                <div className=' text-sm w-[100%] justify-center items-center flex mt-10'>
                  <ConnectButton />
                </div>
              </div>
            </div>
          </>
        )}
        {!account?.address && (
          <>
            <div className='!mt-2 flex h-[85vh] flex-col items-center justify-center gap-16'>
              <NextImage
                src='/images/logo2-removebg.png'
                alt='logo'
                className='relative h-20 w-full'
                imgClassName=' rounded-full'
                fill
              />
              <p className='mb-8 px-4 text-center text-4xl gap-y-4 game-font'>
            Where Gaming Meets Staking for Endless Rewards!
              </p>
              <ConnectButton />
            </div>
          </>
        )}

        {account?.address && (
          <>
            <TabGroup>
              {Capacitor.getPlatform() === 'ios' ? (
                <Tabs className='m-6 mx-auto w-full'>
                  <Tab>
                    <div className='flex justify-center gap-2'>
                      <span className='text-xl'>
                        <IoDiamondOutline />
                      </span>
                      <span className='font-bold'>Games</span>
                    </div>
                  </Tab>
                  <Tab>
                    <div className='flex justify-center gap-2'>
                      <span className='text-xl'>
                        <RiVipCrownLine />
                      </span>
                      <span className='font-bold'>Leaderboard</span>
                    </div>
                  </Tab>
                </Tabs>
              ) : (
                <Tabs className='m-10 mx-auto w-full'>
                  <Tab>
                    <div className='flex justify-center gap-2'>
                      <span className='text-xl'>
                        <IoDiamondOutline />
                      </span>
                      <span className='font-bold'>Games</span>
                    </div>
                  </Tab>
                  <Tab>
                    <div className='flex justify-center gap-2'>
                      <span className='text-xl'>
                        <RiVipCrownLine />
                      </span>
                      <span className='font-bold'>Leaderboard</span>
                    </div>
                  </Tab>
                  
                </Tabs>
              )}
              <TabPanels>
                <TabPanel>
                

                  <NFTS
                    setShowNFTPreview={setShowNFTPreview}
                    setNFTFlowId={setNFTFlowId}
                  />
                </TabPanel>

                <TabPanel>
                  <Account />
                  <LeaderBoardTable
                    className='mt-8'
                    figureClassName='border-transparent'
                  />
                </TabPanel>
              </TabPanels>
            </TabGroup>
            {createPortal(<Menu />, document.body)}
          </>
        )}
      </div>
    );
  };

  const renderLeaderBoard = () => {
    if (showNFTPreview && NFTFlowId) {
      return (
        <NFTPreview
          setShowNFTPreview={setShowNFTPreview}
          NFTFlowId={NFTFlowId}
        />
      );
    }
    return main();
  };

  return renderLeaderBoard();
};

export default LeaderBoard;
