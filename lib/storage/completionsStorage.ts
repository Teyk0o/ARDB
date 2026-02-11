/**
 * Local Storage Manager for User Completions
 * Handles client-side persistence of completed quests, projects, and workshops
 */

const STORAGE_KEY = 'ardb_completions';
const STORAGE_VERSION = 1;

/**
 * Completions data structure
 */
export interface CompletionsData {
  quests: string[];
  projects: string[];
  workshops: string[];
  version: number;
  lastUpdated: string;
}

/**
 * Initialize empty completions data
 */
function createEmptyCompletions(): CompletionsData {
  return {
    quests: [],
    projects: [],
    workshops: [],
    version: STORAGE_VERSION,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get completions from localStorage
 */
export function getCompletions(): CompletionsData {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, using in-memory storage');
    return createEmptyCompletions();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return createEmptyCompletions();
    }

    const parsed = JSON.parse(stored);

    // Validate structure
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.quests) ||
      !Array.isArray(parsed.projects) ||
      !Array.isArray(parsed.workshops)
    ) {
      console.warn('Invalid completions data structure, resetting');
      return createEmptyCompletions();
    }

    // Handle version migrations if needed
    if (parsed.version !== STORAGE_VERSION) {
      console.log('Migrating completions data to new version');
      return migrateCompletions(parsed);
    }

    return parsed;
  } catch (error) {
    console.error('Error reading completions from localStorage:', error);
    return createEmptyCompletions();
  }
}

/**
 * Save completions to localStorage
 */
export function setCompletions(data: CompletionsData): boolean {
  if (!isLocalStorageAvailable()) {
    console.warn('localStorage not available, changes will not persist');
    return false;
  }

  try {
    const toSave = {
      ...data,
      version: STORAGE_VERSION,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    return true;
  } catch (error) {
    console.error('Error saving completions to localStorage:', error);
    return false;
  }
}

/**
 * Add a single completion
 */
export function addCompletion(
  type: 'quests' | 'projects' | 'workshops',
  id: string
): boolean {
  const data = getCompletions();

  if (!data[type].includes(id)) {
    data[type].push(id);
    return setCompletions(data);
  }

  return true; // Already exists
}

/**
 * Remove a single completion
 */
export function removeCompletion(
  type: 'quests' | 'projects' | 'workshops',
  id: string
): boolean {
  const data = getCompletions();
  const index = data[type].indexOf(id);

  if (index !== -1) {
    data[type].splice(index, 1);
    return setCompletions(data);
  }

  return true; // Already removed
}

/**
 * Check if an item is completed
 */
export function isCompleted(
  type: 'quests' | 'projects' | 'workshops',
  id: string
): boolean {
  const data = getCompletions();
  return data[type].includes(id);
}

/**
 * Clear all completions
 */
export function clearCompletions(): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing completions:', error);
    return false;
  }
}

/**
 * Import completions from external data (merge with existing)
 */
export function importCompletions(
  data: Partial<CompletionsData>,
  mode: 'merge' | 'replace' = 'merge'
): boolean {
  const current = mode === 'merge' ? getCompletions() : createEmptyCompletions();

  if (data.quests) {
    current.quests = [
      ...new Set([...current.quests, ...data.quests]),
    ];
  }

  if (data.projects) {
    current.projects = [
      ...new Set([...current.projects, ...data.projects]),
    ];
  }

  if (data.workshops) {
    current.workshops = [
      ...new Set([...current.workshops, ...data.workshops]),
    ];
  }

  return setCompletions(current);
}

/**
 * Export completions for backup or sync
 */
export function exportCompletions(): CompletionsData {
  return getCompletions();
}

/**
 * Get completions count
 */
export function getCompletionsCount(): {
  quests: number;
  projects: number;
  workshops: number;
  total: number;
} {
  const data = getCompletions();
  return {
    quests: data.quests.length,
    projects: data.projects.length,
    workshops: data.workshops.length,
    total: data.quests.length + data.projects.length + data.workshops.length,
  };
}

/**
 * Migrate completions data from old versions
 */
function migrateCompletions(oldData: unknown): CompletionsData {
  // Currently only version 1, but placeholder for future migrations
  const newData = createEmptyCompletions();

  // Copy valid data if exists
  if (oldData && typeof oldData === 'object') {
    const old = oldData as Record<string, unknown>;
    if (Array.isArray(old.quests)) newData.quests = old.quests;
    if (Array.isArray(old.projects)) newData.projects = old.projects;
    if (Array.isArray(old.workshops)) newData.workshops = old.workshops;
  }

  // Save migrated data
  setCompletions(newData);
  return newData;
}

/**
 * Convert completions data to Set format for easier checks
 */
export function completionsToSets(data: CompletionsData): {
  quests: Set<string>;
  projects: Set<string>;
  workshops: Set<string>;
} {
  return {
    quests: new Set(data.quests),
    projects: new Set(data.projects),
    workshops: new Set(data.workshops),
  };
}

/**
 * Convert Sets back to array format for storage
 */
export function setsToCompletions(sets: {
  quests: Set<string>;
  projects: Set<string>;
  workshops: Set<string>;
}): CompletionsData {
  return {
    quests: Array.from(sets.quests),
    projects: Array.from(sets.projects),
    workshops: Array.from(sets.workshops),
    version: STORAGE_VERSION,
    lastUpdated: new Date().toISOString(),
  };
}
