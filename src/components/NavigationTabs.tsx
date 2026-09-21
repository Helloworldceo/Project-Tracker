import React from 'react';
import {
  LayoutDashboard,
  Kanban,
  ListTodo,
  Calendar,
  Flag,
  Users,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'board' | 'list' | 'calendar' | 'milestones' | 'team';

interface NavigationTabsProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  tasksCount: number;
  overdueCount: number;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onTabChange,
  tasksCount,
  overdueCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: overdueCount > 0 ? `${overdueCount} overdue` : null,
      badgeVariant: 'urgent',
    },
    {
      id: 'board' as ActiveTab,
      label: 'Board',
      icon: Kanban,
      badge: `${tasksCount}`,
      badgeVariant: 'neutral',
    },
    {
      id: 'list' as ActiveTab,
      label: 'List',
      icon: ListTodo,
      badge: null,
      badgeVariant: 'neutral',
    },
    {
      id: 'calendar' as ActiveTab,
      label: 'Calendar',
      icon: Calendar,
      badge: null,
      badgeVariant: 'neutral',
    },
    {
      id: 'milestones' as ActiveTab,
      label: 'Milestones',
      icon: Flag,
      badge: null,
      badgeVariant: 'neutral',
    },
    {
      id: 'team' as ActiveTab,
      label: 'Team Metrics',
      icon: Users,
      badge: null,
      badgeVariant: 'neutral',
    },
  ];

  return (
    <div className="border-b border-neutral-200 bg-neutral-50/70 dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 overflow-x-auto py-2" aria-label="Views">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs dark:bg-neutral-800 dark:text-indigo-400'
                    : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      tab.badgeVariant === 'urgent'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
