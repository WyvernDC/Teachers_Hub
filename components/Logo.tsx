/**
 * Logo Component
 * 
 * Uses SVG logo from svg folder
 */

import Image from 'next/image';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export default function Logo({ className = '', size = 'md', iconOnly = false }: LogoProps) {
  const sizeClasses = {
    sm: { width: 120, height: 40 },
    md: { width: 180, height: 60 },
    lg: { width: 240, height: 80 }
  };

  const iconSizeClasses = {
    sm: { width: 32, height: 32 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 }
  };

  const dimensions = iconOnly ? iconSizeClasses[size] : sizeClasses[size];

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/svg/Teachers_Hub_Logo.svg"
        alt="Teachers Hub"
        width={dimensions.width}
        height={dimensions.height}
        className="object-contain"
        priority
      />
    </div>
  );
}

