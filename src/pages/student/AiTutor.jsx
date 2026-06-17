import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import remarkGfm from 'remark-gfm';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MainLayout from '../../layouts/MainLayout';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api/v1';

function getToken() {
  return localStorage.getItem('access_token') || '';
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function truncateText(text, maxLength = 60) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Skeleton Components
function Skeleton({ className = "" }) {
  return <div className={`animate-pulse bg-gray-200 rounded-md ${className}`} />;
}

function AiTutorSkeleton() {
  return (
    <MainLayout title="Student Portal">
      <div className="p-2 md:p-3 h-[calc(100vh-80px)] flex flex-col gap-2 overflow-hidden">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <Skeleton className="w-40 md:w-56 h-6 md:h-7 mb-1" />
            <Skeleton className="w-48 md:w-72 h-3 md:h-4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="w-16 md:w-20 h-7 md:h-8 rounded-md" />
            <Skeleton className="w-24 md:w-28 h-7 md:h-8 rounded-md" />
          </div>
        </div>
        <div className="flex-1 flex gap-2 overflow-hidden">
          <Skeleton className="hidden lg:block lg:w-64 rounded-xl" />
          <div className="flex-1 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">
            <div className="p-3 border-b flex items-center justify-between">
              <Skeleton className="w-32 h-5" />
              <Skeleton className="w-24 h-8 rounded-full" />
            </div>
            <div className="flex-1 p-4 space-y-4">
              <div className="flex justify-start gap-2">
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className="w-64 h-20 rounded-xl" />
              </div>
              <div className="flex justify-end gap-2">
                <Skeleton className="w-48 h-16 rounded-xl" />
              </div>
            </div>
            <div className="p-3 border-t">
              <Skeleton className="w-full h-10 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function NewConvModal({ onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [classLevel, setClassLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!title.trim()) { setError('Title is required'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ title: title.trim(), subject: subject.trim(), class_level: classLevel.trim() }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (!res.ok) { const d = await res.json(); setError(d.detail || 'Failed to create'); return; }
      const conv = await res.json();
      onCreate(conv);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-on-surface">New Session</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-container-low">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {error && <p className="text-xs text-red-500 bg-red-50 rounded-md px-3 py-2 mb-3">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Session Title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. Quantum Mechanics Help"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="e.g. Physics"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Class Level</label>
            <input
              value={classLevel}
              onChange={e => setClassLevel(e.target.value)}
              placeholder="e.g. Grade 10"
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border text-sm font-medium hover:bg-surface-container-low">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-gradient-to-br from-primary to-primary-container text-white text-sm font-semibold shadow-md disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Start Session'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-5">
        <p className="text-sm text-on-surface leading-relaxed mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-lg border text-sm font-medium hover:bg-surface-container-low">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}

function TrashView({ onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [emptyingAll, setEmptyingAll] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/trash/`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      setItems(data.results || data);
    } catch { }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function restore(id) {
    await fetch(`${API_BASE}/tutor/conversations/${id}/restore/`, { method: 'POST', headers: authHeaders() });
    setItems(prev => prev.filter(i => i.id !== id));
  }

  async function permDelete(id) {
    await fetch(`${API_BASE}/tutor/conversations/${id}/permanent-delete/`, { method: 'DELETE', headers: authHeaders() });
    setItems(prev => prev.filter(i => i.id !== id));
    setConfirm(null);
  }

  async function emptyTrash() {
    setEmptyingAll(true);
    await fetch(`${API_BASE}/tutor/conversations/empty-trash/`, { method: 'DELETE', headers: authHeaders() });
    setItems([]);
    setConfirm(null);
    setEmptyingAll(false);
  }

  return (
    <div className="p-4 md:p-6 flex-1 flex flex-col gap-4">
      {confirm && (
        <ConfirmDialog
          message={confirm.type === 'all'
            ? `Empty Trash? This will permanently delete all ${items.length} conversations and cannot be undone.`
            : "This will permanently delete this conversation and cannot be undone."}
          onConfirm={() => confirm.type === 'all' ? emptyTrash() : permDelete(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-surface-container-low">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h2 className="text-xl font-bold text-on-surface">Trash</h2>
            <p className="text-xs text-on-surface-variant">Items may be permanently deleted after 30 days</p>
          </div>
        </div>
        {items.length > 0 && (
          <button onClick={() => setConfirm({ type: 'all' })} disabled={emptyingAll}
            className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50">
            {emptyingAll ? 'Emptying…' : 'Empty Trash'}
          </button>
        )}
      </div>
      {loading ? (
        <div className="flex-1 flex items-center justify-center text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl opacity-30">delete</span>
          <p className="text-sm">Your trash is empty</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="bg-white border rounded-xl p-3 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 shadow-sm">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{item.title}</p>
                {item.subject && <span className="text-2xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full inline-block mt-1">{item.subject}</span>}
                <p className="text-xs text-on-surface-variant mt-1">Deleted on {new Date(item.deleted_at).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => restore(item.id)} className="px-3 py-1 text-xs font-semibold text-primary border border-primary/30 rounded-lg hover:bg-primary/5">Restore</button>
                <button onClick={() => setConfirm({ type: 'single', id: item.id })} className="px-3 py-1 text-xs font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AiTutor() {
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [toast, setToast] = useState(null);
  const [retryBanner, setRetryBanner] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  // ── NEW: desktop sidebar collapsed state ──
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const messagesEndRef = useRef(null);
  const toastTimerRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoadingConvs(true);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : (data.results || []));
    } catch { }
    finally { setLoadingConvs(false); }
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages, isTyping]);

  async function openConversation(id) {
    setLoadingChat(true);
    setRetryBanner(false);
    setShowMobileDrawer(false);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/${id}/`, { headers: authHeaders() });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (res.status === 404) { loadConversations(); return; }
      const data = await res.json();
      setActiveConv(data);
    } catch { }
    finally { setLoadingChat(false); }
  }

  async function sendMessage() {
    if (!inputMsg.trim() || !activeConv || isTyping) return;
    const text = inputMsg.trim();
    setInputMsg('');
    setRetryBanner(false);
    const tempUserMsg = { id: `temp-${Date.now()}`, role: 'user', content: text, created_at: new Date().toISOString() };
    setActiveConv(prev => ({ ...prev, messages: [...(prev.messages || []), tempUserMsg] }));
    setIsTyping(true);
    try {
      const res = await fetch(`${API_BASE}/tutor/conversations/chat/`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ conversation_id: activeConv.id, message: text }),
      });
      if (res.status === 401) { window.location.href = '/login'; return; }
      if (res.status === 400) {
        const d = await res.json();
        setActiveConv(prev => ({ ...prev, messages: prev.messages.filter(m => m.id !== tempUserMsg.id) }));
        setRetryBanner(d.detail || 'Could not send.');
        return;
      }
      if (!res.ok) { setRetryBanner(true); return; }
      const aiMsg = await res.json();
      setActiveConv(prev => ({ ...prev, messages: [...(prev.messages || []), aiMsg] }));
      setConversations(prev => prev.map(c =>
        c.id === activeConv.id
          ? { ...c, last_message_preview: truncateText(aiMsg.content, 50), updated_at: aiMsg.created_at }
          : c
      ));
    } catch {
      setRetryBanner(true);
    } finally {
      setIsTyping(false);
    }
  }

  async function softDelete(id) {
    const res = await fetch(`${API_BASE}/tutor/conversations/${id}/soft-delete/`, { method: 'POST', headers: authHeaders() });
    if (!res.ok) return;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConv?.id === id) setActiveConv(null);
    setConfirmDelete(null);
    clearTimeout(toastTimerRef.current);
    setToast({ msg: 'Moved to Trash', undoId: id });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  }

  async function undoDelete(id) {
    clearTimeout(toastTimerRef.current);
    setToast(null);
    await fetch(`${API_BASE}/tutor/conversations/${id}/restore/`, { method: 'POST', headers: authHeaders() });
    loadConversations();
  }

  function handleCreated(conv) {
    setShowNewModal(false);
    setConversations(prev => [conv, ...prev]);
    openConversation(conv.id);
  }

  if (loadingConvs && conversations.length === 0) return <AiTutorSkeleton />;
  if (showTrash) return <MainLayout title="Student Portal"><TrashView onBack={() => setShowTrash(false)} /></MainLayout>;

  return (
    <MainLayout title="Student Portal">
      {showNewModal && <NewConvModal onClose={() => setShowNewModal(false)} onCreate={handleCreated} />}
      {confirmDelete && (
        <ConfirmDialog
          message="Move this conversation to Trash? You can restore it later."
          onConfirm={() => softDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-900 text-white text-xs px-4 py-2 rounded-xl shadow-xl max-w-[90vw]">
          <span className="truncate">{toast.msg}</span>
          <button onClick={() => undoDelete(toast.undoId)} className="font-bold text-primary underline flex-shrink-0">Undo</button>
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 flex-shrink-0">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      <div className="p-2 md:p-3 h-[calc(100vh-80px)] flex flex-col gap-2 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-bold text-on-surface truncate">AI Intelligent Tutor</h2>
            <p className="text-2xs md:text-xs text-on-surface-variant truncate">Your personal academic companion powered by ScholarFlow AI.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button onClick={() => setShowTrash(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-surface-container-lowest text-primary text-xs font-medium rounded-md border hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-sm">delete</span>
              <span className="hidden sm:inline">Trash</span>
            </button>
            <button onClick={() => setShowNewModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-br from-primary to-primary-container text-white text-xs font-semibold rounded-md shadow-md">
              <span className="material-symbols-outlined text-sm">add</span>
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div className="flex-1 flex gap-2 overflow-hidden">

          {/* ── Mobile Drawer backdrop ── */}
          {showMobileDrawer && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowMobileDrawer(false)} />
          )}

          {/* ── Mobile Drawer ── */}
          <div className={`fixed top-0 left-0 h-full w-72 max-w-[85vw] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden shadow-xl ${
            showMobileDrawer ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="h-full flex flex-col">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <p className="text-xs font-bold uppercase">Sessions</p>
                <button onClick={() => setShowMobileDrawer(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => (
                  <div key={conv.id} onClick={() => openConversation(conv.id)}
                    className={`px-3 py-2 cursor-pointer border-b hover:bg-gray-50 ${activeConv?.id === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''}`}>
                    <p className="text-sm font-semibold truncate">{conv.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {conv.subject && <span className="text-3xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{conv.subject}</span>}
                      <span className="text-3xs text-gray-400">{timeAgo(conv.updated_at)}</span>
                    </div>
                    {conv.last_message_preview && (
                      <p className="text-2xs text-gray-400 mt-1 truncate">{conv.last_message_preview}</p>
                    )}
                  </div>
                ))}
              </div>
              <div className="p-3 border-t">
                <button onClick={() => { setShowTrash(true); setShowMobileDrawer(false); }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Recently Deleted
                </button>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              Desktop Sidebar — collapsible
              Expanded : w-64  shows full panel
              Collapsed: w-12  shows only icons strip
          ══════════════════════════════════════════════════ */}
          <div className={`hidden lg:flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ease-in-out flex-shrink-0 ${
            sidebarCollapsed ? 'w-12' : 'w-64 xl:w-72'
          }`}>

            {/* Sidebar header — toggle button always visible */}
            <div className={`flex items-center border-b bg-gray-50/50 flex-shrink-0 ${sidebarCollapsed ? 'justify-center px-0 py-2' : 'px-3 py-2 justify-between'}`}>
              {!sidebarCollapsed && (
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sessions</p>
              )}
              <button
                onClick={() => setSidebarCollapsed(prev => !prev)}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="p-1 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">
                  {sidebarCollapsed ? 'chevron_right' : 'chevron_left'}
                </span>
              </button>
            </div>

            {/* Collapsed state — icon-only strip */}
            {sidebarCollapsed ? (
              <div className="flex-1 flex flex-col items-center py-3 gap-2 overflow-y-auto">
                {/* New session icon */}
                <button
                  onClick={() => setShowNewModal(true)}
                  title="New Session"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">add_comment</span>
                </button>

                {/* Divider */}
                <div className="w-6 border-t border-gray-200 flex-shrink-0" />

                {/* Each conversation as a colored dot/icon */}
                {conversations.map((conv, idx) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    title={conv.title}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors text-xs font-bold flex-shrink-0 ${
                      activeConv?.id === conv.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    {conv.title.charAt(0).toUpperCase()}
                  </button>
                ))}

                {/* Spacer */}
                <div className="flex-1" />

                {/* Trash icon */}
                <button
                  onClick={() => setShowTrash(true)}
                  title="Recently Deleted"
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors mb-1 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                </button>
              </div>
            ) : (
              /* Expanded state — full list */
              <>
                <div className="flex-1 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-1 text-gray-400">
                      <span className="material-symbols-outlined text-3xl opacity-30">chat</span>
                      <p className="text-xs">No sessions yet</p>
                      <button onClick={() => setShowNewModal(true)} className="text-xs text-primary underline">Start one</button>
                    </div>
                  ) : (
                    conversations.map(conv => (
                      <div
                        key={conv.id}
                        onClick={() => openConversation(conv.id)}
                        className={`px-3 py-2 cursor-pointer border-b hover:bg-gray-50 transition-colors ${
                          activeConv?.id === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                        }`}
                      >
                        <p className="text-sm font-semibold truncate">{conv.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {conv.subject && (
                            <span className="text-3xs font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                              {conv.subject}
                            </span>
                          )}
                          <span className="text-3xs text-gray-400">{timeAgo(conv.updated_at)}</span>
                        </div>
                        {conv.last_message_preview && (
                          <p className="text-2xs text-gray-400 mt-1 truncate">{conv.last_message_preview}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t flex-shrink-0">
                  <button
                    onClick={() => setShowTrash(true)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-100 rounded-lg"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Recently Deleted
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── Chat Window ── */}
          <div className="flex-1 h-full flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden min-w-0">

            {/* Chat Header */}
            <div className="px-4 py-2 border-b flex items-center justify-between bg-gray-50/30 flex-shrink-0 gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {/* Mobile: hamburger */}
                <button onClick={() => setShowMobileDrawer(true)} className="lg:hidden p-1 rounded-lg hover:bg-gray-100 flex-shrink-0">
                  <span className="material-symbols-outlined text-lg">menu</span>
                </button>
                {activeConv ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span className="text-sm font-semibold truncate">{activeConv.title}</span>
                    {activeConv.subject && (
                      <span className="text-3xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:inline-block">
                        {activeConv.subject}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-400 truncate">Select a session to start</span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-500 hover:border-primary hover:text-primary">
                  <span className="material-symbols-outlined text-sm">hearing</span>
                </button>
                <button className="w-7 h-7 rounded-full bg-gray-700 text-white flex items-center justify-center hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-sm">mic</span>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 bg-gray-50/20">
              {loadingChat ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">Loading messages…</div>
              ) : !activeConv ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 text-center px-4">
                  <span className="material-symbols-outlined text-5xl opacity-20">smart_toy</span>
                  <p className="text-sm">Pick a session or start a new one</p>
                  <button onClick={() => setShowNewModal(true)} className="text-sm text-primary underline">New Session</button>
                </div>
              ) : (
                (activeConv.messages || []).filter(m => m.role !== 'system').map(msg => (
                  msg.role === 'user' ? (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[75%] bg-primary/10 text-on-surface p-3 rounded-2xl rounded-tr-none shadow-sm">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        <span className="text-3xs mt-1 block opacity-50 text-right">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div key={msg.id} className="flex justify-start gap-2">
                      <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white shrink-0">
                        <span className="material-symbols-outlined text-sm">smart_toy</span>
                      </div>
                      <div className="max-w-[85%] sm:max-w-[80%] bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm overflow-hidden">
                        <div className="text-sm leading-relaxed prose prose-sm max-w-none break-words overflow-x-auto prose-headings:font-bold prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-pre:overflow-x-auto prose-pre:max-w-full">
                          <ReactMarkdown remarkPlugins={[remarkMath, remarkGfm]} rehypePlugins={[rehypeKatex]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                        <span className="text-3xs mt-2 block opacity-40">
                          AI Generated · {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  )
                ))
              )}
              {isTyping && (
                <div className="flex justify-start gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-white shrink-0">
                    <span className="material-symbols-outlined text-sm">smart_toy</span>
                  </div>
                  <div className="bg-white border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-secondary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Retry Banner */}
            {retryBanner && (
              <div className="mx-3 mb-1 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between gap-2 flex-shrink-0">
                <p className="text-xs text-red-600 break-words">{typeof retryBanner === 'string' ? retryBanner : 'Something went wrong. Please try again.'}</p>
                <button onClick={() => setRetryBanner(false)} className="text-red-400 hover:text-red-600 flex-shrink-0">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t flex-shrink-0">
              <div className="flex items-center gap-2">
                <input
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  disabled={!activeConv || isTyping}
                  placeholder={activeConv ? `Ask about ${activeConv.subject || 'your subject'}...` : 'Select a session first'}
                  className="flex-1 min-w-0 bg-gray-50 border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={!activeConv || !inputMsg.trim() || isTyping}
                  className="w-8 h-8 bg-primary text-white rounded-xl flex items-center justify-center shadow-md hover:bg-primary/90 disabled:opacity-40 flex-shrink-0"
                >
                  <span className="material-symbols-outlined text-base">send</span>
                </button>
              </div>
              <p className="text-3xs text-gray-400 italic text-center mt-1.5">AI Tutor can make mistakes. Verify important information.</p>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}