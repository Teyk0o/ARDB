'use client';

/**
 * Metadata Editor
 * Edits item metadata (type, rarity, value, workbench, etc.)
 */

import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import { getTranslation, getItemTypeLabel, getRarityLabel } from '@/lib/translations';
import CustomSelect from '@/components/CustomSelect';

interface MetadataEditorProps {
  item: Item;
  onChange: (item: Item) => void;
  language: Language;
}

const ITEM_TYPES = [
  'Weapon',
  'Armor',
  'Helmet',
  'Quick Use',
  'Material',
  'Component',
  'Ammo',
  'Throwable',
  'Tool',
  'Consumable',
];

const RARITIES = [
  'Common',
  'Uncommon',
  'Rare',
  'Epic',
  'Legendary',
];

const WORKBENCHES = [
  'None',
  'gunsmith',
  'gear_bench',
  'engineering_station',
  'chemistry_station',
];

// Workshop/Workbench name translations
const workshopNames: Record<string, Record<Language, string>> = {
  None: {
    en: 'None', fr: 'Aucun', es: 'Ninguno', de: 'Keine', 'zh-CN': '无'
  },
  gunsmith: {
    en: 'Gunsmith', fr: 'Armurier', es: 'Armero', de: 'Waffenschmied', 'zh-CN': '枪匠'
  },
  gear_bench: {
    en: 'Gear Bench', fr: 'Établi d\'équipement', es: 'Banco de equipo', de: 'Ausrüstungswerkbank', 'zh-CN': '装备工作台'
  },
  engineering_station: {
    en: 'Engineering Station', fr: 'Station d\'ingénierie', es: 'Estación de ingeniería', de: 'Ingenieurstation', 'zh-CN': '工程站'
  },
  chemistry_station: {
    en: 'Chemistry Station', fr: 'Station de chimie', es: 'Estación de química', de: 'Chemiestation', 'zh-CN': '化学站'
  },
};

// Helper function to get translated workbench name
function getWorkbenchName(workbenchId: string, language: Language): string {
  return workshopNames[workbenchId]?.[language] || workshopNames[workbenchId]?.en || workbenchId;
}

export default function MetadataEditor({ item, onChange, language }: MetadataEditorProps) {
  const t = getTranslation(language);

  const handleChange = (field: keyof Item, value: string | number | null) => {
    onChange({
      ...item,
      [field]: value,
    });
  };

  const inputStyles = {
    backgroundColor: '#130918',
    border: '2px solid #2d1f38',
    color: '#ffffff'
  };

  return (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        <h3 className="text-white font-bold text-lg mb-6 pb-3" style={{ borderBottom: '2px solid #2d1f38' }}>
          {t.basicInformation}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.itemType} *
            </label>
            <CustomSelect
              value={item.item_type || ''}
              onChange={(value) => handleChange('item_type', value || null)}
              options={[
                { value: '', label: t.selectType },
                ...ITEM_TYPES.map(type => ({ value: type, label: getItemTypeLabel(type, language) }))
              ]}
            />
          </div>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.rarity}
            </label>
            <CustomSelect
              value={item.rarity || ''}
              onChange={(value) => handleChange('rarity', value || null)}
              options={[
                { value: '', label: t.selectRarity },
                ...RARITIES.map(rarity => ({ value: rarity, label: getRarityLabel(rarity, language) }))
              ]}
            />
          </div>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.valueCredits}
            </label>
            <input
              type="number"
              value={item.value || ''}
              onChange={(e) => handleChange('value', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="0"
              min="0"
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
              style={inputStyles}
              onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
              onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
            />
          </div>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.maxStack}
            </label>
            <input
              type="number"
              value={item.max_stack || ''}
              onChange={(e) => handleChange('max_stack', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="1"
              min="1"
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
              style={inputStyles}
              onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
              onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
            />
            <p className="text-white/50 text-xs mt-2">
              {t.maxStackHelp}
            </p>
          </div>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.workbench}
            </label>
            <CustomSelect
              value={item.workbench || 'None'}
              onChange={(value) => handleChange('workbench', value === 'None' ? null : value)}
              options={WORKBENCHES.map(wb => ({
                value: wb,
                label: getWorkbenchName(wb, language)
              }))}
            />
          </div>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.subcategory}
            </label>
            <input
              type="text"
              value={item.subcategory || ''}
              onChange={(e) => handleChange('subcategory', e.target.value || null)}
              placeholder={t.subcategoryPlaceholder}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
              style={inputStyles}
              onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
              onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
            />
          </div>
        </div>
      </div>

      {/* Visual Section */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        <h3 className="text-white font-bold text-lg mb-6 pb-3" style={{ borderBottom: '2px solid #2d1f38' }}>
          {t.visual}
        </h3>

        <div>
          <label className="block text-white/80 font-medium mb-2 text-sm">
            {t.iconFilename}
          </label>
          <input
            type="text"
            value={item.icon || ''}
            onChange={(e) => handleChange('icon', e.target.value || null)}
            placeholder={t.iconFilenamePlaceholder}
            className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
            style={inputStyles}
            onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
            onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
          />
          <p className="text-white/50 text-xs mt-2">
            {t.iconFilenameHelp}
          </p>
        </div>
      </div>

      {/* Weapon-specific fields */}
      {item.item_type === 'Weapon' && (
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '2px solid #f1aa1c' }}>
          <h3 className="text-white font-bold text-lg mb-6 pb-3 flex items-center gap-2" style={{ borderBottom: '2px solid #2d1f38' }}>
            <span style={{ color: '#f1aa1c' }}>🔫</span>
            {t.weaponDetails}
          </h3>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.ammoType}
            </label>
            <input
              type="text"
              value={item.ammo_type || ''}
              onChange={(e) => handleChange('ammo_type', e.target.value || null)}
              placeholder={t.ammoTypePlaceholder}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
              style={inputStyles}
              onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
              onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
            />
          </div>
        </div>
      )}

      {/* Armor-specific fields */}
      {(item.item_type === 'Armor' || item.item_type === 'Helmet') && (
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '2px solid #f1aa1c' }}>
          <h3 className="text-white font-bold text-lg mb-6 pb-3 flex items-center gap-2" style={{ borderBottom: '2px solid #2d1f38' }}>
            <span style={{ color: '#f1aa1c' }}>🛡️</span>
            {t.armorDetails}
          </h3>

          <div>
            <label className="block text-white/80 font-medium mb-2 text-sm">
              {t.shieldType}
            </label>
            <input
              type="text"
              value={item.shield_type || ''}
              onChange={(e) => handleChange('shield_type', e.target.value || null)}
              placeholder={t.shieldTypePlaceholder}
              className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
              style={inputStyles}
              onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
              onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
            />
          </div>
        </div>
      )}

      {/* Info Note */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)', borderLeft: '4px solid #f1aa1c' }}>
        <p className="text-white/80 text-sm">
          ℹ️ <strong>Note:</strong> {t.metadataNote}
        </p>
      </div>
    </div>
  );
}
