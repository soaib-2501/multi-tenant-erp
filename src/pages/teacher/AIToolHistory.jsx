import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getSavedAIContent, deleteSavedAIContent } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';

const getTypeVisuals = (type) => {
  switch(type) {
    case 'LessonPlan': return { icon: 'assignment', iconColor: 'text-blue-500', badgeColor: 'bg-blue-50 text-blue-700', path: 'lesson-plan' };
    case 'Worksheet': return { icon: 'description', iconColor: 'text-indigo-500', badgeColor: 'bg-indigo-50 text-indigo-700', path: 'worksheet' };
    case 'Quiz': return { icon: 'quiz', iconColor: 'text-[#6b38d4]', badgeColor: 'bg-purple-50 text-purple-700', path: 'quiz' };
    case 'QuestionPaper': return { icon: 'history_edu', iconColor: 'text-red-500', badgeColor: 'bg-red-50 text-red-700', path: 'question-paper' };
    case 'StudyNotes': return { icon: 'menu_book', iconColor: 'text-green-500', badgeColor: 'bg-green-50 text-green-700', path: 'study-notes' };
    case 'PresentationOutline': return { icon: 'speaker_notes', iconColor: 'text-teal-500', badgeColor: 'bg-teal-50 text-teal-700', path: 'presentation-outline' };
    case 'Rubric': return { icon: 'rule', iconColor: 'text-[#b75b00]', badgeColor: 'bg-orange-50 text-orange-700', path: 'rubric' };
    default: return { icon: 'article', iconColor: 'text-gray-500', badgeColor: 'bg-gray-50 text-gray-700', path: 'lesson-plan' };
  }
};

// Skeleton component for loading state
const TableSkeleton = ({ darkMode }) => (
  <table className="w-full text-left border-collapse min-w-[800px]">
    <thead>
      <tr className={darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-surface-container-low border-b border-surface-container'}>
        {['Content Title', 'Type', 'Subject', 'Class', 'Date Modified', 'Actions'].map((header) => (
          <th key={header} className={`px-6 py-4 font-display font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className={darkMode ? 'divide-y divide-slate-700' : 'divide-y divide-surface-container/50'}>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className={darkMode ? 'bg-slate-800/50' : ''}>
          <td className="px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-slate-300 rounded animate-pulse" />
              <div className="h-4 w-48 bg-slate-300 rounded animate-pulse" />
            </div>
          </td>
          <td className="px-6 py-5">
            <div className="h-6 w-24 bg-slate-300 rounded-full animate-pulse" />
          </td>
          <td className="px-6 py-5">
            <div className="h-4 w-20 bg-slate-300 rounded animate-pulse" />
          </td>
          <td className="px-6 py-5">
            <div className="h-4 w-16 bg-slate-300 rounded animate-pulse" />
          </td>
          <td className="px-6 py-5">
            <div className="h-4 w-32 bg-slate-300 rounded animate-pulse" />
          </td>
          <td className="px-6 py-5">
            <div className="flex gap-2 justify-end">
              <div className="w-8 h-8 bg-slate-300 rounded-lg animate-pulse" />
              <div className="w-8 h-8 bg-slate-300 rounded-lg animate-pulse" />
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const AIToolHistory = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const data = await getSavedAIContent({ limit: itemsPerPage, offset: (page - 1) * itemsPerPage });
      setHistoryData(data.results || data);
      
      if (data.count) {
        setTotalPages(Math.ceil(data.count / itemsPerPage));
      } else {
        setTotalPages(1); // Fallback if count is not available
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this saved content?")) {
      try {
        await deleteSavedAIContent(id);
        fetchHistory(currentPage); // Refresh list
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Failed to delete content");
      }
    }
  };

  const getTitle = (item) => {
    if (item.data && item.data.title) return item.data.title;
    return `${item.subject} ${item.content_type}`;
  };

  return (
    <MainLayout title="Saved AI Content">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              to="/teacher/ai-tools"
              className={`flex items-center gap-2 font-semibold text-sm mb-4 hover:-translate-x-1 transition-transform w-max font-display ${
                darkMode ? 'text-blue-400' : 'text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Back to Dashboard
            </Link>
            <h2 className={`text-3xl font-display font-bold ${darkMode ? 'text-white' : 'text-on-surface'}`}>Content History</h2>
            <p className={`font-body ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>All your saved AI-generated content in one place.</p>
          </div>
        </div>

        {/* History List */}
        <Card className={`p-0 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`} style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton darkMode={darkMode} />
            ) : historyData.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center">
                <span className={`material-symbols-outlined text-6xl mb-4 ${darkMode ? 'text-slate-600' : 'text-outline-variant'}`}>folder_open</span>
                <h3 className={`text-xl font-bold font-display mb-2 ${darkMode ? 'text-white' : 'text-on-surface'}`}>No Content Saved</h3>
                <p className={`font-body mb-6 ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>You haven't saved any AI generated content yet.</p>
                <Link to="/teacher/ai-tools" className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                  darkMode
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}>
                  Create Content
                </Link>
              </div>
            ) : (
              <>
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className={darkMode ? 'bg-slate-800 border-b border-slate-700' : 'bg-surface-container-low border-b border-surface-container'}>
                      <th className={`px-6 py-4 font-display font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Content Title</th>
                      <th className={`px-6 py-4 font-display font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Type</th>
                      <th className={`px-6 py-4 font-display font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Subject</th>
                      <th className={`px-6 py-4 font-display font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Class</th>
                      <th className={`px-6 py-4 font-display font-bold text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Date Modified</th>
                      <th className={`px-6 py-4 font-display font-bold text-sm text-right ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={darkMode ? 'divide-y divide-slate-700' : 'divide-y divide-surface-container/50'}>
                    {historyData.map(item => {
                      const visuals = getTypeVisuals(item.content_type);
                      return (
                      <tr key={item.id} className={`transition-colors group ${
                        darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-blue-50/30'
                      }`}>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className={`material-symbols-outlined ${visuals.iconColor} block`}>{visuals.icon}</span>
                            <span className={`font-bold text-sm truncate max-w-sm block ${darkMode ? 'text-white' : 'text-on-surface'}`} title={getTitle(item)}>{getTitle(item)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1 ${visuals.badgeColor} rounded-full text-xs font-bold uppercase tracking-tight whitespace-nowrap`}>
                            {item.content_type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </td>
                        <td className={`px-6 py-5 text-sm font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>{item.subject}</td>
                        <td className={`px-6 py-5 text-sm font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>{item.class_name}</td>
                        <td className={`px-6 py-5 text-sm font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>
                          {new Date(item.updated_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => navigate(`/teacher/ai-tools/${visuals.path}?id=${item.id}`)}
                              className={`p-2 rounded-lg transition-colors shadow-sm outline-none border-none cursor-pointer bg-transparent ${
                                darkMode
                                  ? 'hover:bg-slate-600 text-blue-400'
                                  : 'hover:bg-white text-primary'
                              }`} 
                              title="Open/Edit"
                            >
                              <span className="material-symbols-outlined text-lg block">open_in_new</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className={`p-2 rounded-lg transition-colors shadow-sm outline-none border-none cursor-pointer bg-transparent ${
                                darkMode
                                  ? 'hover:bg-slate-600 text-red-400'
                                  : 'hover:bg-white text-red-500'
                              }`} 
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-lg block">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className={`px-6 py-4 flex items-center justify-between border-t ${
                    darkMode
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-surface-container bg-surface-container-lowest'
                  }`}>
                    <span className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg border transition-colors ${
                          darkMode
                            ? 'border-slate-600 text-slate-400 disabled:opacity-50 hover:bg-slate-700'
                            : 'border-outline-variant text-on-surface-variant disabled:opacity-50 hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm block">chevron_left</span>
                      </button>
                      <button 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg border transition-colors ${
                          darkMode
                            ? 'border-slate-600 text-slate-400 disabled:opacity-50 hover:bg-slate-700'
                            : 'border-outline-variant text-on-surface-variant disabled:opacity-50 hover:bg-surface-container-low'
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm block">chevron_right</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AIToolHistory;
