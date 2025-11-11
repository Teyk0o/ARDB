export type Language = 'en' | 'fr';

export const translations = {
  en: {
    title: 'ARC RAIDERS',
    subtitle: 'Item Database & Recycling Guide',
    searchPlaceholder: 'Search items...',
    allTypes: 'All Types',
    allRarities: 'All Rarities',
    showing: 'Showing:',
    total: 'Total:',
    types: 'Types:',
    items: 'items',
    noItemsFound: 'No items found',
    tryAdjusting: 'Try adjusting your search filters',
    description: 'Description',
    statistics: 'Statistics',
    recycleThese: 'Recycle these items to obtain this',
    requiredToCraft: 'Required to craft these items',
    craftingRecipe: 'Crafting Recipe',
    lootAreas: 'Loot Areas',
    soldBy: 'Sold By',
    workbench: 'Workbench',
    value: 'Value',
    footer: 'Arc Raiders Database - Powered by Next.js',
    disclaimer: 'This is a fan-made project and is not affiliated with or endorsed by Embark Studios or Nexon.',
    credits: 'Arc Raiders is a trademark of Embark Studios and Nexon. All game content and materials are property of their respective owners.',
    openSource: 'Open source project available on',
    github: 'GitHub',
    license: 'Contributions welcome - Non-commercial use only',
  },
  fr: {
    title: 'ARC RAIDERS',
    subtitle: 'Base de données des objets et guide de recyclage',
    searchPlaceholder: 'Rechercher des objets...',
    allTypes: 'Tous les types',
    allRarities: 'Toutes les raretés',
    showing: 'Affichés :',
    total: 'Total :',
    types: 'Types :',
    items: 'objets',
    noItemsFound: 'Aucun objet trouvé',
    tryAdjusting: 'Essayez de modifier vos filtres de recherche',
    description: 'Description',
    statistics: 'Statistiques',
    recycleThese: 'Recycler ces objets pour obtenir celui-ci',
    requiredToCraft: 'Nécessaire pour fabriquer ces objets',
    craftingRecipe: 'Recette de fabrication',
    lootAreas: 'Zones de butin',
    soldBy: 'Vendu par',
    workbench: 'Établi',
    value: 'Valeur',
    footer: 'Base de données Arc Raiders - Propulsé par Next.js',
    disclaimer: 'Ceci est un projet de fan non affilié et non approuvé par Embark Studios ou Nexon.',
    credits: 'Arc Raiders est une marque déposée de Embark Studios et Nexon. Tous les contenus et matériaux du jeu sont la propriété de leurs détenteurs respectifs.',
    openSource: 'Projet open source disponible sur',
    github: 'GitHub',
    license: 'Contributions bienvenues - Usage non commercial uniquement',
  },
};

export function getTranslation(lang: Language) {
  return translations[lang];
}

// Stat labels translation map
const statLabels: Record<Language, Record<string, string>> = {
  en: {
    stackSize: 'Stack Size',
    weight: 'Weight',
    damage: 'Damage',
    fireRate: 'Fire Rate',
    magazineSize: 'Magazine',
    reloadTime: 'Reload Time',
    range: 'Range',
    accuracy: 'Accuracy',
    durability: 'Durability',
    armor: 'Armor',
    speed: 'Speed',
    capacity: 'Capacity',
    healing: 'Healing',
    shield: 'Shield',
    energy: 'Energy',
    ammoType: 'Ammo Type',
    rarity: 'Rarity',
    tier: 'Tier',
    value: 'Value',
  },
  fr: {
    stackSize: 'Taille de pile',
    weight: 'Poids',
    damage: 'Dégâts',
    fireRate: 'Cadence de tir',
    magazineSize: 'Chargeur',
    reloadTime: 'Temps de rechargement',
    range: 'Portée',
    accuracy: 'Précision',
    durability: 'Durabilité',
    armor: 'Armure',
    speed: 'Vitesse',
    capacity: 'Capacité',
    healing: 'Soin',
    shield: 'Bouclier',
    energy: 'Énergie',
    ammoType: 'Type de munition',
    rarity: 'Rareté',
    tier: 'Niveau',
    value: 'Valeur',
  },
};

export function getStatLabel(key: string, lang: Language): string {
  const label = statLabels[lang][key];
  if (label) return label;

  // Fallback: format camelCase to Title Case
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
