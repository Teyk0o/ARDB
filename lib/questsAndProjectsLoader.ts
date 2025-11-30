/**
 * Quests and Projects Loader
 * Utilities to load all quests and projects from data files
 */

import fs from 'fs';
import path from 'path';

/**
 * Quest interface based on the structure in data/quests/*.json
 */
export interface Quest {
  id: string;
  name: {
    en: string;
    [key: string]: string;
  };
  description?: {
    [key: string]: string;
  };
  trader?: string;
  objectives?: Array<{
    [key: string]: string;
  }>;
  rewardItemIds?: Array<{
    itemId: string;
    quantity: number;
  }>;
  xp?: number;
  previousQuestIds?: string[];
  nextQuestIds?: string[];
  updatedAt?: string;
}

/**
 * Project interface based on the structure in data/projects.json
 */
export interface Project {
  id: string;
  name: {
    en: string;
    [key: string]: string;
  };
  description?: {
    [key: string]: string;
  };
  phases?: Array<{
    phase: number;
    name: {
      [key: string]: string;
    };
    requirementItemIds?: Array<{
      itemId: string;
      quantity: number;
    }>;
  }>;
}

/**
 * Loads all quests from the data/quests directory
 * @returns Array of all quests
 */
export function getAllQuests(): Quest[] {
  const questsDirectory = path.join(process.cwd(), 'data', 'quests');

  try {
    const files = fs.readdirSync(questsDirectory);
    const quests: Quest[] = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(questsDirectory, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const quest: Quest = JSON.parse(fileContent);
        quests.push(quest);
      }
    }

    // Sort quests by English name
    return quests.sort((a, b) =>
      (a.name.en || '').localeCompare(b.name.en || '')
    );
  } catch (error) {
    console.error('Error loading quests:', error);
    return [];
  }
}

/**
 * Loads all projects from the data/projects.json file
 * @returns Array of all projects
 */
export function getAllProjects(): Project[] {
  const projectsFilePath = path.join(process.cwd(), 'data', 'projects.json');

  try {
    const fileContent = fs.readFileSync(projectsFilePath, 'utf-8');
    const projects: Project[] = JSON.parse(fileContent);

    // Sort projects by English name
    return projects.sort((a, b) =>
      (a.name.en || '').localeCompare(b.name.en || '')
    );
  } catch (error) {
    console.error('Error loading projects:', error);
    return [];
  }
}

/**
 * Gets all quest names in English for autocomplete
 * @returns Array of quest names
 */
export function getAllQuestNames(): string[] {
  const quests = getAllQuests();
  return quests.map(quest => quest.name.en).filter(Boolean);
}

/**
 * Gets all project names in English for autocomplete
 * @returns Array of project names
 */
export function getAllProjectNames(): string[] {
  const projects = getAllProjects();
  return projects.map(project => project.name.en).filter(Boolean);
}

/**
 * Finds a quest by its ID
 * @param questId - The quest ID to search for
 * @returns The quest object or undefined if not found
 */
export function getQuestById(questId: string): Quest | undefined {
  const quests = getAllQuests();
  return quests.find(quest => quest.id === questId);
}

/**
 * Finds a project by its ID
 * @param projectId - The project ID to search for
 * @returns The project object or undefined if not found
 */
export function getProjectById(projectId: string): Project | undefined {
  const projects = getAllProjects();
  return projects.find(project => project.id === projectId);
}
