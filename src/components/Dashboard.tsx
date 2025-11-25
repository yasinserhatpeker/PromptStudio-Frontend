import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store';
import { promptApi, collectionApi } from '../services';
import { BookmarkModal } from './BookmarkModal';
import type { Prompt, PromptCollection } from '../types/api';

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
};

export function Dashboard() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { logout, user } = useAuthStore();

  const [bookmarks, setBookmarks] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<PromptCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBookmark, setEditingBookmark] = useState<Prompt | null>(null);
  const [autoFillData, setAutoFillData] = useState<{ title: string; url: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookmarksData, foldersData] = await Promise.all([
        promptApi.getMyPrompts(),
        collectionApi.getMyCollections(),
      ]);
      setBookmarks(bookmarksData);
      setFolders(foldersData);
    } catch (err) {
      showToast('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBookmarks = useMemo(() => {
    let result = bookmarks;
    if (selectedFolderId === 'uncategorized') {
      result = result.filter((b) => !b.collectionId);
    } else if (selectedFolderId) {
      result = result.filter((b) => b.collectionId === selectedFolderId);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.title?.toLowerCase().includes(query) || b.content?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [selectedFolderId, searchQuery, bookmarks]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookmarkThisChat = () => {
    const currentUrl = window.location.href;
    const currentTitle = document.title.replace(' | ChatGPT', '').replace('ChatGPT - ', '');
    setAutoFillData({ title: currentTitle, url: currentUrl });
    setModalMode('create');
    setEditingBookmark(null);
    setModalOpen(true);
  };

  const handleEditBookmark = (bookmark: Prompt) => {
    setEditingBookmark(bookmark);
    setAutoFillData(null);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleNavigateToChat = (url: string) => {
    window.location.href = url;
  };

  const handleSaveBookmark = async (data: { title: string; url: string; collectionId: string | null }) => {
    console.log('🔖 [Dashboard] handleSaveBookmark called:', { data, user, modalMode });
    if (!user) {
      console.error('🔖 [Dashboard] No user object available');
      throw new Error('User not loaded. Please refresh and try again.');
    }
    if (!user.id) {
      console.error('🔖 [Dashboard] User object missing ID:', user);
      throw new Error('User ID not available. Please log out and log in again.');
    }
    try {
      if (modalMode === 'create') {
        const payload = { title: data.title, content: data.url, tags: null, userId: user.id, collectionId: data.collectionId };
        const newBookmark = await promptApi.create(payload);
        setBookmarks((prev) => [newBookmark, ...prev]);
        showToast('Chat bookmarked!');
      } else if (editingBookmark) {
        const payload = { title: data.title, content: data.url, collectionId: data.collectionId };
        const updated = await promptApi.update(editingBookmark.id, payload);
        setBookmarks((prev) => prev.map((b) => (b.id === editingBookmark.id ? updated : b)));
        showToast('Bookmark updated!');
      }
    } catch (error) {
      console.error('🔖 [Dashboard] Save failed:', error);
      throw error;
    }
  };

  const handleDeleteBookmark = async () => {
    if (!editingBookmark) return;
    await promptApi.delete(editingBookmark.id);
    setBookmarks((prev) => prev.filter((b) => b.id !== editingBookmark.id));
    showToast('Bookmark deleted!');
  };

  const getFolderName = (collectionId: string | null | undefined) => {
    if (!collectionId) return 'Uncategorized';
    const folder = folders.find((f) => f.id === collectionId);
    return folder?.name || 'Unknown';
  };

  const sidebarButtonStyle = (isActive: boolean): React.CSSProperties => ({
    width: '100%',
    textAlign: 'left',
    padding: '10px 16px',
    fontSize: '13px',
    color: isActive ? COLORS.accent : COLORS.textSecondary,
    backgroundColor: isActive ? COLORS.surface : 'transparent',
    border: 'none',
    borderRadius: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: isActive ? 500 : 400,
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: COLORS.background }}>
      {/* User Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${COLORS.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: COLORS.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: COLORS.buttonPrimaryText,
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: '13px', color: COLORS.textPrimary, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.username || user?.email || 'User'}
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            fontSize: '12px',
            backgroundColor: COLORS.surface,
            color: COLORS.textSecondary,
            padding: '8px 14px',
            borderRadius: '20px',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background-color 0.2s',
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ width: '140px', minWidth: '140px', padding: '12px 8px', borderRight: `1px solid ${COLORS.border}`, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, color: COLORS.textSecondary, padding: '8px 16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Folders</p>
          <button onClick={() => setSelectedFolderId(null)} style={sidebarButtonStyle(selectedFolderId === null)}>All Chats</button>
          <button onClick={() => setSelectedFolderId('uncategorized')} style={sidebarButtonStyle(selectedFolderId === 'uncategorized')}>Uncategorized</button>
          {folders.map((folder) => (
            <button key={folder.id} onClick={() => setSelectedFolderId(folder.id)} style={sidebarButtonStyle(selectedFolderId === folder.id)}>
              {folder.name || 'Unnamed'}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Search & Bookmark Header */}
          <div style={{ padding: '12px 16px', display: 'flex', gap: '10px', borderBottom: `1px solid ${COLORS.border}` }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <svg style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: COLORS.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                style={{
                  width: '100%',
                  padding: '10px 14px 10px 42px',
                  backgroundColor: COLORS.input,
                  border: 'none',
                  borderRadius: '24px',
                  color: COLORS.textPrimary,
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>
            <button
              onClick={handleBookmarkThisChat}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                backgroundColor: COLORS.buttonPrimary,
                color: COLORS.buttonPrimaryText,
                border: 'none',
                borderRadius: '24px',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              Bookmark
            </button>
          </div>

          {/* Bookmarks List */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div style={{ width: '24px', height: '24px', border: `3px solid ${COLORS.surface}`, borderTopColor: COLORS.accent, borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center' }}>
                <svg style={{ width: '48px', height: '48px', color: COLORS.border, marginBottom: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <p style={{ color: COLORS.textSecondary, fontSize: '14px', margin: 0 }}>No saved chats</p>
                <p style={{ color: COLORS.textSecondary, fontSize: '12px', marginTop: '4px', opacity: 0.7 }}>Click "Bookmark" to save this chat</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    style={{
                      backgroundColor: COLORS.surface,
                      borderRadius: '16px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onClick={() => bookmark.content && handleNavigateToChat(bookmark.content)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 500, color: COLORS.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bookmark.title || 'Untitled Chat'}
                        </h3>
                        <p style={{ fontSize: '12px', color: COLORS.textSecondary, margin: '4px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bookmark.content || 'No URL'}
                        </p>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            padding: '4px 10px',
                            backgroundColor: COLORS.input,
                            color: COLORS.accent,
                            fontSize: '11px',
                            borderRadius: '12px',
                          }}
                        >
                          {getFolderName(bookmark.collectionId)}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditBookmark(bookmark); }}
                        style={{
                          padding: '8px',
                          backgroundColor: 'transparent',
                          border: 'none',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          color: COLORS.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', padding: '10px 20px', backgroundColor: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: '24px' }}>
          <p style={{ fontSize: '13px', color: COLORS.textPrimary, margin: 0 }}>{toast}</p>
        </div>
      )}

      {/* Modal */}
      <BookmarkModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingBookmark(null); setAutoFillData(null); }}
        onSave={handleSaveBookmark}
        onDelete={modalMode === 'edit' ? handleDeleteBookmark : undefined}
        folders={folders}
        initialData={
          modalMode === 'edit' && editingBookmark
            ? { title: editingBookmark.title || '', url: editingBookmark.content || '', collectionId: editingBookmark.collectionId || null }
            : autoFillData ? { ...autoFillData, collectionId: null } : { title: '', url: '', collectionId: null }
        }
        mode={modalMode}
      />
    </div>
  );
}

export default Dashboard;
