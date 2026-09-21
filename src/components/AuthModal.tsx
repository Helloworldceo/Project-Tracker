import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Lock,
  Mail,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User;
  onSelectUser: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onSelectUser,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Switch or create user
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      onSelectUser(existing);
      onClose();
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: customName.trim() || email.split('@')[0],
      email: email.trim(),
      role: 'Staff Engineer',
      avatarInitials: (customName || email).substring(0, 2).toUpperCase(),
      avatarColor: 'bg-indigo-600',
      department: 'Engineering',
      status: 'online',
    };
    onSelectUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
              Secure Team Authentication
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Zero-Trust workspace login & profile switcher
            </p>
          </div>
        </div>

        {/* Quick Switch Profiles */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-2">
            Switch Active Team Account
          </label>
          <div className="space-y-1.5">
            {users.map((user) => {
              const isCurrent = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between rounded-xl border p-2.5 transition text-left ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/50 dark:border-indigo-900 dark:bg-indigo-950/30'
                      : 'border-neutral-200 bg-white hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${user.avatarColor}`}
                    >
                      {user.avatarInitials}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-900 dark:text-white leading-tight">
                        {user.name}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {user.role} · {user.department}
                      </p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Active
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Or Sign in with custom credentials */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-neutral-400 dark:bg-neutral-900">
              Or Custom Account
            </span>
          </div>
        </div>

        <form onSubmit={handleCustomSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Jane Doe"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="developer@nexus-core.io"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 py-1.5 pl-8 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 py-1.5 pl-8 pr-3 text-xs focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="text-xs text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {isRegister ? 'Already have an account? Sign in' : 'New team member? Register'}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
            >
              <span>{isRegister ? 'Register' : 'Sign In'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
