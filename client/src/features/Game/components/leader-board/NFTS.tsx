import React from 'react';

import NFTThumbnail from '@/features/Game/components/NFTThumbnail';
import { games, user } from '@/features/Game/constants/user';
const NFTS = () => {
  return (
    <div className='space-y-0'>
      {games.map((NFTId, index) => {
        return (
          <NFTThumbnail
            key={index}
            showPrice={true}
            redirectUrl={NFTId.redirectUrl}
            gifSrc={NFTId.gifSrc}
            data={NFTId}
          />
        );
      })}
    </div>
  );
};

export default NFTS;
