import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cloud,
  CloudOff,
  RefreshCw,
  Bell,
  Search,
  Plus,
  Moon,
  Sun,
  HelpCircle,
  Settings,
  Wifi,
  WifiOff,
  Gauge,
  CheckCircle2,
} from 'lucide-react';
import { User, Project, SyncState, NotificationItem } from '../types';

interface HeaderProps {
  project: Project;
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  syncState: SyncState;
  onManualSync: () => void;
  unreadNotifsCount: number;
  onOpenNotifications: () => void;
  onOpenNewTask: () => void;
  onOpenEncryptionModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenOnboarding: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  keyFingerprint: string;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  currentUser,
  allUsers,
  onSelectUser,
  syncState,
  onManualSync,
  unreadNotifsCount,
  onOpenNotifications,
  onOpenNewTask,
  onOpenEncryptionModal,
  onOpenSettingsModal,
  onOpenOnboarding,
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  keyFingerprint,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/90 transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand and Project selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-sm">
              <span className="text-base font-mono">PT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-neutral-900 dark:text-white">
                  Project Tracker
                </span>
                <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
                  {project.key}
                </span>
              </div>
              <p className="hidden text-xs text-neutral-500 sm:block dark:text-neutral-400 truncate max-w-[220px]">
                {project.name}
              </p>
            </div>
          </div>
        </div>

        {/* Middle: Search input */}
        <div className="hidden flex-1 max-w-md mx-6 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search tasks, tags, assignees..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 bg-neutral-50 py-1.5 pl-9 pr-3 text-sm text-neutral-900 placeholder-neutral-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-100 dark:placeholder-neutral-500"
              aria-label="Search tasks"
            />
          </div>
        </div>

        {/* Right: Actions, Badges, Tools, User menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Cloud Sync Status Badge */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={onManualSync}
              disabled={syncState.isSyncing}
              title={`Sync status: ${syncState.isOnline ? 'Online' : 'Offline'}. Click to synchronize.`}
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border ${
                !syncState.isOnline
                  ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                  : syncState.pendingMutationsCount > 0
                  ? 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
              }`}
            >
              {syncState.isSyncing ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : !syncState.isOnline ? (
                <CloudOff className="h-3.5 w-3.5" />
              ) : (
                <Cloud className="h-3.5 w-3.5" />
              )}
              <span>
                {syncState.isSyncing
                  ? 'Syncing...'
                  : !syncState.isOnline
                  ? `Offline (${syncState.pendingMutationsCount} queued)`
                  : syncState.pendingMutationsCount > 0
                  ? `${syncState.pendingMutationsCount} pending sync`
                  : 'Cloud Synced'}
              </span>
            </button>
          </div>

          {/* Low Bandwidth Indicator */}
          {syncState.bandwidthMode === 'low' && (
            <div
              title="Low-Bandwidth Mode Active: Compact delta payload transmission"
              className="hidden lg:flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300"
            >
              <Gauge className="h-3 w-3" />
              <span>Low-Bandwidth</span>
            </div>
          )}

          {/* E2EE Security Vault Badge */}
          <button
            onClick={onOpenEncryptionModal}
            className="flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300"
            title="End-to-End Encryption status: AES-GCM 256. Click to manage security vault."
          >
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden md:inline">E2EE:</span>
            <span className="font-mono text-[11px]">{keyFingerprint}</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 active:scale-95"
            aria-label="Create new task"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>

          {/* Notifications button with unread badge */}
          <button
            onClick={onOpenNotifications}
            className="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            aria-label={`Notifications (${unreadNotifsCount} unread)`}
          >
            <Bell className="h-4 w-4" />
            {unreadNotifsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white shadow">
                {unreadNotifsCount > 9 ? '9+' : unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Onboarding Tour Button */}
          <button
            onClick={onOpenOnboarding}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            aria-label="User onboarding tutorial"
            title="App Tutorial & Guided Tour"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Settings button */}
          <button
            onClick={onOpenSettingsModal}
            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
            aria-label="App settings"
            title="Preferences & Settings"
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Current User avatar and dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 rounded-full p-0.5 ring-1 ring-neutral-300 hover:ring-indigo-500 dark:ring-neutral-700 transition"
              aria-label="User profile and role switcher"
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ${currentUser.avatarColor}`}
              >
                {currentUser.avatarInitials}
              </div>
            </button>

            {showUserDropdown && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-800 dark:bg-neutral-900 z-50 animate-in fade-in zoom-in-95 duration-100"
                role="menu"
              >
                <div className="border-b border-neutral-100 px-3 py-2 dark:border-neutral-800">
                  <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                    {currentUser.name}
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                    {currentUser.email}
                  </p>
                  <p className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                    {currentUser.role}
                  </p>
                </div>

                <div className="pt-2">
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                    Switch Active User (Collaboration)
                  </p>
                  {allUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        onSelectUser(u);
                        setShowUserDropdown(false);
                      }}
                      className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                        u.id === currentUser.id
                          ? 'bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                          : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold text-white ${u.avatarColor}`}
                      >
                        {u.avatarInitials}
                      </div>
                      <div className="flex-1 truncate">
                        <p className="truncate leading-tight">{u.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate leading-tight">
                          {u.role}
                        </p>
                      </div>
                      {u.id === currentUser.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
