'use client';

import { useEffect, useState, useMemo } from 'react';
import { FaSearch, FaCheck, FaTimes, FaFileExport, FaFileImport, FaCheckCircle, FaFilter, FaCloud, FaInfoCircle, FaChevronDown, FaChevronRight, FaMinus, FaShare } from 'react-icons/fa';
import MainHeader from '@/components/MainHeader';
import { getTranslation, getWorkshopLabel, Language } from '@/lib/translations';
import { useCompletions } from '@/contexts/CompletionsContext';
import type { Quest, Project, WorkshopUpgrades } from '@/types/tags';

// Import JSON data directly (client-safe)
import workshopUpgradesData from '@/data/workshop_upgrades.json';
import projectsDataRaw from '@/data/projects.json';
import questsDataRaw from '@/data/quests-all.json';

type TabType = 'all' | 'quests' | 'projects' | 'workshops';

interface WorkshopUpgrade {
  stationId: string;
  stationName: string;
  level: string;
  key: string;
}

export default function ProgressPage() {
  // Language
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved && ['en', 'fr', 'es', 'de', 'zh-CN'].includes(saved)) {
        return saved;
      }
    }
    return 'en';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);

  // Completions context
  const completionsContext = useCompletions();

  // Handle case where context is not available
  if (!completionsContext) {
    return (
      <div className="min-h-screen bg-arc-blue flex items-center justify-center">
        <div className="text-arc-white text-lg">Loading...</div>
      </div>
    );
  }

  const {
    isCompleted,
    toggleCompletion,
    getStats,
    isLoading: completionsLoading,
    exportData,
    importData,
    isAuthenticated,
  } = completionsContext;

  // Data
  const [quests, setQuests] = useState<Quest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workshops, setWorkshops] = useState<WorkshopUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [shareLoading, setShareLoading] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load data
  useEffect(() => {
    try {
      // Load quests from imported JSON (convert object to array)
      let questsArray: Quest[] = [];
      if (Array.isArray(questsDataRaw)) {
        questsArray = questsDataRaw as Quest[];
      } else if (typeof questsDataRaw === 'object' && questsDataRaw !== null) {
        // quests-all.json is an object with quest IDs as keys
        questsArray = Object.values(questsDataRaw) as Quest[];
      }
      setQuests(questsArray);

      // Load projects from imported JSON
      const projectsArray = Array.isArray(projectsDataRaw) ? (projectsDataRaw as Project[]) : [];
      setProjects(projectsArray);

      // Load workshop upgrades from imported JSON
      const workshopData = workshopUpgradesData as WorkshopUpgrades;
      const workshopsList: WorkshopUpgrade[] = [];
      Object.entries(workshopData).forEach(([stationId, levels]) => {
        Object.keys(levels).forEach((level) => {
          workshopsList.push({
            stationId,
            stationName: stationId.replace(/_/g, ' '),
            level,
            key: `${stationId}:${level}`,
          });
        });
      });
      setWorkshops(workshopsList);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync language to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('arc-db-language', language);
      window.dispatchEvent(new Event('storage'));
    }
  }, [language, isClient]);

  const t = getTranslation(language);
  const stats = getStats();

  // Filtered data
  const filteredQuests = useMemo(() => {
    // Sort by updatedAt date (chronological order)
    const sortedQuests = [...quests].sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateA - dateB;
    });

    if (!searchQuery) return sortedQuests;

    const query = searchQuery.toLowerCase();
    return sortedQuests.filter((q) => {
      const name = q.name[language] || q.name.en;
      return name.toLowerCase().includes(query);
    });
  }, [quests, searchQuery, language]);

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    const query = searchQuery.toLowerCase();
    return projects.filter((p) => {
      const name = p.name[language] || p.name.en;
      return name.toLowerCase().includes(query);
    });
  }, [projects, searchQuery, language]);

  const filteredWorkshops = useMemo(() => {
    if (!searchQuery) return workshops;
    const query = searchQuery.toLowerCase();
    return workshops.filter((w) => w.stationName.toLowerCase().includes(query));
  }, [workshops, searchQuery]);

  // Handlers
  const handleSelectAll = () => {
    if (activeTab === 'all' || activeTab === 'quests') {
      filteredQuests.forEach((q) => {
        if (!isCompleted('quests', q.id)) {
          toggleCompletion('quests', q.id);
        }
      });
    }
    if (activeTab === 'all' || activeTab === 'projects') {
      filteredProjects.forEach((p) => {
        p.phases.forEach((phase) => {
          const phaseKey = `${p.id}:${phase.phase}`;
          if (!isCompleted('projects', phaseKey)) {
            toggleCompletion('projects', phaseKey);
          }
        });
      });
    }
    if (activeTab === 'all' || activeTab === 'workshops') {
      filteredWorkshops.forEach((w) => {
        if (!isCompleted('workshops', w.key)) {
          toggleCompletion('workshops', w.key);
        }
      });
    }
  };

  const handleDeselectAll = () => {
    if (activeTab === 'all' || activeTab === 'quests') {
      filteredQuests.forEach((q) => {
        if (isCompleted('quests', q.id)) {
          toggleCompletion('quests', q.id);
        }
      });
    }
    if (activeTab === 'all' || activeTab === 'projects') {
      filteredProjects.forEach((p) => {
        p.phases.forEach((phase) => {
          const phaseKey = `${p.id}:${phase.phase}`;
          if (isCompleted('projects', phaseKey)) {
            toggleCompletion('projects', phaseKey);
          }
        });
      });
    }
    if (activeTab === 'all' || activeTab === 'workshops') {
      filteredWorkshops.forEach((w) => {
        if (isCompleted('workshops', w.key)) {
          toggleCompletion('workshops', w.key);
        }
      });
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ardb-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        await importData(data, 'merge');
        alert('Import successful! Your progress has been merged.');
      } catch (error) {
        console.error('Import error:', error);
        alert('Error importing file. Please check the file format.');
      }
    };
    input.click();
  };

  const handleShare = async () => {
    setShareModalOpen(true);
    setShareLoading(true);
    setShareLink(null);

    try {
      const data = exportData();
      const response = await fetch('/api/progress/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create share link');
      }

      const result = await response.json();
      setShareLink(result.fullUrl);
    } catch (error) {
      console.error('Error creating share link:', error);
      alert('Failed to create share link');
      setShareModalOpen(false);
    } finally {
      setShareLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      alert(t.linkCopied || 'Link copied to clipboard!');
    }
  };

  // Total counts
  const totalQuests = quests.length;
  const totalProjectPhases = projects.reduce((sum, p) => sum + p.phases.length, 0);
  const totalWorkshops = workshops.length;
  const totalAll = totalQuests + totalProjectPhases + totalWorkshops;

  if (!isClient) {
    return null; // Avoid hydration issues
  }

  return (
    <div className="min-h-screen bg-arc-blue">
      <MainHeader language={language} setLanguage={setLanguage} />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-arc-yellow mb-3">
            {t.myProgress || 'My Progress'}
          </h1>
          <p className="text-arc-white/70 leading-relaxed max-w-3xl">
            {t.progressDescription || 'Track your completed quests, projects, and workshop upgrades. Your selections help filter item recommendations to show only what\'s relevant for your current progress.'}
          </p>
        </div>

        {loading || completionsLoading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arc-yellow"></div>
            </div>
          </div>
        ) : (
          <>
            {/* Cloud Sync Banner */}
            <div
              className="rounded-lg p-4 mb-6 flex items-center gap-3"
              style={{
                backgroundColor: isAuthenticated ? '#22c55e20' : '#3b82f620',
                border: `1px solid ${isAuthenticated ? '#22c55e' : '#3b82f6'}`,
              }}
            >
              {isAuthenticated ? (
                <FaCloud className="text-2xl flex-shrink-0" style={{ color: '#22c55e' }} />
              ) : (
                <FaInfoCircle className="text-2xl flex-shrink-0" style={{ color: '#3b82f6' }} />
              )}
              <p
                className="text-sm font-medium"
                style={{ color: isAuthenticated ? '#22c55e' : '#3b82f6' }}
              >
                {isAuthenticated ? t.cloudSyncEnabled : t.cloudSyncDisabled}
              </p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label={t.quests || 'Quests'}
                completed={stats.quests}
                total={totalQuests}
                color="#22c55e"
              />
              <StatCard
                label={t.projects || 'Projects'}
                completed={stats.projects}
                total={totalProjectPhases}
                color="#3b82f6"
              />
              <StatCard
                label={t.workshopUpgrades || 'Workshops'}
                completed={stats.workshops}
                total={totalWorkshops}
                color="#a855f7"
              />
              <StatCard
                label={t.total || 'Total'}
                completed={stats.total}
                total={totalAll}
                color="#f59e0b"
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="text"
                  placeholder={t.searchProgress || 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/50 focus:outline-none transition-all font-medium"
                  style={{
                    backgroundColor: '#2d1f38',
                    border: '1px solid #2d1f38',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleSelectAll}
                  className="rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: '#2d1f38',
                    color: '#f1aa1c',
                    border: '1px solid #f1aa1c',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f1aa1c';
                    e.currentTarget.style.color = '#130918';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d1f38';
                    e.currentTarget.style.color = '#f1aa1c';
                  }}
                >
                  <FaCheck />
                  <span className="hidden md:inline">{t.selectAll || 'Select All'}</span>
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: '#2d1f38',
                    color: '#ffffff',
                    border: '1px solid #2d1f38',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                >
                  <FaTimes />
                  <span className="hidden md:inline">{t.deselectAll || 'Deselect All'}</span>
                </button>
                <button
                  onClick={handleExport}
                  className="rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: '#2d1f38',
                    color: '#ffffff',
                    border: '1px solid #2d1f38',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                  title={t.export || 'Export'}
                >
                  <FaFileExport />
                </button>
                <button
                  onClick={handleImport}
                  className="rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: '#2d1f38',
                    color: '#ffffff',
                    border: '1px solid #2d1f38',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                  title={t.import || 'Import'}
                >
                  <FaFileImport />
                </button>
                <button
                  onClick={handleShare}
                  className="rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                  style={{
                    backgroundColor: '#2d1f38',
                    color: '#ffffff',
                    border: '1px solid #2d1f38',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                  title="Share"
                >
                  <FaShare />
                  <span className="hidden md:inline">Share</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              <TabButton
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                label={t.all || 'All'}
                count={stats.total}
                total={totalAll}
              />
              <TabButton
                active={activeTab === 'quests'}
                onClick={() => setActiveTab('quests')}
                label={t.quests || 'Quests'}
                count={stats.quests}
                total={totalQuests}
              />
              <TabButton
                active={activeTab === 'projects'}
                onClick={() => setActiveTab('projects')}
                label={t.projects || 'Projects'}
                count={stats.projects}
                total={totalProjectPhases}
              />
              <TabButton
                active={activeTab === 'workshops'}
                onClick={() => setActiveTab('workshops')}
                label={t.workshopUpgrades || 'Workshops'}
                count={stats.workshops}
                total={totalWorkshops}
              />
            </div>

            {/* Content */}
            <div className="space-y-3">
              {/* Quests */}
              {(activeTab === 'all' || activeTab === 'quests') && (
                <>
                  {filteredQuests.map((quest) => (
                    <CompletionItem
                      key={quest.id}
                      label={quest.name[language] || quest.name.en}
                      description={quest.description?.[language] || quest.description?.en}
                      completed={isCompleted('quests', quest.id)}
                      onToggle={() => toggleCompletion('quests', quest.id)}
                      color="#22c55e"
                      type="quest"
                      language={language}
                    />
                  ))}
                </>
              )}

              {/* Projects */}
              {(activeTab === 'all' || activeTab === 'projects') && (
                <>
                  {filteredProjects.map((project) => (
                    <ProjectCompletionItem
                      key={project.id}
                      project={project}
                      language={language}
                      isExpanded={expandedProjects.has(project.id)}
                      onToggleExpand={() => {
                        const newExpanded = new Set(expandedProjects);
                        if (newExpanded.has(project.id)) {
                          newExpanded.delete(project.id);
                        } else {
                          newExpanded.add(project.id);
                        }
                        setExpandedProjects(newExpanded);
                      }}
                      isCompleted={isCompleted}
                      toggleCompletion={toggleCompletion}
                    />
                  ))}
                </>
              )}

              {/* Workshops */}
              {(activeTab === 'all' || activeTab === 'workshops') && (
                <>
                  {filteredWorkshops.map((workshop) => (
                    <CompletionItem
                      key={workshop.key}
                      label={`${getWorkshopLabel(workshop.stationId, language)} - ${t.level || 'Level'} ${workshop.level}`}
                      completed={isCompleted('workshops', workshop.key)}
                      onToggle={() => toggleCompletion('workshops', workshop.key)}
                      color="#a855f7"
                      type="workshop"
                      language={language}
                    />
                  ))}
                </>
              )}

              {/* No results */}
              {((activeTab === 'all' || activeTab === 'quests') && filteredQuests.length === 0 && searchQuery) ||
              ((activeTab === 'all' || activeTab === 'projects') && filteredProjects.length === 0 && searchQuery) ||
              ((activeTab === 'all' || activeTab === 'workshops') && filteredWorkshops.length === 0 && searchQuery) ? (
                <div className="text-center py-12">
                  <FaFilter className="text-arc-white/30 text-5xl mx-auto mb-4" />
                  <p className="text-arc-white/50 text-lg">
                    {t.noResults || 'No results found'}
                  </p>
                </div>
              ) : null}
            </div>
          </>
        )}
      </main>

      {/* Share Modal */}
      {shareModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShareModalOpen(false)}
        >
          <div
            className="max-w-md w-full rounded-lg p-6"
            style={{
              backgroundColor: '#1a1120',
              border: '1px solid #2d1f38',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-arc-yellow">{t.shareProgress || 'Share Progress'}</h2>
              <button
                onClick={() => setShareModalOpen(false)}
                className="text-arc-white/50 hover:text-arc-white transition-colors cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {shareLoading ? (
              <div className="text-center py-8">
                <div className="inline-block">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arc-yellow"></div>
                </div>
                <p className="text-arc-white mt-4">{t.generatingLink || 'Generating share link...'}</p>
              </div>
            ) : shareLink ? (
              <div>
                <p className="text-arc-white/70 mb-4">
                  {t.progressSaved || 'Your progress has been saved! Share this link with others:'}
                </p>

                <div
                  className="rounded p-3 mb-4 break-all"
                  style={{
                    backgroundColor: '#2d1f38',
                    border: '1px solid #f1aa1c',
                  }}
                >
                  <code className="text-arc-yellow text-sm">{shareLink}</code>
                </div>

                <button
                  onClick={handleCopyLink}
                  className="w-full py-3 rounded-lg font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor: '#f1aa1c',
                    color: '#130918',
                  }}
                >
                  {t.copyLink || 'Copy Link'}
                </button>

                <p className="text-arc-white/50 text-sm mt-4 text-center">
                  {t.linkExpires || 'Link expires in 30 days'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-arc-white/70 text-base font-medium mb-3">{t.disclaimer}</p>
          <p className="text-arc-white/50 text-sm mb-2">{t.credits}</p>
          <p className="text-arc-white/40 text-sm">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}

// Stat Card Component
function StatCard({
  label,
  completed,
  total,
  color,
}: {
  label: string;
  completed: number;
  total: number;
  color: string;
}) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className="rounded-lg p-5 border-2"
      style={{
        backgroundColor: color + '10',
        borderColor: color,
      }}
    >
      <div className="text-arc-white/70 text-sm font-medium mb-2">{label}</div>
      <div className="flex items-end gap-2 mb-3">
        <div className="text-3xl font-bold text-arc-white">{completed}</div>
        <div className="text-arc-white/50 text-lg mb-1">/ {total}</div>
      </div>
      <div className="w-full bg-arc-blue-lighter rounded-full h-2 overflow-hidden">
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="text-arc-white/70 text-sm mt-2 text-right">{percentage}%</div>
    </div>
  );
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  label,
  count,
  total,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  total: number;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer"
      style={{
        backgroundColor: active ? '#f1aa1c' : '#2d1f38',
        color: active ? '#130918' : '#ffffff',
        border: active ? '1px solid #f1aa1c' : '1px solid #2d1f38',
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#f1aa1c';
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.borderColor = '#2d1f38';
        }
      }}
    >
      {label} <span style={{ opacity: 0.7 }}>({count}/{total})</span>
    </button>
  );
}

// Project Completion Item Component (with expandable phases)
function ProjectCompletionItem({
  project,
  language,
  isExpanded,
  onToggleExpand,
  isCompleted,
  toggleCompletion,
}: {
  project: Project;
  language: Language;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isCompleted: (type: string, id: string) => boolean;
  toggleCompletion: (type: string, id: string) => void;
}) {
  const t = getTranslation(language);
  const color = '#3b82f6';

  // Check if all phases are completed
  const allPhasesCompleted = project.phases.every(phase =>
    isCompleted('projects', `${project.id}:${phase.phase}`)
  );

  // Check if at least one phase is completed
  const somePhaseCompleted = project.phases.some(phase =>
    isCompleted('projects', `${project.id}:${phase.phase}`)
  );

  // Toggle all phases
  const handleToggleAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    project.phases.forEach(phase => {
      const phaseKey = `${project.id}:${phase.phase}`;
      if (allPhasesCompleted) {
        // Uncheck all
        if (isCompleted('projects', phaseKey)) {
          toggleCompletion('projects', phaseKey);
        }
      } else {
        // Check all
        if (!isCompleted('projects', phaseKey)) {
          toggleCompletion('projects', phaseKey);
        }
      }
    });
  };

  return (
    <div className="rounded-lg" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
      {/* Project Header */}
      <div
        className="w-full group p-5 cursor-pointer transition-all duration-300 text-left flex items-center gap-4"
        style={{
          borderBottom: isExpanded ? '1px solid #2d1f38' : 'none',
        }}
        onClick={onToggleExpand}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#f1aa1c';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#2d1f38';
        }}
      >
        {/* Expand/Collapse Icon */}
        <div className="flex-shrink-0 text-arc-white/50">
          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
        </div>

        {/* Checkbox for all phases */}
        <div
          onClick={handleToggleAll}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            allPhasesCompleted ? 'border-arc-yellow bg-arc-yellow' :
            somePhaseCompleted ? 'border-arc-yellow bg-arc-yellow' :
            'border-arc-white/30'
          }`}
        >
          {allPhasesCompleted && <FaCheckCircle className="text-arc-blue text-sm" />}
          {somePhaseCompleted && !allPhasesCompleted && <FaMinus className="text-arc-blue text-sm" />}
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <div
            className={`font-bold text-lg leading-tight transition-colors ${
              allPhasesCompleted ? 'text-arc-white/50 line-through' : 'text-arc-white group-hover:text-arc-yellow'
            }`}
          >
            {project.name[language] || project.name.en}
          </div>
          {project.description && (
            <div
              className={`text-sm mt-2 leading-relaxed transition-all ${
                allPhasesCompleted ? 'text-arc-white/30' : 'text-arc-white/60'
              }`}
            >
              {project.description[language] || project.description.en}
            </div>
          )}
        </div>

        {/* Type Badge */}
        <div
          className="flex-shrink-0 px-3 py-1 rounded text-sm font-medium border whitespace-nowrap"
          style={{
            backgroundColor: color + '20',
            color: color,
            borderColor: color + '40',
          }}
        >
          {t.project || 'Project'}
        </div>

        {/* Phase Counter */}
        <div className="flex-shrink-0 text-sm text-arc-white/50">
          {project.phases.filter(p => isCompleted('projects', `${project.id}:${p.phase}`)).length}/{project.phases.length}
        </div>
      </div>

      {/* Phases List (when expanded) */}
      {isExpanded && (
        <div className="px-5 py-3 space-y-2">
          {project.phases.map((phase) => {
            const phaseKey = `${project.id}:${phase.phase}`;
            const phaseCompleted = isCompleted('projects', phaseKey);

            return (
              <button
                key={phaseKey}
                onClick={() => toggleCompletion('projects', phaseKey)}
                className="w-full flex items-center gap-3 p-3 rounded transition-all duration-200 group/phase cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!phaseCompleted) {
                    e.currentTarget.style.backgroundColor = 'rgba(241, 170, 28, 0.1)';
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                {/* Phase Checkbox */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    phaseCompleted ? 'border-arc-yellow bg-arc-yellow' : 'border-arc-white/30 group-hover/phase:border-arc-yellow'
                  }`}
                >
                  {phaseCompleted && <FaCheckCircle className="text-arc-blue text-xs" />}
                </div>

                {/* Phase Name */}
                <div className="flex-1 text-left">
                  <span className={`text-sm transition-colors ${
                    phaseCompleted ? 'text-arc-white/50 line-through' : 'text-arc-white/80 group-hover/phase:text-arc-yellow'
                  }`}>
                    {phase.name[language] || phase.name.en}
                  </span>
                </div>

                {/* Phase Number */}
                <div className="flex-shrink-0 text-xs text-arc-white/40 group-hover/phase:text-arc-yellow">
                  {t.phase || 'Phase'} {phase.phase}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Completion Item Component
function CompletionItem({
  label,
  description,
  completed,
  onToggle,
  color,
  type,
  language,
}: {
  label: string;
  description?: string;
  completed: boolean;
  onToggle: () => void;
  color: string;
  type: 'quest' | 'project' | 'workshop';
  language: Language;
}) {
  const t = getTranslation(language);

  // Get translated type label
  const getTypeLabel = (type: 'quest' | 'project' | 'workshop'): string => {
    const typeLabels: Record<Language, Record<string, string>> = {
      en: { quest: 'Quest', project: 'Project', workshop: 'Workshop' },
      fr: { quest: 'Quête', project: 'Projet', workshop: 'Atelier' },
      es: { quest: 'Misión', project: 'Proyecto', workshop: 'Taller' },
      de: { quest: 'Quest', project: 'Projekt', workshop: 'Werkstatt' },
      'zh-CN': { quest: '任务', project: '项目', workshop: '工坊' },
    };
    return typeLabels[language]?.[type] || type;
  };

  return (
    <button
      onClick={onToggle}
      className="w-full group rounded-lg p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 text-left"
      style={{
        backgroundColor: '#1a1120',
        border: '1px solid #2d1f38',
      }}
      onMouseEnter={(e) => {
        if (!completed) {
          e.currentTarget.style.borderColor = '#f1aa1c';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(241, 170, 28, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2d1f38';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <div className="flex items-center gap-4">
        {/* Checkbox */}
        <div
          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            completed ? 'border-arc-yellow bg-arc-yellow' : 'border-arc-white/30'
          }`}
        >
          {completed && <FaCheckCircle className="text-arc-blue text-sm" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div
            className={`font-bold text-lg leading-tight transition-colors ${
              completed ? 'text-arc-white/50 line-through' : 'text-arc-white group-hover:text-arc-yellow'
            }`}
          >
            {label}
          </div>
          {description && (
            <div
              className={`text-sm mt-2 leading-relaxed transition-all ${
                completed ? 'text-arc-white/30' : 'text-arc-white/60'
              }`}
            >
              {description}
            </div>
          )}
        </div>

        {/* Type Badge */}
        <div
          className="flex-shrink-0 px-3 py-1 rounded text-sm font-medium border whitespace-nowrap"
          style={{
            backgroundColor: color + '20',
            color: color,
            borderColor: color + '40',
          }}
        >
          {getTypeLabel(type)}
        </div>
      </div>
    </button>
  );
}
