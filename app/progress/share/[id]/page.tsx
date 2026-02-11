'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import MainHeader from '@/components/MainHeader';
import { getTranslation, getWorkshopLabel, Language } from '@/lib/translations';
import { useCompletions } from '@/contexts/CompletionsContext';
import { FaShare, FaDownload, FaTimes, FaCheckCircle } from 'react-icons/fa';
import type { Quest, Project, WorkshopUpgrades } from '@/types/tags';

// Import JSON data
import workshopUpgradesData from '@/data/workshop_upgrades.json';
import projectsDataRaw from '@/data/projects.json';
import questsDataRaw from '@/data/quests-all.json';

export default function SharedProgressPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params.id as string;

  const [language, setLanguage] = useState<Language>('en');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedData, setSharedData] = useState<any>(null);
  const [imported, setImported] = useState(false);
  const [activeTab, setActiveTab] = useState<'quests' | 'projects' | 'workshops'>('quests');

  const completionsContext = useCompletions();
  const t = getTranslation(language);

  // Load data
  const [quests, setQuests] = useState<Quest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [workshops, setWorkshops] = useState<any[]>([]);

  useEffect(() => {
    // Load quests
    let questsArray: Quest[] = [];
    if (Array.isArray(questsDataRaw)) {
      questsArray = questsDataRaw as Quest[];
    } else if (typeof questsDataRaw === 'object' && questsDataRaw !== null) {
      questsArray = Object.values(questsDataRaw) as Quest[];
    }
    setQuests(questsArray);

    // Load projects
    const projectsArray = Array.isArray(projectsDataRaw) ? (projectsDataRaw as Project[]) : [];
    setProjects(projectsArray);

    // Load workshops
    const workshopData = workshopUpgradesData as WorkshopUpgrades;
    const workshopsList: any[] = [];
    Object.entries(workshopData).forEach(([stationId, levels]) => {
      Object.keys(levels).forEach((level) => {
        workshopsList.push({
          stationId,
          level,
          key: `${stationId}:${level}`,
        });
      });
    });
    setWorkshops(workshopsList);
  }, []);

  // Filter completed items (must be before any early returns)
  const completedQuests = useMemo(() => {
    if (!sharedData) return [];
    return quests.filter(q => sharedData.progressData.quests.includes(q.id));
  }, [quests, sharedData]);

  const completedProjects = useMemo(() => {
    if (!sharedData) return [];
    const phaseSet = new Set(sharedData.progressData.projects);
    const result: Array<{ project: Project; phases: number[] }> = [];

    projects.forEach(project => {
      const completedPhases = project.phases
        .filter(phase => phaseSet.has(`${project.id}:${phase.phase}`))
        .map(phase => phase.phase);

      if (completedPhases.length > 0) {
        result.push({ project, phases: completedPhases });
      }
    });

    return result;
  }, [projects, sharedData]);

  const completedWorkshops = useMemo(() => {
    if (!sharedData) return [];
    return workshops.filter(w => sharedData.progressData.workshops.includes(w.key));
  }, [workshops, sharedData]);

  // Load language
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved && ['en', 'fr', 'es', 'de', 'zh-CN'].includes(saved)) {
        setLanguage(saved);
      }
    }
  }, []);

  // Fetch shared progress
  useEffect(() => {
    async function fetchSharedProgress() {
      try {
        const response = await fetch(`/api/progress/share/${shareId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Share link not found or expired');
          } else {
            setError('Failed to load shared progress');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setSharedData(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shared progress:', err);
        setError('Failed to load shared progress');
        setLoading(false);
      }
    }

    if (shareId) {
      fetchSharedProgress();
    }
  }, [shareId]);

  // Import progress
  const handleImport = async () => {
    if (!completionsContext || !sharedData) return;

    try {
      await completionsContext.importData(sharedData.progressData, 'merge');
      setImported(true);

      // Redirect to progress page after 2 seconds
      setTimeout(() => {
        router.push('/progress');
      }, 2000);
    } catch (error) {
      console.error('Error importing progress:', error);
      alert('Failed to import progress');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-arc-blue">
        <MainHeader language={language} setLanguage={setLanguage} />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arc-yellow"></div>
            </div>
            <p className="text-arc-white mt-4">{t.loadingSharedProgress || 'Loading shared progress...'}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen bg-arc-blue">
        <MainHeader language={language} setLanguage={setLanguage} />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center py-20">
            <FaTimes className="text-red-500 text-6xl mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-arc-white mb-4">
              {error || t.shareLinkNotFound || 'Share link not found'}
            </h1>
            <p className="text-arc-white/70 mb-8">
              {t.shareLinkExpired || 'This share link may have expired or doesn\'t exist.'}
            </p>
            <button
              onClick={() => router.push('/progress')}
              className="px-6 py-3 rounded-lg font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: '#f1aa1c',
                color: '#130918',
              }}
            >
              {t.goToProgressPage || 'Go to Progress Page'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const { progressData, viewCount } = sharedData;
  const totalCompletions = progressData.quests.length + progressData.projects.length + progressData.workshops.length;

  return (
    <div className="min-h-screen bg-arc-blue">
      <MainHeader language={language} setLanguage={setLanguage} />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <FaShare className="text-arc-yellow text-5xl mx-auto mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-arc-yellow mb-3">
              {t.sharedProgress || 'Shared Progress'}
            </h1>
            <p className="text-arc-white/70">
              {t.someoneShared || 'Someone shared their progress with you!'}
            </p>
          </div>

          {/* Progress Summary */}
          <div
            className="rounded-lg p-6 mb-6"
            style={{
              backgroundColor: '#1a1120',
              border: '1px solid #2d1f38',
            }}
          >
            <h2 className="text-xl font-bold text-arc-white mb-4">{t.progressSummary || 'Progress Summary'}</h2>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{progressData.quests.length}</div>
                <div className="text-sm text-arc-white/70">{t.quests || 'Quests'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{progressData.projects.length}</div>
                <div className="text-sm text-arc-white/70">{t.projects || 'Projects'}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{progressData.workshops.length}</div>
                <div className="text-sm text-arc-white/70">{t.workshops || 'Workshops'}</div>
              </div>
            </div>

            <div className="text-center text-arc-white/50 text-sm">
              {(t.totalCompletionsViewed || 'Total: {total} completions • Viewed {views} times')
                .replace('{total}', totalCompletions.toString())
                .replace('{views}', viewCount.toString())}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab('quests')}
              className="rounded-lg px-4 py-2 font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'quests' ? '#f1aa1c' : '#2d1f38',
                color: activeTab === 'quests' ? '#130918' : '#ffffff',
              }}
            >
              {t.quests} ({completedQuests.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className="rounded-lg px-4 py-2 font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'projects' ? '#f1aa1c' : '#2d1f38',
                color: activeTab === 'projects' ? '#130918' : '#ffffff',
              }}
            >
              {t.projects} ({completedProjects.length})
            </button>
            <button
              onClick={() => setActiveTab('workshops')}
              className="rounded-lg px-4 py-2 font-medium transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === 'workshops' ? '#f1aa1c' : '#2d1f38',
                color: activeTab === 'workshops' ? '#130918' : '#ffffff',
              }}
            >
              {t.workshops} ({completedWorkshops.length})
            </button>
          </div>

          {/* Detailed List */}
          <div
            className="rounded-lg p-4 mb-6 max-h-96 overflow-y-auto"
            style={{
              backgroundColor: '#1a1120',
              border: '1px solid #2d1f38',
            }}
          >
            {activeTab === 'quests' && (
              <div className="space-y-2">
                {completedQuests.map(quest => (
                  <div
                    key={quest.id}
                    className="p-3 rounded"
                    style={{ backgroundColor: '#2d1f38' }}
                  >
                    <div className="text-arc-white font-medium">
                      {quest.name[language] || quest.name.en}
                    </div>
                    {quest.description && (
                      <div className="text-arc-white/60 text-sm mt-1">
                        {quest.description[language] || quest.description.en}
                      </div>
                    )}
                  </div>
                ))}
                {completedQuests.length === 0 && (
                  <div className="text-center text-arc-white/50 py-8">
                    {t.noQuestsCompleted || 'No quests completed'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'projects' && (
              <div className="space-y-2">
                {completedProjects.map(({ project, phases }) => (
                  <div
                    key={project.id}
                    className="p-3 rounded"
                    style={{ backgroundColor: '#2d1f38' }}
                  >
                    <div className="text-arc-white font-medium mb-2">
                      {project.name[language] || project.name.en}
                    </div>
                    <div className="text-arc-white/60 text-sm">
                      {t.phases || 'Phases'}: {phases.join(', ')}
                    </div>
                  </div>
                ))}
                {completedProjects.length === 0 && (
                  <div className="text-center text-arc-white/50 py-8">
                    {t.noProjectsCompleted || 'No projects completed'}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'workshops' && (
              <div className="space-y-2">
                {completedWorkshops.map(workshop => (
                  <div
                    key={workshop.key}
                    className="p-3 rounded"
                    style={{ backgroundColor: '#2d1f38' }}
                  >
                    <div className="text-arc-white font-medium">
                      {getWorkshopLabel(workshop.stationId, language)} - {t.level || 'Level'} {workshop.level}
                    </div>
                  </div>
                ))}
                {completedWorkshops.length === 0 && (
                  <div className="text-center text-arc-white/50 py-8">
                    {t.noWorkshopsCompleted || 'No workshops completed'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Import Button */}
          {!imported ? (
            <button
              onClick={handleImport}
              disabled={!completionsContext}
              className="w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
              style={{
                backgroundColor: '#f1aa1c',
                color: '#130918',
              }}
            >
              <FaDownload />
              {t.importThisProgress || 'Import This Progress'}
            </button>
          ) : (
            <div
              className="w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-3"
              style={{
                backgroundColor: '#22c55e',
                color: '#ffffff',
              }}
            >
              <FaCheckCircle />
              {t.progressImported || 'Progress Imported! Redirecting...'}
            </div>
          )}

          <p className="text-center text-arc-white/50 text-sm mt-4">
            {t.mergeWarning || 'This will merge the shared progress with your existing completions.'}
          </p>
        </div>
      </main>
    </div>
  );
}
