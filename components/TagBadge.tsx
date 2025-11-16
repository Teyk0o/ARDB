'use client';

import { FaLock, FaDollarSign } from 'react-icons/fa';
import { HiMiniArrowPath } from 'react-icons/hi2';

interface TagBadgeProps {
  tag: 'keep' | 'sell' | 'recycle';
  label: string; // Translated label
}

export default function TagBadge({ tag, label }: TagBadgeProps) {
  const config = {
    keep: {
      icon: FaLock,
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500',
      textColor: 'text-green-400',
      iconColor: 'text-green-300',
    },
    sell: {
      icon: FaDollarSign,
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500',
      textColor: 'text-yellow-400',
      iconColor: 'text-yellow-300',
    },
    recycle: {
      icon: HiMiniArrowPath,
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500',
      textColor: 'text-blue-400',
      iconColor: 'text-blue-300',
    },
  };

  const tagConfig = config[tag];
  const Icon = tagConfig.icon;

  return (
    <div
      className={`
        inline-flex items-center gap-1.5 px-2 py-1
        rounded-md border
        ${tagConfig.bgColor}
        ${tagConfig.borderColor}
        ${tagConfig.textColor}
        text-xs font-medium
        transition-all duration-200
      `}
    >
      <Icon className={`${tagConfig.iconColor} text-sm`} />
      <span>{label}</span>
    </div>
  );
}
