import { useState, useEffect } from 'react';
import type { PromptCollection } from '../types/api';

// Gemini Dark Theme Colors
const COLORS = {
  background: '#131314',
  surface: '#1E1F20',
  input: '#282A2C',
  textPrimary: '#E3E3E3',
  textSecondary: '#C4C7C5',
  accent: '#A8C7FA',
  border: '#444746',
  buttonPrimary: '#8AB4F8',
  buttonPrimaryText: '#041E49',
  error: '#F2B8B5',
  errorBg: '#8C1D18',
  danger: '#EA4335',
  dangerHover: '#C5221F',
};

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
  defaultCollectionId?: string | null;
}

export function BookmarkModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  folders,
  initialData,
  mode,
  defaultCollectionId,
}: BookmarkModalProps) {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log('📋 [BookmarkModal] Opening with defaultCollectionId:', defaultCollectionId);
      if (initialData) {
        console.log('📋 [BookmarkModal] Using initialData:', initialData);
        setTitle(initialData.title);
        setUrl(initialData.url);
        setCollectionId(initialData.collectionId);
      } else {
        // Auto-fill with current page info for new bookmarks
        const currentUrl = window.location.href;
        const currentTitle = document.title.replace(' | ChatGPT', '').replace('ChatGPT - ', '');
        setTitle(currentTitle);
        setUrl(currentUrl);

        // Use defaultCollectionId (could be null for uncategorized)
        if (defaultCollectionId !== undefined) {
          console.log('📋 [BookmarkModal] Setting collectionId to defaultCollectionId:', defaultCollectionId);
          setCollectionId(defaultCollectionId);
        } else {
          console.log('📋 [BookmarkModal] defaultCollectionId is undefined, setting to null');
          setCollectionId(null);
        }
      }
      setShowDeleteConfirm(false);
    }
  }, [isOpen, initialData, defaultCollectionId, folders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    console.log('📋 [BookmarkModal] Submitting with collectionId:', collectionId);

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

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    setError(null);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete bookmark');
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (!isOpen) return null;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 16px',
    backgroundColor: COLORS.input,
    border: 'none',
    borderRadius: '24px',
    color: COLORS.textPrimary,
    fontSize: '14px',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 500,
    color: COLORS.textSecondary,
    marginBottom: '8px',
    paddingLeft: '4px',
  };

  return (
    <>
      {/* Backdrop - Solid opaque */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          zIndex: 10001,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10002,
          padding: '16px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '380px',
            backgroundColor: COLORS.surface,
            borderRadius: '24px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            <h3
              style={{
                fontSize: '18px',
                fontWeight: 500,
                color: COLORS.textPrimary,
                margin: 0,
              }}
            >
              {mode === 'create' ? 'Bookmark this Chat' : 'Edit Bookmark'}
            </h3>
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                color: COLORS.textSecondary,
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            style={{
              padding: '20px 24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>
              <label style={labelStyle}>Chat Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                placeholder="Enter chat title"
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Chat URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ ...inputStyle, fontSize: '13px' }}
                placeholder="https://chatgpt.com/c/..."
                required
              />
            </div>

            <div>
              <label style={labelStyle}>Save to Folder</label>
              <select
                value={collectionId ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setCollectionId(value === '' ? null : value);
                }}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23C4C7C5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '16px',
                  paddingRight: '44px',
                }}
              >
                <option value="">Uncategorized</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name || 'Unnamed Folder'}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: COLORS.errorBg,
                  borderRadius: '12px',
                }}
              >
                <p style={{ fontSize: '13px', color: COLORS.error, margin: 0 }}>{error}</p>
              </div>
            )}

            {showDeleteConfirm ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: 'rgba(234, 67, 53, 0.1)',
                    borderRadius: '12px',
                    border: `1px solid ${COLORS.danger}`,
                  }}
                >
                  <p style={{ fontSize: '14px', color: COLORS.error, margin: 0, fontWeight: 500 }}>
                    Are you sure you want to delete this bookmark?
                  </p>
                  <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: '4px 0 0', opacity: 0.8 }}>
                    This action cannot be undone.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={handleDeleteCancel}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      backgroundColor: COLORS.input,
                      color: COLORS.textPrimary,
                      border: 'none',
                      borderRadius: '24px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: '12px 18px',
                      backgroundColor: COLORS.danger,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '24px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    {isLoading ? 'Deleting...' : 'Delete Bookmark'}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                {mode === 'edit' && onDelete && (
                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    disabled={isLoading}
                    style={{
                      padding: '12px 18px',
                      backgroundColor: COLORS.danger,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '24px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      opacity: isLoading ? 0.5 : 1,
                      transition: 'background-color 0.2s',
                    }}
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    backgroundColor: COLORS.input,
                    color: COLORS.textPrimary,
                    border: 'none',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  style={{
                    flex: 1,
                    padding: '12px 18px',
                    backgroundColor: COLORS.buttonPrimary,
                    color: COLORS.buttonPrimaryText,
                    border: 'none',
                    borderRadius: '24px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.5 : 1,
                    transition: 'background-color 0.2s',
                  }}
                >
                  {isLoading ? 'Saving...' : mode === 'create' ? 'Save Bookmark' : 'Update'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}

export default BookmarkModal;
