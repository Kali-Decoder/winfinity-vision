import React from 'react';

import clsxm from '@/lib/clsxm';


import { transactions } from '@/features/Game/constants/players';

type Props = {
  className?: string;
  figureClassName?: string;
};

const TransactionBoardTable = ({ className, figureClassName }: Props) => {
  return (
    <div className={clsxm(['space-y-8', className])}>
      {transactions.map((transaction, index) => {
        return (
          <div
            key={index}
            className='flex w-full items-center justify-between gap-1'
          >
            <div className='flex items-center gap-4'>
              <span className='text-ellipsis'>{transaction.type}</span>
            </div>
            <span>{transaction.hash}</span>
            <span>{transaction.amount}</span>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionBoardTable;
