'use client';

/**
 * Stats Editor
 * Edits item statistics (stat_block)
 */

import { useState } from 'react';
import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';
import { FaPlus, FaTrash, FaStar } from 'react-icons/fa';

interface StatsEditorProps {
  item: Item;
  onChange: (item: Item) => void;
  language: Language;
}

const COMMON_STATS = [
  { key: 'Damage', icon: '⚔️' },
  { key: 'Armor', icon: '🛡️' },
  { key: 'Fire Rate', icon: '🔥' },
  { key: 'Magazine Size', icon: '📦' },
  { key: 'Reload Time', icon: '⏱️' },
  { key: 'Range', icon: '🎯' },
  { key: 'Durability', icon: '💎' },
  { key: 'Weight', icon: '⚖️' },
];

export default function StatsEditor({ item, onChange, language }: StatsEditorProps) {
  const [newStatKey, setNewStatKey] = useState('');
  const [newStatValue, setNewStatValue] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const t = getTranslation(language);
  const stats = item.stat_block || {};

  const handleStatChange = (key: string, value: string) => {
    const numValue = parseFloat(value);
    const finalValue = isNaN(numValue) ? undefined : numValue;

    onChange({
      ...item,
      stat_block: {
        ...stats,
        [key]: finalValue,
      },
    });
  };

  const handleDeleteStat = (key: string) => {
    const newStats = { ...stats };
    delete newStats[key];

    onChange({
      ...item,
      stat_block: newStats,
    });
  };

  const handleAddStat = () => {
    if (!newStatKey.trim()) {
      alert(t.pleaseEnterStatName);
      return;
    }

    const numValue = parseFloat(newStatValue);
    const finalValue = isNaN(numValue) ? undefined : numValue;

    onChange({
      ...item,
      stat_block: {
        ...stats,
        [newStatKey]: finalValue,
      },
    });

    setNewStatKey('');
    setNewStatValue('');
  };

  const handleQuickAdd = (statKey: string) => {
    if (stats[statKey] !== undefined) {
      return; // Already exists
    }
    setNewStatKey(statKey);
    setNewStatValue('');
    setShowQuickAdd(false);
  };

  const statEntries = Object.entries(stats);
  const inputStyles = {
    backgroundColor: '#130918',
    border: '2px solid #2d1f38',
    color: '#ffffff'
  };

  return (
    <div className="space-y-8">
      {/* Existing Stats */}
      {statEntries.length > 0 && (
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
          <h3 className="text-white font-bold text-lg mb-6 pb-3" style={{ borderBottom: '2px solid #2d1f38' }}>
            {t.existingStats} ({statEntries.length})
          </h3>

          <div className="space-y-3">
            {statEntries.map(([key, value]) => (
              <div
                key={key}
                className="flex gap-3 items-center p-4 rounded-lg transition-all hover:bg-white/5"
                style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}
              >
                <div className="flex-1">
                  <label className="block text-white/60 text-xs mb-1 font-medium uppercase tracking-wide">
                    {key}
                  </label>
                  <input
                    type="text"
                    value={value?.toString() || ''}
                    onChange={(e) => handleStatChange(key, e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-white text-lg font-semibold focus:outline-none transition-all"
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                    }}
                    placeholder="Enter value..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteStat(key)}
                  className="p-3 rounded-lg transition-all hover:bg-red-500/20"
                  style={{ color: '#ef4444' }}
                  title={t.statName}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {statEntries.length === 0 && (
        <div className="rounded-lg p-12 text-center" style={{ backgroundColor: '#1a1120', border: '2px dashed #2d1f38' }}>
          <div className="text-4xl mb-4">📊</div>
          <p className="text-white/60 mb-2">{t.noStatsYet}</p>
          <p className="text-white/40 text-sm">{t.clickAddToStart}</p>
        </div>
      )}

      {/* Quick Add Common Stats */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        <button
          type="button"
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <FaStar style={{ color: '#f1aa1c' }} />
            {t.quickAdd} {t.commonStats}
          </h3>
          <span className="text-white/60 text-sm">
            {showQuickAdd ? '▼' : '▶'}
          </span>
        </button>

        {showQuickAdd && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {COMMON_STATS.map((stat) => {
              const alreadyExists = stats[stat.key] !== undefined;
              return (
                <button
                  key={stat.key}
                  type="button"
                  onClick={() => handleQuickAdd(stat.key)}
                  disabled={alreadyExists}
                  className="px-4 py-3 rounded-lg text-left transition-all"
                  style={{
                    backgroundColor: alreadyExists ? '#2d1f38' : '#130918',
                    border: `2px solid ${alreadyExists ? '#2d1f38' : '#f1aa1c'}`,
                    color: alreadyExists ? '#ffffff40' : '#ffffff',
                    opacity: alreadyExists ? 0.5 : 1,
                    cursor: alreadyExists ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div className="text-lg mb-1">{stat.icon}</div>
                  <div className="text-sm font-medium">{stat.key}</div>
                  {alreadyExists && (
                    <div className="text-xs" style={{ color: '#f1aa1c' }}>Added ✓</div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add New Stat Form */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        <h3 className="text-white font-bold text-lg mb-6 pb-3" style={{ borderBottom: '2px solid #2d1f38' }}>
          {t.addNewStat}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm mb-2 font-medium">
                {t.statName}
              </label>
              <input
                type="text"
                value={newStatKey}
                onChange={(e) => setNewStatKey(e.target.value)}
                placeholder={t.enterStatName}
                className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                style={inputStyles}
                onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStat()}
              />
            </div>
            <div>
              <label className="block text-white/80 text-sm mb-2 font-medium">
                {t.statValue}
              </label>
              <input
                type="text"
                value={newStatValue}
                onChange={(e) => setNewStatValue(e.target.value)}
                placeholder="e.g., 50, 100%, 5/s"
                className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                style={inputStyles}
                onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStat()}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddStat}
            className="w-full md:w-auto px-6 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#f1aa1c',
              color: '#130918'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d99a19'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1aa1c'}
          >
            <FaPlus />
            <span>{t.addNewStat}</span>
          </button>
        </div>
      </div>

      {/* Info Note */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)', borderLeft: '4px solid #f1aa1c' }}>
        <p className="text-white/80 text-sm">
          💡 <strong>Tip:</strong> Stats can be numbers (50) or text with units (100%, 5/s). Make sure to use the same format as other similar items.
        </p>
      </div>
    </div>
  );
}
