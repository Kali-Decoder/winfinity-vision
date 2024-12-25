
import React from 'react';
import clsx from 'clsx';
import clsxm from '@/lib/clsxm';
import { useRouter } from 'next/navigation';
import { useTabsContext } from '../contexts/TabsContext';
type Props = {
  className?: string;
  showPrice?: boolean;
  gifSrc: string;
  redirectUrl: string;
  data: {
    name: string;
    amountToDeposit: number;
    description?: string;
  };
} & React.ComponentPropsWithRef<'div'>;

type Tabs = 'home' | 'money-bag' | 'payment' | 'profile';

const NFTThumbnail: React.FC<Props> = ({
  showPrice = false,
  className = '',
  redirectUrl,
  gifSrc,
  data,
  ...rest
}) => {

  const router = useRouter();
    const { selectedTab,setSelectedTab } = useTabsContext();

  return (
    <div {...rest}>
      <div
        className={clsxm(
          'relative w-full rounded-3xl border-2 border-primary-500 p-3 pb-[75px]',
          className
        )}
      >
        <div className='absolute -bottom-1 left-1/2 h-2 w-8/12 -translate-x-1/2 bg-dark'></div>
        <div className='absolute -bottom-0 left-1/2 h-16 w-[calc(66.66666%+4px)] -translate-x-1/2 rounded-t-3xl border-2 border-b-0 border-primary-500'></div>

        <div className='flex w-full flex-col items-center'>
          <span className='h2'>{data?.name || 'Loading...'}</span>
          <p className='text-center text-sm text-gray-500'>
            {data?.description || 'No description available'}
          </p>
          <img
            className='mt-2 h-full w-full rounded-xl'
            src={gifSrc}
            // autoPlay
            // loop
            // muted
            // aria-label={`${data?.name || 'NFT'} animation`}
          />
        </div>
      </div>

      {showPrice && (
        <div  onClick={() => {
          const tabName = redirectUrl.split('/').pop();
          if (tabName){
            setSelectedTab(tabName as Tabs);
          }
          router.push(redirectUrl); // Redirect to the full URL
        }} className='flex w-full justify-center cursor-pointer'>
          <div className='relative -top-14 flex w-3/5 items-center justify-center rounded-3xl bg-white py-5 shadow-md'>
            <div className='flex gap-1 text-black'>
              <span
                className={clsx(
                  'h1 my-auto w-full text-center',
                  !data?.amountToDeposit && 'text-sm'
                )}
              >
                {data?.amountToDeposit
                  ? `$${data.amountToDeposit}`
                  : 'Loading...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NFTThumbnail;
