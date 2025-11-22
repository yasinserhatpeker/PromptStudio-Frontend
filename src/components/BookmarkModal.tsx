import { useState, useEffect } from 'react';
import type { PromptCollection } from '../types/api';

interface BookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { title: string; url: string; collectionId: string | null }) => Promise<void>;
  onDelete?: () => Promise<void>;
  folders: PromptCollection[];
  initialData?: {
    title: string;
    url: string;
    collectionId: string | null;
  };
  mode: 'create' | 'edit';
}

export function BookmarkModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  folders,
  initialData,
  mode,
}: BookmarkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title);
      setUrl(initialData.url);
      setCollectionId(initialData.collectionId);
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await onSave({ title, url, collectionId });
      onClose();
      setTitle('');
      setUrl('');
      setCollectionId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Solid opaque */}
      <div
        className="fixed inset-0 bg-slate-950 z-[10001]"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-[10002] p-4">
        <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h3 className="text-lg font-semibold text-white">
              {mode === 'create' ? 'Bookmark this Chat' : 'Edit Bookmark'}
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Chat Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="Enter chat title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Chat URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                placeholder="https://chatgpt.com/c/..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Save to Folder
              </label>
              <select
                value={collectionId || ''}
                onChange={(e) => setCollectionId(e.target.value || null)}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              >
                <option value="">No Folder (Uncategorized)</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name || 'Unnamed Folder'}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 bg-red-950 border border-red-900 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              {mode === 'edit' && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50 transition-all"
                >
                  Delete
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg disabled:opacity-50 transition-all"
              >
                {isLoading ? 'Saving...' : mode === 'create' ? 'Save Bookmark' : 'Update'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default BookmarkModal;
