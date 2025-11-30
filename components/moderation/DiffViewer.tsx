'use client';

/**
 * Diff Viewer Component
 * Visual comparison of before/after changes
 */

import { useState } from 'react';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

interface DiffViewerProps {
  original: Record<string, unknown>;
  modified: Record<string, unknown>;
  title?: string;
}

export default function DiffViewer({ original, modified, title }: DiffViewerProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleField = (field: string) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(field)) {
      newExpanded.delete(field);
    } else {
      newExpanded.add(field);
    }
    setExpandedFields(newExpanded);
  };

  const getChangedFields = () => {
    const allKeys = new Set([...Object.keys(original), ...Object.keys(modified)]);
    const changes: Array<{ field: string; type: 'added' | 'removed' | 'modified' | 'unchanged' }> = [];

    allKeys.forEach((key) => {
      const originalValue = original[key];
      const modifiedValue = modified[key];

      if (!(key in original)) {
        changes.push({ field: key, type: 'added' });
      } else if (!(key in modified)) {
        changes.push({ field: key, type: 'removed' });
      } else if (JSON.stringify(originalValue) !== JSON.stringify(modifiedValue)) {
        changes.push({ field: key, type: 'modified' });
      } else {
        changes.push({ field: key, type: 'unchanged' });
      }
    });

    return changes.sort((a, b) => {
      const order = { modified: 0, added: 1, removed: 2, unchanged: 3 };
      return order[a.type] - order[b.type];
    });
  };

  const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) {
      return 'null';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  const getFieldColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'border-green-500/50 bg-green-900/20';
      case 'removed':
        return 'border-red-500/50 bg-red-900/20';
      case 'modified':
        return 'border-yellow-500/50 bg-yellow-900/20';
      default:
        return 'border-arc-blue-lighter bg-arc-blue/30';
    }
  };

  const getFieldLabel = (type: string) => {
    switch (type) {
      case 'added':
        return <span className="text-green-400">+ Added</span>;
      case 'removed':
        return <span className="text-red-400">- Removed</span>;
      case 'modified':
        return <span className="text-yellow-400">~ Modified</span>;
      default:
        return <span className="text-arc-white/60">= Unchanged</span>;
    }
  };

  const changes = getChangedFields();
  const modifiedCount = changes.filter((c) => c.type === 'modified').length;
  const addedCount = changes.filter((c) => c.type === 'added').length;
  const removedCount = changes.filter((c) => c.type === 'removed').length;

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-white font-bold text-lg">{title}</h3>
      )}

      {/* Summary */}
      <div className="flex gap-4 text-sm">
        {modifiedCount > 0 && (
          <span className="text-yellow-400">
            {modifiedCount} modified
          </span>
        )}
        {addedCount > 0 && (
          <span className="text-green-400">
            {addedCount} added
          </span>
        )}
        {removedCount > 0 && (
          <span className="text-red-400">
            {removedCount} removed
          </span>
        )}
      </div>

      {/* Changed Fields */}
      <div className="space-y-2">
        {changes.map(({ field, type }) => {
          const isExpanded = expandedFields.has(field);
          const originalValue = original[field];
          const modifiedValue = modified[field];

          // Skip unchanged fields unless expanded
          if (type === 'unchanged' && !isExpanded) {
            return null;
          }

          return (
            <div
              key={field}
              className={`border rounded-lg overflow-hidden ${getFieldColor(type)}`}
            >
              <button
                onClick={() => toggleField(field)}
                className="w-full px-4 py-3 flex items-center justify-between transition-all cursor-pointer"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  <span className="text-white font-mono font-medium">{field}</span>
                  {getFieldLabel(type)}
                </div>
              </button>

              {isExpanded && (
                <div className="p-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Original Value */}
                    {type !== 'added' && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Original:</p>
                        <pre className="rounded p-3 text-white text-sm overflow-x-auto" style={{ backgroundColor: 'rgba(19, 9, 24, 0.5)', border: '1px solid #2d1f38' }}>
                          {renderValue(originalValue)}
                        </pre>
                      </div>
                    )}

                    {/* Modified Value */}
                    {type !== 'removed' && (
                      <div>
                        <p className="text-white/60 text-sm mb-2">Modified:</p>
                        <pre className="rounded p-3 text-white text-sm overflow-x-auto" style={{ backgroundColor: 'rgba(19, 9, 24, 0.5)', border: '1px solid #2d1f38' }}>
                          {renderValue(modifiedValue)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show unchanged fields toggle */}
      {changes.filter((c) => c.type === 'unchanged').length > 0 && (
        <button
          onClick={() => {
            const newExpanded = new Set(expandedFields);
            changes.filter((c) => c.type === 'unchanged').forEach((c) => {
              if (newExpanded.has(c.field)) {
                newExpanded.delete(c.field);
              } else {
                newExpanded.add(c.field);
              }
            });
            setExpandedFields(newExpanded);
          }}
          className="text-white/60 text-sm transition-all cursor-pointer"
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ffffff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
          }}
        >
          {expandedFields.size > 0 ? 'Hide' : 'Show'} {changes.filter((c) => c.type === 'unchanged').length} unchanged fields
        </button>
      )}
    </div>
  );
}
