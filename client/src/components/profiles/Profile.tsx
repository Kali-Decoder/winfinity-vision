
import React from 'react';
import { createPortal } from 'react-dom';

import Menu from '@/components/menu/Menu';


const Profile = () => {

  return (
    <div
      className='flex min-h-screen flex-col overflow-hidden text-white'
      style={{ backgroundColor: 'transparent' }}
    >
      
      {createPortal(<Menu />, document.body)}
    </div>
  );
};

export default Profile;
