import React, { useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import Navbar from '../layouts/Navbar';
import SideMenu from '../layouts/SideMenu';

const DashboardLayout = ({ children, activeMenu }) => {
  const { user } = useContext(UserContext);

  // Don't render layout if no user
  if (!user) {
    return null; // Or a loading spinner
  }

  return (
    <div>
      {/* 1. Navbar sits at the top by itself */}
      <Navbar activeMenu={activeMenu} />

      {/* 2. Main content area is BELOW the navbar */}
      <div className='flex'>
        
        {/* Desktop-only SideMenu. 
            Your Navbar already handles the mobile menu. */}
        <div className='max-[1080px]:hidden'>
          <SideMenu activeMenu={activeMenu} />
        </div>

        {/* Page Content */}
        <div className='grow mx-5'>{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;