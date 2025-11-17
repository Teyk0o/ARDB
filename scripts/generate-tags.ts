import * as fs from 'fs';
import * as path from 'path';
import { TagGenerator } from '../lib/tagGenerator';
import { TagReasonAnalyzer } from '../lib/tagReasoning';
import type { Quest, WorkshopUpgrades, Project } from '../types/tags';

/**
 * Build-time tag generation script
 *
 * Loads all data sources (quests, workshops, items) and generates
 * tags for all items using the recursive utility detection algorithm.
 */

const DATA_DIR = path.join(__dirname, '../data');
const QUESTS_DIR = path.join(DATA_DIR, 'quests');
const OUTPUT_FILE = path.join(DATA_DIR, 'item-tags-computed.json');
const REASONS_OUTPUT_FILE = path.join(DATA_DIR, 'item-tag-reasons.json');

function loadQuests(): Quest[] {
  const questFiles = fs.readdirSync(QUESTS_DIR).filter(f => f.endsWith('.json'));
  const quests: Quest[] = [];

  console.log(`📂 Loading ${questFiles.length} quest files...`);

  for (const file of questFiles) {
    const questPath = path.join(QUESTS_DIR, file);
    const questData = JSON.parse(fs.readFileSync(questPath, 'utf8'));
    quests.push(questData);
  }

  console.log(`✓ Loaded ${quests.length} quests`);
  return quests;
}

function loadWorkshopUpgrades(): WorkshopUpgrades {
  const workshopPath = path.join(DATA_DIR, 'workshop_upgrades.json');
  console.log('📂 Loading workshop upgrades...');

  const workshops = JSON.parse(fs.readFileSync(workshopPath, 'utf8'));

  // Count total requirements
  let totalReqs = 0;
  Object.values(workshops).forEach((station: any) => {
    Object.values(station).forEach((reqs: any) => {
      totalReqs += reqs.length;
    });
  });

  console.log(`✓ Loaded ${Object.keys(workshops).length} workshop stations (${totalReqs} total requirements)`);
  return workshops;
}

function loadItems(): any[] {
  const itemsPath = path.join(DATA_DIR, 'items.json');
  console.log('📂 Loading items...');

  const items = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
  console.log(`✓ Loaded ${items.length} items`);

  return items;
}

function loadProjects(): Project[] {
  const projectsPath = path.join(DATA_DIR, 'projects.json');
  console.log('📂 Loading projects...');

  const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));

  // Count total phase requirements
  let totalPhases = 0;
  let totalReqs = 0;
  projects.forEach((project: Project) => {
    totalPhases += project.phases.length;
    project.phases.forEach(phase => {
      totalReqs += (phase.requirementItemIds?.length || 0);
    });
  });

  console.log(`✓ Loaded ${projects.length} project(s) with ${totalPhases} phases (${totalReqs} total requirements)`);
  return projects;
}

function generateTags(): void {
  console.log('\n🚀 Starting tag generation...\n');

  // Load all data
  const quests = loadQuests();
  const workshopUpgrades = loadWorkshopUpgrades();
  const projects = loadProjects();
  const items = loadItems();

  // Generate tags
  console.log('\n🔍 Analyzing item dependencies...');
  const generator = new TagGenerator(quests, workshopUpgrades, projects, items);
  const tags = generator.generateTags();

  // Statistics
  const stats = {
    keep: 0,
    sell: 0,
    recycle: 0,
    total: 0
  };

  Object.values(tags).forEach(tag => {
    stats[tag]++;
    stats.total++;
  });

  console.log('\n📊 Tag Statistics:');
  console.log(`  Keep:    ${stats.keep} items (${((stats.keep / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Sell:    ${stats.sell} items (${((stats.sell / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Recycle: ${stats.recycle} items (${((stats.recycle / stats.total) * 100).toFixed(1)}%)`);
  console.log(`  Total:   ${stats.total} items tagged`);

  // Save tags to file
  console.log(`\n💾 Saving tags to ${OUTPUT_FILE}...`);
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(tags, null, 2), 'utf8');

  // Generate reasons
  console.log(`\n🔍 Analyzing tag reasons...`);
  const reasonAnalyzer = new TagReasonAnalyzer(quests, workshopUpgrades, projects, items, tags);
  const reasons = reasonAnalyzer.generateAllReasons();

  const reasonStats = Object.values(reasons).reduce((acc, r) => {
    acc[r.tag] = (acc[r.tag] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log(`✓ Generated reasons for ${Object.keys(reasons).length} items`);
  console.log(`  Keep reasons:    ${reasonStats.keep || 0} items`);
  console.log(`  Recycle reasons: ${reasonStats.recycle || 0} items`);

  // Save reasons to file
  console.log(`\n💾 Saving reasons to ${REASONS_OUTPUT_FILE}...`);
  fs.writeFileSync(REASONS_OUTPUT_FILE, JSON.stringify(reasons, null, 2), 'utf8');

  console.log('✅ Tag generation complete!\n');

  // Show some examples
  console.log('📋 Example tags:');
  const exampleItems = [
    'metal_parts',
    'antiseptic',
    'duct_tape',
    'rubber_parts',
    'plastic_parts'
  ];

  exampleItems.forEach(itemId => {
    if (tags[itemId]) {
      const item = items.find((i: any) => i.id === itemId);
      const name = item?.name?.en || itemId;
      console.log(`  ${name.padEnd(20)} → ${tags[itemId]}`);
    }
  });

  // Debug: Show dependency tree for a "keep" item
  const keepItem = Object.keys(tags).find(id => tags[id] === 'keep');
  if (keepItem) {
    console.log(`\n🔗 Dependency tree for "${keepItem}" (first 5 levels):`);
    const tree = generator.getDependencyTree(keepItem, 5);
    tree.slice(0, 10).forEach(node => {
      const indent = '  '.repeat(node.depth);
      console.log(`${indent}${node.itemId} (${node.reason}${node.source ? ': ' + node.source : ''})`);
    });
  }
}

// Run
try {
  generateTags();
} catch (error) {
  console.error('❌ Error generating tags:', error);
  process.exit(1);
}
