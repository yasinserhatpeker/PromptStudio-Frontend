import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store';
import { promptApi, collectionApi } from '../services';
import { BookmarkModal } from './BookmarkModal';
import type { Prompt, PromptCollection } from '../types/api';

export function Dashboard() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const { logout, user } = useAuthStore();

  // Data state
  const [bookmarks, setBookmarks] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<PromptCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingBookmark, setEditingBookmark] = useState<Prompt | null>(null);
  const [autoFillData, setAutoFillData] = useState<{ title: string; url: string } | null>(null);

  // Load data on mount
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

    // Filter by folder
    if (selectedFolderId === 'uncategorized') {
      result = result.filter((b) => !b.collectionId);
    } else if (selectedFolderId) {
      result = result.filter((b) => b.collectionId === selectedFolderId);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (b) =>
          b.title?.toLowerCase().includes(query) ||
          b.content?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedFolderId, searchQuery, bookmarks]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleBookmarkThisChat = () => {
    // Auto-fill from current page
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
        const payload = {
          title: data.title,
          content: data.url,
          tags: null,
          userId: user.id,
          collectionId: data.collectionId,
        };
        console.log('🔖 [Dashboard] Creating bookmark with payload:', payload);

        const newBookmark = await promptApi.create(payload);
        setBookmarks((prev) => [newBookmark, ...prev]);
        showToast('Chat bookmarked!');
      } else if (editingBookmark) {
        const payload = {
          title: data.title,
          content: data.url,
          collectionId: data.collectionId,
        };
        console.log('🔖 [Dashboard] Updating bookmark:', editingBookmark.id, payload);

        const updated = await promptApi.update(editingBookmark.id, payload);
        setBookmarks((prev) =>
          prev.map((b) => (b.id === editingBookmark.id ? updated : b))
        );
        showToast('Bookmark updated!');
      }
    } catch (error) {
      console.error('🔖 [Dashboard] Save failed:', error);
      // Re-throw with the error message (already processed by promptApi)
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

  return (
    <div className="h-full flex flex-col bg-slate-950">
      {/* User Bar with Logout */}
      <div className="p-3 border-b border-slate-800 bg-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="text-sm text-slate-300 truncate max-w-[150px]">
            {user?.username || user?.email || 'User'}
          </span>
        </div>
        <button
          onClick={logout}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Folders */}
        <div className="w-1/4 min-w-[90px] bg-slate-900 border-r border-slate-800 flex flex-col">
          <div className="p-2 border-b border-slate-800">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Folders</span>
          </div>
          <nav className="flex-1 overflow-auto py-1">
            {/* All Chats */}
            <button
              onClick={() => setSelectedFolderId(null)}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                selectedFolderId === null
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              All Chats
            </button>

            {/* Uncategorized */}
            <button
              onClick={() => setSelectedFolderId('uncategorized')}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                selectedFolderId === 'uncategorized'
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              Uncategorized
            </button>

            {/* Dynamic Folders */}
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => setSelectedFolderId(folder.id)}
                className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                {folder.name || 'Unnamed'}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
          {/* Header with Search & Bookmark Button */}
          <div className="p-2 border-b border-slate-800 flex gap-2">
            {/* Search Bar */}
            <div className="relative flex-1">
              <svg
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats..."
                className="w-full pl-8 pr-2 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Bookmark This Chat Button */}
            <button
              onClick={handleBookmarkThisChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
              </svg>
              Bookmark
            </button>
          </div>

          {/* Bookmarks Grid */}
          <div className="flex-1 overflow-auto p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg
                  className="w-10 h-10 text-slate-700 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                  />
                </svg>
                <p className="text-slate-400 text-xs">No saved chats</p>
                <p className="text-slate-500 text-[10px] mt-1">Click "Bookmark" to save this chat</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {filteredBookmarks.map((bookmark) => (
                  <div
                    key={bookmark.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 transition-all hover:border-blue-500 hover:bg-slate-800 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="min-w-0 flex-1 cursor-pointer"
                        onClick={() => bookmark.content && handleNavigateToChat(bookmark.content)}
                      >
                        <h3 className="font-medium text-slate-100 text-xs truncate hover:text-blue-400 transition-colors">
                          {bookmark.title || 'Untitled Chat'}
                        </h3>
                        <p className="text-slate-500 text-[10px] mt-0.5 truncate">
                          {bookmark.content || 'No URL'}
                        </p>
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          <span className="px-1.5 py-0.5 bg-blue-900 text-blue-400 text-[9px] rounded">
                            {getFolderName(bookmark.collectionId)}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditBookmark(bookmark)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors"
                          title="Edit bookmark"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        {/* Open Link Button */}
                        <button
                          onClick={() => bookmark.content && handleNavigateToChat(bookmark.content)}
                          className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                          title="Open chat"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
          <p className="text-xs text-slate-200">{toast}</p>
        </div>
      )}

      {/* Bookmark Modal */}
      <BookmarkModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingBookmark(null);
          setAutoFillData(null);
        }}
        onSave={handleSaveBookmark}
        onDelete={modalMode === 'edit' ? handleDeleteBookmark : undefined}
        folders={folders}
        initialData={
          modalMode === 'edit' && editingBookmark
            ? {
                title: editingBookmark.title || '',
                url: editingBookmark.content || '',
                collectionId: editingBookmark.collectionId || null,
              }
            : autoFillData
            ? { ...autoFillData, collectionId: null }
            : { title: '', url: '', collectionId: null }
        }
        mode={modalMode}
      />
    </div>
  );
}

export default Dashboard;
