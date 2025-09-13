import React from 'react';
import HeroSection from '../components/HeroSection';
import FeaturedModels from '../components/FeaturedModels';
import PlatformStats from '../components/PlatformStats';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <PlatformStats />
      <FeaturedModels />
    </div>
  );
};

export default HomePage;