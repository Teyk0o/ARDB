export interface ItemComponent {
  item?: {
    id: string;
    name: string;
    icon?: string;
    item_type?: string;
    rarity?: string;
    description?: string;
  };
  component?: {
    id: string;
    name: string;
    icon?: string;
    item_type?: string;
    rarity?: string;
    description?: string;
  };
  quantity: number;
}

export interface Vendor {
  trader_name?: string;
  name?: string;
  price?: number;
}

export interface Item {
  id: string;
  name: string;
  nameEn?: string; // English name for URL slugs
  description?: string;
  item_type: string;
  icon?: string;
  rarity?: string;
  value?: number;
  workbench?: string | null;
  loadout_slots?: string[];

  // Tag for player guidance (keep, sell, recycle)
  tag?: 'keep' | 'sell' | 'recycle';

  // Components and recipes
  components?: ItemComponent[];
  recycle_components?: ItemComponent[];
  recycle_from?: ItemComponent[];
  used_in?: ItemComponent[];
  crafting_components?: ItemComponent[];
  recipe?: ItemComponent[];

  // Stats
  stat_block?: Record<string, number | undefined>;

  // Additional info
  loot_area?: string;
  locations?: string[];
  obtained_from?: string[];
  sold_by?: Vendor[];
  dropped_by?: string[];

  // Other
  flavor_text?: string;
  subcategory?: string | null;
  shield_type?: string | null;
  ammo_type?: string | null;
  sources?: string | null;
  mods?: unknown[];

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface FilterOptions {
  search: string;
  types: string[];
  rarities: string[];
}
