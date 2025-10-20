import React from 'react';
import pcPartnerLogo from '@/assets/pc-partner-logo.png';

const Logo = () => {
  return (
    <div className="flex items-center">
      <img src={pcPartnerLogo} alt="PC Partner" className="h-10" />
    </div>
  );
};

export default Logo;
