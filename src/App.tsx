import React, { useState, useEffect, useCallback } from 'react';
import {
  Project,
  Task,
  User,
  Milestone,
  NotificationItem,
  UserSettings,
  SyncState,
  TaskStatus,
} from './types';
import {
  loadInitialProjectState,
  saveStoredTasks,
  saveStoredMilestones,
  saveSettingsToStorage,
  enqueueMutation,
  processOfflineQueue,
  checkAutomatedDeadlines,
  getPendingMutations,
} from './utils/storage';
import { computeKeyFingerprint } from './utils/crypto';
import { Header } from './components/Header';
import { NavigationTabs, ActiveTab } from './components/NavigationTabs';
import { DashboardView } from './components/DashboardView';
import { TaskBoardView } from './components/TaskBoardView';
import { TaskListView } from './components/TaskListView';
import { CalendarView } from './components/CalendarView';
import { MilestonesView } from './components/MilestonesView';
import { TeamMetricsView } from './components/TeamMetricsView';
import { TaskModal } from './components/TaskModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { EncryptionModal } from './components/EncryptionModal';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // 1. Initial State from persistent local storage
  const [initialData] = useState(() => loadInitialProjectState());

  const [project, setProject] = useState<Project>(initialData.project);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [milestones, setMilestones] = useState<Milestone[]>(initialData.milestones);
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [currentUser, setCurrentUser] = useState<User>(initialData.currentUser);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialData.notifications);
  const [settings, setSettings] = useState<UserSettings>(initialData.settings);
  const [syncState, setSyncState] = useState<SyncState>(initialData.syncState);
  const [e2eePassphrase, setE2eePassphrase] = useState<string>('NexusZeroTrust#2026!VaultKey');
  const [keyFingerprint, setKeyFingerprint] = useState<string>('7E4B-89A1-D42F');

  // Navigation & Search
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState<boolean>(false);
  const [taskModalInitialStatus, setTaskModalInitialStatus] = useState<TaskStatus>('todo');
  const [taskModalInitialDate, setTaskModalInitialDate] = useState<string | undefined>(undefined);

  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isEncryptionModalOpen, setIsEncryptionModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 2. Initialize Dark Mode on document root
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Compute key fingerprint whenever passphrase changes
  useEffect(() => {
    computeKeyFingerprint(e2eePassphrase).then((fp) => setKeyFingerprint(fp));
  }, [e2eePassphrase]);

  // 3. Online/Offline & SSE Real-time Synchronization
  const handleSyncQueue = useCallback(async () => {
    setSyncState((prev) => ({ ...prev, isSyncing: true }));
    const result = await processOfflineQueue();
    setSyncState((prev) => ({
      ...prev,
      isSyncing: false,
      isOnline: result.success,
      pendingMutationsCount: getPendingMutations().length,
      lastSyncedAt: result.success ? new Date().toISOString() : prev.lastSyncedAt,
    }));
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: true }));
      showToast('Back online! Cloud synchronization in progress...');
      handleSyncQueue();
    };

    const handleOffline = () => {
      setSyncState((prev) => ({ ...prev, isOnline: false }));
      showToast('Working offline. All mutations queued locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for pending mutations
    setSyncState((prev) => ({
      ...prev,
      pendingMutationsCount: getPendingMutations().length,
    }));

    // Server-Sent Events (SSE) for Real-Time cloud collaboration
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');
      eventSource.onopen = () => {
        setSyncState((prev) => ({ ...prev, isOnline: true }));
      };
      eventSource.onerror = () => {
        // SSE disconnected, fallback gracefully
      };
      eventSource.addEventListener('state_update', (event) => {
        try {
          const cloudState = JSON.parse(event.data);
          if (cloudState.project) {
            setProject(cloudState.project);
          }
          if (cloudState.tasks) {
            setTasks(cloudState.tasks);
            saveStoredTasks(cloudState.tasks);
          }
          if (cloudState.milestones) {
            setMilestones(cloudState.milestones);
            saveStoredMilestones(cloudState.milestones);
          }
          if (cloudState.users) {
            setUsers(cloudState.users);
          }
        } catch (e) {
          console.error('Failed to parse SSE cloud state:', e);
        }
      });
    } catch (e) {
      console.warn('SSE connection could not be established; running local sync.');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (eventSource) eventSource.close();
    };
  }, [handleSyncQueue]);

  // 4. Automated Status Updates & Deadline Reminders loop
  useEffect(() => {
    const runAutomationCheck = () => {
      const { updatedTasks, newNotifications } = checkAutomatedDeadlines(
        tasks,
        settings,
        notifications
      );

      if (newNotifications.length > notifications.length) {
        setNotifications(newNotifications);
        const latest = newNotifications[0];
        if (latest) {
          showToast(`⚠️ ${latest.title}: ${latest.message}`);
        }
      }

      let hasChange = false;
      const mergedTasks = tasks.map((t) => {
        const match = updatedTasks.find((u) => u.id === t.id);
        if (match && match.status !== t.status) {
          hasChange = true;
          return match;
        }
        return t;
      });

      if (hasChange) {
        setTasks(mergedTasks);
        saveStoredTasks(mergedTasks);
      }
    };

    runAutomationCheck();
    const interval = setInterval(runAutomationCheck, 30000);
    return () => clearInterval(interval);
  }, [tasks, settings, notifications]);

  // 5. Task Handlers
  const handleSaveTask = (task: Task) => {
    const existingIndex = tasks.findIndex((t) => t.id === task.id);
    let updatedTasks: Task[];
    const isCompletedNow = task.status === 'completed';
    const wasCompleted = existingIndex >= 0 ? tasks[existingIndex].status === 'completed' : false;

    if (existingIndex >= 0) {
      updatedTasks = [...tasks];
      updatedTasks[existingIndex] = task;
    } else {
      updatedTasks = [task, ...tasks];
    }

    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);

    enqueueMutation({
      type: existingIndex >= 0 ? 'UPDATE_TASK' : 'CREATE_TASK',
      payload: task,
    });
    setSyncState((prev) => ({
      ...prev,
      pendingMutationsCount: prev.pendingMutationsCount + 1,
    }));

    if (isCompletedNow && !wasCompleted && settings.notifyTaskCompleted) {
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        taskId: task.id,
        title: 'Task Completed! 🎉',
        message: `"${task.title}" has been completed by ${currentUser.name}.`,
        type: 'task_completed',
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications([newNotif, ...notifications]);
      showToast(`Completed: "${task.title}"`);
    } else {
      showToast(existingIndex >= 0 ? 'Task updated' : 'Task created');
    }

    handleSyncQueue();
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    setTasks(updatedTasks);
    saveStoredTasks(updatedTasks);

    enqueueMutation({
      type: 'DELETE_TASK',
      payload: { id: taskId },
    });
    setSyncState((prev) => ({
      ...prev,
      pendingMutationsCount: prev.pendingMutationsCount + 1,
    }));

    showToast('Task deleted');
    handleSyncQueue();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const isNowCompleted = newStatus === 'completed';

    const updatedTask: Task = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      completedAt: isNowCompleted ? (task.completedAt || new Date().toISOString()) : undefined,
      activityLog: [
        ...(task.activityLog || []),
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          action: `Changed status to "${newStatus}"`,
          type: 'status_change',
        },
      ],
    };

    handleSaveTask(updatedTask);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !task.subtasks) return;

    const updatedSubtasks = task.subtasks.map((s) =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );

    const allCompleted = updatedSubtasks.every((s) => s.completed);

    const updatedTask: Task = {
      ...task,
      subtasks: updatedSubtasks,
      status: allCompleted && (task.status === 'todo' || task.status === 'in-progress')
        ? 'in-review'
        : task.status,
      updatedAt: new Date().toISOString(),
    };

    handleSaveTask(updatedTask);
  };

  const handleReassignTask = (taskId: string, newAssigneeId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const targetUser = users.find((u) => u.id === newAssigneeId);

    const updatedTask: Task = {
      ...task,
      assigneeIds: [newAssigneeId],
      updatedAt: new Date().toISOString(),
      activityLog: [
        ...(task.activityLog || []),
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: currentUser.name,
          action: `Reassigned task to ${targetUser?.name || 'teammate'}`,
          type: 'assignment',
        },
      ],
    };

    handleSaveTask(updatedTask);
  };

  const handleAddMilestone = (newM: Omit<Milestone, 'id'>) => {
    const created: Milestone = {
      ...newM,
      id: `m-${Date.now()}`,
    };
    const updatedMilestones = [...milestones, created];
    setMilestones(updatedMilestones);
    saveStoredMilestones(updatedMilestones);
    showToast(`Milestone "${created.title}" created!`);
  };

  const openNewTaskModal = (status: TaskStatus = 'todo', dateString?: string) => {
    setSelectedTask(null);
    setTaskModalInitialStatus(status);
    setTaskModalInitialDate(dateString);
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettingsToStorage(newSettings);
    showToast('Preferences updated');
  };

  const handleMarkAllNotificationsRead = () => {
    const read = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(read);
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSelectTaskById = (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (target) {
      setSelectedTask(target);
      setIsTaskModalOpen(true);
    }
  };

  const overdueTasksCount = tasks.filter(
    (t) => t.status !== 'completed' && new Date(t.dueDate).getTime() < new Date('2026-09-21').getTime()
  ).length;

  return (
    <div
      id="nexus-project-tracker-root"
      className="min-h-screen bg-neutral-100 text-neutral-900 transition-colors duration-200 dark:bg-neutral-950 dark:text-neutral-100 font-sans flex flex-col"
    >
      {/* Top Application Header */}
      <Header
        project={project}
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={setCurrentUser}
        syncState={syncState}
        onManualSync={handleSyncQueue}
        unreadNotifsCount={notifications.filter((n) => !n.read).length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenNewTask={() => openNewTaskModal('todo')}
        onOpenEncryptionModal={() => setIsEncryptionModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        darkMode={settings.darkMode}
        onToggleDarkMode={() => handleSaveSettings({ ...settings, darkMode: !settings.darkMode })}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        keyFingerprint={keyFingerprint}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 flex flex-col">
        {/* Navigation Tabs */}
        <NavigationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tasksCount={tasks.length}
          overdueCount={overdueTasksCount}
        />

        {/* View Switcher */}
        <div className="flex-1 mt-2">
          {activeTab === 'dashboard' && (
            <DashboardView
              project={project}
              tasks={tasks}
              milestones={milestones}
              users={users}
              onSelectTask={openEditTaskModal}
              onNavigateTab={setActiveTab}
              onNewTask={() => openNewTaskModal('todo')}
              darkMode={settings.darkMode}
            />
          )}

          {activeTab === 'board' && (
            <TaskBoardView
              tasks={tasks}
              users={users}
              milestones={milestones}
              currentUser={currentUser}
              onSelectTask={openEditTaskModal}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onToggleSubtask={handleToggleSubtask}
              onNewTaskWithStatus={(status) => openNewTaskModal(status)}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'list' && (
            <TaskListView
              tasks={tasks}
              users={users}
              onSelectTask={openEditTaskModal}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onNewTask={() => openNewTaskModal('todo')}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              tasks={tasks}
              users={users}
              milestones={milestones}
              onSelectTask={openEditTaskModal}
              onNewTaskWithDate={(dateStr) => openNewTaskModal('todo', dateStr)}
            />
          )}

          {activeTab === 'milestones' && (
            <MilestonesView
              milestones={milestones}
              tasks={tasks}
              users={users}
              onSelectTask={openEditTaskModal}
              onAddMilestone={handleAddMilestone}
            />
          )}

          {activeTab === 'team' && (
            <TeamMetricsView
              users={users}
              tasks={tasks}
              onSelectTask={openEditTaskModal}
              onReassignTask={handleReassignTask}
            />
          )}
        </div>
      </main>

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        users={users}
        milestones={milestones}
        currentUser={currentUser}
        e2eePassphrase={e2eePassphrase}
        initialStatus={taskModalInitialStatus}
        initialDate={taskModalInitialDate}
      />

      {/* Notifications Drawer */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
        onClearAll={handleClearAllNotifications}
        onSelectTaskById={handleSelectTaskById}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />

      {/* Zero-Knowledge E2EE Encryption Modal */}
      <EncryptionModal
        isOpen={isEncryptionModalOpen}
        onClose={() => setIsEncryptionModalOpen(false)}
        passphrase={e2eePassphrase}
        onSavePassphrase={setE2eePassphrase}
        keyFingerprint={keyFingerprint}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        syncState={syncState}
        onForceSync={handleSyncQueue}
        onClearOfflineQueue={() => {
          localStorage.removeItem('nexus_mutation_queue_v1');
          setSyncState((prev) => ({ ...prev, pendingMutationsCount: 0 }));
          showToast('Offline mutation queue cleared');
        }}
      />

      {/* User Onboarding Tutorial */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />

      {/* Authentication & Profile Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        users={users}
        currentUser={currentUser}
        onSelectUser={(u) => {
          setCurrentUser(u);
          showToast(`Switched user profile to ${u.name}`);
        }}
      />

      {/* Floating Global Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom-5 duration-200 dark:border-neutral-700 dark:bg-neutral-800"
        >
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
