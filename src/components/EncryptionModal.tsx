import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Key,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  Terminal,
} from 'lucide-react';
import { encryptText, decryptText, computeKeyFingerprint } from '../utils/crypto';

interface EncryptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  passphrase: string;
  onSavePassphrase: (newPassphrase: string) => void;
  keyFingerprint: string;
}

export const EncryptionModal: React.FC<EncryptionModalProps> = ({
  isOpen,
  onClose,
  passphrase,
  onSavePassphrase,
  keyFingerprint,
}) => {
  const [currentPass, setCurrentPass] = useState(passphrase);
  const [showPass, setShowPass] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Live Crypto Playground
  const [testPlain, setTestPlain] = useState('Confidential architecture specs and client credentials');
  const [testCipher, setTestCipher] = useState<any>(null);
  const [testDecrypted, setTestDecrypted] = useState<string>('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSavePassphrase(currentPass);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleTestEncrypt = async () => {
    try {
      const res = await encryptText(testPlain, currentPass);
      setTestCipher(res);
      const dec = await decryptText(res, currentPass);
      setTestDecrypted(dec);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Zero-Knowledge End-to-End Encryption (E2EE)
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                AES-GCM 256-Bit Military-Grade Client Vault
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4">
          {/* Key Fingerprint banner */}
          <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-950 dark:bg-indigo-950/40">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                Cryptographic Key Fingerprint
              </span>
              <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                {keyFingerprint}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Vault Active
            </div>
          </div>

          {/* Passphrase Manager */}
          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
                Project Master Passphrase (PBKDF2 Key Derivation)
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full rounded-lg border border-neutral-300 py-2 pl-3 pr-10 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                This key is never sent to the server. Data is encrypted in your browser before cloud transmission.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2">
              {isSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Key Saved!
                </span>
              )}
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                Update Vault Key
              </button>
            </div>
          </form>

          {/* Security architecture highlights */}
          <div className="rounded-lg bg-neutral-50 p-3 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-300 space-y-1">
            <p className="font-semibold text-neutral-900 dark:text-white">Security Guarantees:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li><strong>Zero-Knowledge:</strong> Server administrators cannot read encrypted task content.</li>
              <li><strong>PBKDF2-SHA256:</strong> 100,000 salt iterations protect against rainbow table attacks.</li>
              <li><strong>AES-GCM Authenticated:</strong> 128-bit authentication tags prevent bit-flipping tampering.</li>
            </ul>
          </div>

          {/* Real-time Crypto Scratchpad Test */}
          <div className="border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                Live Encryption Test Scratchpad
              </span>
              <button
                type="button"
                onClick={handleTestEncrypt}
                className="rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-indigo-400"
              >
                Run Test Encryption
              </button>
            </div>

            <input
              type="text"
              value={testPlain}
              onChange={(e) => setTestPlain(e.target.value)}
              placeholder="Type test text..."
              className="w-full rounded-md border border-neutral-200 p-2 text-xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
            />

            {testCipher && (
              <div className="mt-2 rounded-lg bg-neutral-900 p-2.5 font-mono text-[10px] text-emerald-400 space-y-1">
                <p className="text-neutral-400 truncate">Ciphertext: {testCipher.cipher.substring(0, 32)}...</p>
                <p className="text-neutral-400">IV: {testCipher.iv} | Salt: {testCipher.salt.substring(0, 12)}...</p>
                <p className="text-emerald-300 font-semibold">Decrypted verification: &quot;{testDecrypted}&quot;</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-neutral-100 px-4 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
