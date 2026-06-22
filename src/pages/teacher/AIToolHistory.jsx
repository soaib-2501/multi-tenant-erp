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
          <th key={header} className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>
            {header}
          </th>
        ))}
      </tr>
    </thead>
    <tbody className={darkMode ? 'divide-y divide-slate-700' : 'divide-y divide-surface-container/50'}>
      {[...Array(5)].map((_, i) => (
        <tr key={i} className={darkMode ? 'bg-slate-800/50' : ''}>
          <td className="px-3 md:px-6 py-3 md:py-5">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-4 h-4 md:w-5 md:h-5 bg-slate-300 rounded animate-pulse" />
              <div className="h-3 md:h-4 w-32 md:w-48 bg-slate-300 rounded animate-pulse" />
            </div>
          </td>
          <td className="px-3 md:px-6 py-3 md:py-5">
            <div className="h-5 md:h-6 w-20 md:w-24 bg-slate-300 rounded-full animate-pulse" />
          </td>
          <td className="px-3 md:px-6 py-3 md:py-5">
            <div className="h-3 md:h-4 w-16 md:w-20 bg-slate-300 rounded animate-pulse" />
          </td>
          <td className="px-3 md:px-6 py-3 md:py-5">
            <div className="h-3 md:h-4 w-12 md:w-16 bg-slate-300 rounded animate-pulse" />
          </td>
          <td className="px-3 md:px-6 py-3 md:py-5">
            <div className="h-3 md:h-4 w-24 md:w-32 bg-slate-300 rounded animate-pulse" />
          </td>
          <td className="px-3 md:px-6 py-3 md:py-5">
            <div className="flex gap-1 md:gap-2 justify-end">
              <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-300 rounded-lg animate-pulse" />
              <div className="w-7 h-7 md:w-8 md:h-8 bg-slate-300 rounded-lg animate-pulse" />
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
  const [pageLoading, setPageLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 5;

  const fetchHistory = async (page = 1, isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setPageLoading(true);
    }
    try {
      const data = await getSavedAIContent({ limit: itemsPerPage, offset: (page - 1) * itemsPerPage });
      setHistoryData(data.results || data);

      const count = data.count ?? (data.results || data).length;
      setTotalCount(count);
      setTotalPages(Math.ceil(count / itemsPerPage) || 1);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage, currentPage === 1);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this saved content?")) {
      try {
        await deleteSavedAIContent(id);
        // If deleting the last item on this page, go back one page
        const isLastItemOnPage = historyData.length === 1 && currentPage > 1;
        if (isLastItemOnPage) {
          setCurrentPage(p => p - 1);
        } else {
          fetchHistory(currentPage, false);
        }
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
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div>
            <Link
              to="/teacher/ai-tools"
              className={`flex items-center gap-1 md:gap-2 font-semibold text-3xs md:text-sm mb-2 md:mb-4 hover:-translate-x-1 transition-transform w-max font-display ${
                darkMode ? 'text-blue-400' : 'text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-xs md:text-sm">arrow_back</span>
              Back to Dashboard
            </Link>
            <h2 className={`text-lg md:text-3xl font-display font-bold ${darkMode ? 'text-white' : 'text-on-surface'}`}>Content History</h2>
            <p className={`font-body text-3xs md:text-base ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>All your saved AI-generated content in one place.</p>
          </div>
        </div>

        {/* History List */}
        <Card className={`p-0 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`} style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
          <div className="overflow-x-auto scrollbar-thin">
            {loading ? (
              <TableSkeleton darkMode={darkMode} />
            ) : historyData.length === 0 ? (
              <div className="p-6 md:p-12 text-center flex flex-col items-center">
                <span className={`material-symbols-outlined text-4xl md:text-6xl mb-3 md:mb-4 ${darkMode ? 'text-slate-600' : 'text-outline-variant'}`}>folder_open</span>
                <h3 className={`text-base md:text-xl font-bold font-display mb-2 ${darkMode ? 'text-white' : 'text-on-surface'}`}>No Content Saved</h3>
                <p className={`font-body text-xs md:text-base mb-4 md:mb-6 ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>You haven't saved any AI generated content yet.</p>
                <Link to="/teacher/ai-tools" className={`px-4 md:px-6 py-2 text-xs md:text-base rounded-lg font-bold transition-colors ${
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
                      <th className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Content Title</th>
                      <th className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Type</th>
                      <th className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Subject</th>
                      <th className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Class</th>
                      <th className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Date Modified</th>
                      <th className={`px-3 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm text-right ${darkMode ? 'text-slate-300' : 'text-on-surface'}`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`${darkMode ? 'divide-y divide-slate-700' : 'divide-y divide-surface-container/50'} ${pageLoading ? 'opacity-40 pointer-events-none' : ''} transition-opacity duration-200`}>
                    {historyData.map(item => {
                      const visuals = getTypeVisuals(item.content_type);
                      return (
                      <tr key={item.id} className={`transition-colors group ${
                        darkMode ? 'hover:bg-slate-700/50' : 'hover:bg-blue-50/30'
                      }`}>
                        <td className="px-3 md:px-6 py-3 md:py-5">
                          <div className="flex items-center gap-2 md:gap-3">
                            <span className={`material-symbols-outlined ${visuals.iconColor} text-base md:text-xl block`}>{visuals.icon}</span>
                            <span className={`font-bold text-3xs md:text-sm truncate max-w-[120px] md:max-w-sm block ${darkMode ? 'text-white' : 'text-on-surface'}`} title={getTitle(item)}>{getTitle(item)}</span>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5">
                          <span className={`px-2 md:px-3 py-0.5 md:py-1 ${visuals.badgeColor} rounded-full text-[0.5rem] md:text-xs font-bold uppercase tracking-tight whitespace-nowrap`}>
                            {item.content_type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </td>
                        <td className={`px-3 md:px-6 py-3 md:py-5 text-3xs md:text-sm font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>{item.subject}</td>
                        <td className={`px-3 md:px-6 py-3 md:py-5 text-3xs md:text-sm font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>{item.class_name}</td>
                        <td className={`px-3 md:px-6 py-3 md:py-5 text-3xs md:text-sm font-medium whitespace-nowrap ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>
                          {new Date(item.updated_at).toLocaleString()}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <button 
                              onClick={() => navigate(`/teacher/ai-tools/${visuals.path}?id=${item.id}`)}
                              className={`p-1.5 md:p-2 rounded-lg transition-colors shadow-sm outline-none border-none cursor-pointer ${
                                darkMode
                                  ? 'hover:bg-slate-600 text-blue-400 bg-slate-700/50'
                                  : 'hover:bg-blue-50 text-primary bg-white'
                              }`} 
                              title="Open/Edit"
                            >
                              <span className="material-symbols-outlined text-base md:text-lg block">open_in_new</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className={`p-1.5 md:p-2 rounded-lg transition-colors shadow-sm outline-none border-none cursor-pointer ${
                                darkMode
                                  ? 'hover:bg-slate-600 text-red-400 bg-slate-700/50'
                                  : 'hover:bg-red-50 text-red-500 bg-white'
                              }`} 
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-base md:text-lg block">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className={`px-3 md:px-6 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 md:gap-0 border-t ${
                    darkMode
                      ? 'border-slate-700 bg-slate-800'
                      : 'border-surface-container bg-surface-container-lowest'
                  }`}>
                    <span className={`text-3xs md:text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-on-surface-variant'}`}>
                      Page {currentPage} of {totalPages}
                      {totalCount > 0 && (
                        <span className="ml-1 md:ml-2 opacity-70">
                          ({((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount})
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-0.5 md:gap-1">
                      {/* First page */}
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1 || pageLoading}
                        className={`p-1 md:p-2 rounded-lg border transition-colors ${
                          darkMode
                            ? 'border-slate-600 text-slate-400 disabled:opacity-30 hover:bg-slate-700'
                            : 'border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low'
                        }`}
                        title="First page"
                      >
                        <span className="material-symbols-outlined text-xs md:text-sm block">first_page</span>
                      </button>
                      {/* Previous */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || pageLoading}
                        className={`p-1 md:p-2 rounded-lg border transition-colors ${
                          darkMode
                            ? 'border-slate-600 text-slate-400 disabled:opacity-30 hover:bg-slate-700'
                            : 'border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low'
                        }`}
                        title="Previous page"
                      >
                        <span className="material-symbols-outlined text-xs md:text-sm block">chevron_left</span>
                      </button>

                      {/* Page number pills */}
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                        .reduce((acc, p, idx, arr) => {
                          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((item, idx) =>
                          item === '...' ? (
                            <span key={`ellipsis-${idx}`} className={`px-1 md:px-2 text-[0.5rem] md:text-xs ${darkMode ? 'text-slate-500' : 'text-on-surface-variant'}`}>…</span>
                          ) : (
                            <button
                              key={item}
                              onClick={() => handlePageChange(item)}
                              disabled={pageLoading}
                              className={`min-w-[28px] md:min-w-[32px] h-7 md:h-8 px-1.5 md:px-2 rounded-lg border text-[0.6rem] md:text-xs font-bold transition-colors ${
                                item === currentPage
                                  ? darkMode
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'bg-primary border-primary text-white'
                                  : darkMode
                                    ? 'border-slate-600 text-slate-400 hover:bg-slate-700 disabled:opacity-30'
                                    : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-30'
                              }`}
                            >
                              {item}
                            </button>
                          )
                        )
                      }

                      {/* Next */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || pageLoading}
                        className={`p-1 md:p-2 rounded-lg border transition-colors ${
                          darkMode
                            ? 'border-slate-600 text-slate-400 disabled:opacity-30 hover:bg-slate-700'
                            : 'border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low'
                        }`}
                        title="Next page"
                      >
                        <span className="material-symbols-outlined text-xs md:text-sm block">chevron_right</span>
                      </button>
                      {/* Last page */}
                      <button
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages || pageLoading}
                        className={`p-1 md:p-2 rounded-lg border transition-colors ${
                          darkMode
                            ? 'border-slate-600 text-slate-400 disabled:opacity-30 hover:bg-slate-700'
                            : 'border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low'
                        }`}
                        title="Last page"
                      >
                        <span className="material-symbols-outlined text-xs md:text-sm block">last_page</span>
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
