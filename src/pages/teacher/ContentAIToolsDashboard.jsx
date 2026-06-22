import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from "../../components/erp/teacher/MainLayout";
import Card from "../../components/erp/teacher/Card";
import { getSavedAIContent, deleteSavedAIContent } from '../../services/api';
import { useStaleData } from '../../hooks/useStaleData';
import { RevalidatingBar, SkeletonRow } from '../../components/erp/teacher/LoadingPrimitives';

const toolsInfo = [
{ id: 1, title: 'Lesson Plan Generator', desc: 'Create structured 45-minute lesson plans aligned with curriculum standards.', icon: 'assignment', link: '/teacher/ai-tools/lesson-plan' },
{ id: 2, title: 'Worksheet Generator', desc: 'Generate topic-specific practice sheets with varying difficulty levels.', icon: 'description', link: '/teacher/ai-tools/worksheet' },
{ id: 3, title: 'Quiz Generator', desc: 'Instant MCQs and short answers based on your uploaded reading material.', icon: 'quiz', link: '/teacher/ai-tools/quiz' },
{ id: 4, title: 'Question Paper Generator', desc: 'Design formal term exams with automated marks allocation and keys.', icon: 'history_edu', link: '/teacher/ai-tools/question-paper' },
{ id: 5, title: 'Study Notes Generator', desc: 'Synthesize complex lectures into bulleted summaries.', icon: 'menu_book', link: '/teacher/ai-tools/study-notes' },
{ id: 6, title: 'Presentation Outline', desc: 'Develop slide-by-slide narrative arcs.', icon: 'speaker_notes', link: '/teacher/ai-tools/presentation-outline' },
{ id: 7, title: 'Rubric Generator', desc: 'Create objective grading criteria.', icon: 'rule', link: '/teacher/ai-tools/rubric' }
];

const getTypeVisuals = (type) => {
  switch(type) {
    case 'LessonPlan': return { icon: 'assignment', iconColor: 'text-blue-500 dark:text-blue-400', badgeColor: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300', path: 'lesson-plan' };
    case 'Worksheet': return { icon: 'description', iconColor: 'text-indigo-500 dark:text-indigo-400', badgeColor: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300', path: 'worksheet' };
    case 'Quiz': return { icon: 'quiz', iconColor: 'text-[#6b38d4] dark:text-[#a27dfc]', badgeColor: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300', path: 'quiz' };
    case 'QuestionPaper': return { icon: 'history_edu', iconColor: 'text-red-500 dark:text-red-400', badgeColor: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300', path: 'question-paper' };
    case 'StudyNotes': return { icon: 'menu_book', iconColor: 'text-green-500 dark:text-green-400', badgeColor: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300', path: 'study-notes' };
    case 'PresentationOutline': return { icon: 'speaker_notes', iconColor: 'text-teal-500 dark:text-teal-400', badgeColor: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300', path: 'presentation-outline' };
    case 'Rubric': return { icon: 'rule', iconColor: 'text-[#b75b00] dark:text-orange-400', badgeColor: 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300', path: 'rubric' };
    default: return { icon: 'article', iconColor: 'text-gray-500 dark:text-gray-400', badgeColor: 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300', path: 'lesson-plan' };
  }
};

const ContentAIToolsDashboard = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const itemsPerPage = 5;

  const { data: historyPayload, loading: loadingHistory, revalidating, mutate: mutateHistory, revalidate: revalidateHistory } = useStaleData(
    `teacher:ai-content:history-page-${currentPage}`,
    () => getSavedAIContent({ limit: itemsPerPage, offset: (currentPage - 1) * itemsPerPage })
  );

  const historyData = historyPayload?.results || historyPayload || [];

  // Update pagination info when data changes
  React.useEffect(() => {
    if (historyPayload) {
      const count = historyPayload.count ?? (historyPayload.results || historyPayload).length;
      setTotalCount(count);
      setTotalPages(Math.ceil(count / itemsPerPage) || 1);
    }
  }, [historyPayload]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this saved content?")) {
      const currentData = historyPayload;
      try {
        // Optimistic update
        let nextData;
        if (currentData && Array.isArray(currentData.results)) {
          nextData = {
            ...currentData,
            results: currentData.results.filter(item => item.id !== id),
            count: currentData.count ? currentData.count - 1 : undefined
          };
        } else if (Array.isArray(currentData)) {
          nextData = currentData.filter(item => item.id !== id);
        } else {
          nextData = [];
        }

        mutateHistory(nextData);
        await deleteSavedAIContent(id);
        
        // If deleting the last item on this page and not on page 1, go back one page
        const isLastItemOnPage = historyData.length === 1 && currentPage > 1;
        if (isLastItemOnPage) {
          setCurrentPage(p => p - 1);
        } else {
          revalidateHistory();
        }
      } catch (error) {
        console.error("Failed to delete item:", error);
        alert("Failed to delete content");
        // Revert to original
        mutateHistory(currentData);
      }
    }
  };

  const getTitle = (item) => {
    if (item.data && item.data.title) return item.data.title;
    return `${item.subject} ${item.content_type}`;
  };

  return (
    <MainLayout title="Content & AI Tools">
      <RevalidatingBar show={revalidating} />

      <div className="max-w-7xl mx-auto space-y-6 md:space-y-12">
        
        {/* Welcome Header Section */}
        <section className="relative overflow-hidden rounded-lg md:rounded-3xl bg-primary px-3 py-4 md:px-8 md:py-10 text-white shadow-lg">
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2 md:mb-4">
              <span className="bg-[#924700] text-white px-2 py-0.5 md:px-3 md:py-1 rounded-full text-3xs md:text-xs font-bold uppercase tracking-wider">AI Powered</span>
            </div>
            <h2 className="text-base md:text-3xl font-display font-extrabold mb-1.5 md:mb-3 leading-tight text-white">Elevate Your Teaching with The Intelligent Architect</h2>
            <p className="text-blue-100 font-body text-2xs md:text-lg opacity-90">Generate structured educational content in seconds. Choose a tool below to begin your creative process.</p>
          </div>
          {/* Decorative background elements */}
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -right-10 bottom-0 w-64 h-64 bg-[#8455ef]/20 rounded-full blur-2xl"></div>
        </section>

        {/* AI Tools Grid */}
        <section>
          <div className="flex items-center justify-between mb-3 md:mb-8">
            <h3 className="text-base md:text-2xl font-display font-bold text-on-surface">Creative Toolset</h3>
            <div className="flex gap-1.5 md:gap-2">
              <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-primary"></span>
              <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-outline-variant"></span>
              <span className="w-1 h-1 md:w-2 md:h-2 rounded-full bg-outline-variant"></span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {toolsInfo.map(tool => (
              <Link to={tool.link} key={tool.id} className="group bg-surface-container-lowest p-3 md:p-6 rounded-lg md:rounded-2xl shadow-ambient hover:bg-primary dark:hover:bg-primary-container transition-all duration-300 transform hover:-translate-y-1" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
                <div className="w-7 h-7 md:w-12 md:h-12 bg-surface-container-low group-hover:bg-white/20 rounded-md md:rounded-xl flex items-center justify-center mb-2 md:mb-4 transition-colors">
                  <span className="material-symbols-outlined text-primary group-hover:text-white text-sm md:text-xl" style={{fontVariationSettings: "'FILL' 1"}}>{tool.icon}</span>
                </div>
                <h4 className="font-display font-bold text-xs md:text-lg mb-1 md:mb-2 group-hover:text-white text-on-surface">{tool.title}</h4>
                <p className="text-on-surface-variant text-3xs md:text-sm group-hover:text-blue-100 dark:group-hover:text-blue-200 mb-2 md:mb-6 font-body leading-relaxed">{tool.desc}</p>
                <div className="w-full py-1.5 md:py-3 bg-surface-container-high group-hover:bg-white text-primary group-hover:text-primary-container dark:group-hover:text-blue-900 font-bold rounded-md md:rounded-xl text-3xs md:text-sm transition-colors text-center">Open Tool</div>
              </Link>
            ))}

            {/* Coming Soon Placeholder */}
            <div className="border-2 border-dashed border-outline-variant p-3 md:p-6 rounded-lg md:rounded-2xl flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-7 h-7 md:w-12 md:h-12 rounded-md md:rounded-xl flex items-center justify-center mb-2 md:mb-4 border border-outline-variant">
                <span className="material-symbols-outlined text-on-surface-variant text-sm md:text-xl">add_circle</span>
              </div>
              <h4 className="font-display font-bold text-xs md:text-lg mb-1 md:mb-2 text-on-surface">Request Tool</h4>
              <p className="text-on-surface-variant text-3xs md:text-sm font-body">New AI features arriving every month.</p>
            </div>
          </div>
        </section>

        {/* Saved Content Section */}
        <section className="space-y-3 md:space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-2xl font-display font-bold text-on-surface">Saved & Recent Content</h3>
            <Link to="/teacher/ai-tools/history" className="text-primary font-bold text-3xs md:text-sm flex items-center gap-0.5 md:gap-1 hover:underline outline-none border-none cursor-pointer bg-transparent">
              View All History <span className="material-symbols-outlined text-2xs md:text-sm block">arrow_forward</span>
            </Link>
          </div>
          
          {/* Table Container */}
          <Card className="p-0 overflow-hidden" style={{boxShadow: '0px 12px 32px rgba(11,28,48,0.06)'}}>
            <div className="overflow-x-auto">
              {loadingHistory && historyData.length === 0 ? (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container">
                      <th className="px-2 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm text-on-surface">Content Title</th>
                      <th className="px-2 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm text-on-surface">Type</th>
                      <th className="px-2 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm text-on-surface">Subject</th>
                      <th className="px-2 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm text-on-surface">Date</th>
                      <th className="px-2 md:px-6 py-2 md:py-4 font-display font-bold text-3xs md:text-sm text-on-surface text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} cols={5} />)}
                  </tbody>
                </table>
              ) : historyData.length === 0 ? (
                <div className="p-3 md:p-8 text-center text-on-surface-variant text-3xs md:text-base">No saved content yet. Generate some using the tools above!</div>
              ) : (
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-surface-container">
                      <th className="px-3 md:px-6 py-2 md:py-4 font-display font-bold text-2xs md:text-sm text-on-surface">Content Title</th>
                      <th className="px-3 md:px-6 py-2 md:py-4 font-display font-bold text-2xs md:text-sm text-on-surface">Type</th>
                      <th className="px-3 md:px-6 py-2 md:py-4 font-display font-bold text-2xs md:text-sm text-on-surface">Subject</th>
                      <th className="px-3 md:px-6 py-2 md:py-4 font-display font-bold text-2xs md:text-sm text-on-surface">Date</th>
                      <th className="px-3 md:px-6 py-2 md:py-4 font-display font-bold text-2xs md:text-sm text-on-surface text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container/50">
                    {historyData.map(item => {
                      const visuals = getTypeVisuals(item.content_type);
                      return (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="px-2 md:px-6 py-2 md:py-5">
                          <div className="flex items-center gap-1.5 md:gap-3">
                            <span className={`material-symbols-outlined ${visuals.iconColor} block text-xs md:text-base`}>{visuals.icon}</span>
                            <span className="font-bold text-3xs md:text-sm text-on-surface truncate max-w-xs block">{getTitle(item)}</span>
                          </div>
                        </td>
                        <td className="px-2 md:px-6 py-2 md:py-5">
                          <span className={`px-1.5 md:px-3 py-0.5 md:py-1 ${visuals.badgeColor} rounded-full text-3xs md:text-xs font-bold uppercase tracking-tight whitespace-nowrap`}>
                            {item.content_type.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </td>
                        <td className="px-2 md:px-6 py-2 md:py-5 text-3xs md:text-sm text-on-surface-variant font-medium whitespace-nowrap">{item.subject}</td>
                        <td className="px-2 md:px-6 py-2 md:py-5 text-3xs md:text-sm text-on-surface-variant font-medium whitespace-nowrap">
                          {new Date(item.updated_at).toLocaleDateString()}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-5 text-right">
                          <div className="flex items-center justify-end gap-1 md:gap-2">
                            <button 
                              onClick={() => navigate(`/teacher/ai-tools/${visuals.path}?id=${item.id}`)}
                              className="p-1.5 md:p-2 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-primary dark:text-blue-400 shadow-sm outline-none border-none cursor-pointer bg-white dark:bg-slate-700/50" 
                              title="Open/Edit"
                            >
                              <span className="material-symbols-outlined text-sm md:text-lg block">open_in_new</span>
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-1.5 md:p-2 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition-colors text-red-500 dark:text-red-400 shadow-sm outline-none border-none cursor-pointer bg-white dark:bg-slate-700/50" 
                              title="Delete"
                            >
                              <span className="material-symbols-outlined text-sm md:text-lg block">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination Controls */}
            {!loadingHistory && historyData.length > 0 && totalPages > 1 && (
              <div className="px-2 md:px-6 py-2 md:py-4 flex items-center justify-between border-t border-surface-container bg-surface-container-lowest">
                <span className="text-3xs md:text-sm font-medium text-on-surface-variant">
                  Page {currentPage} of {totalPages}
                  {totalCount > 0 && (
                    <span className="ml-2 opacity-70 hidden sm:inline">
                      ({((currentPage - 1) * itemsPerPage) + 1}–{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount})
                    </span>
                  )}
                </span>
                <div className="flex items-center gap-0.5 md:gap-1">
                  {/* First page */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 md:p-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
                    title="First page"
                  >
                    <span className="material-symbols-outlined text-xs md:text-sm block">first_page</span>
                  </button>
                  {/* Previous */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-1.5 md:p-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
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
                        <span key={`ellipsis-${idx}`} className="px-1 md:px-2 text-2xs md:text-sm text-on-surface-variant">…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => handlePageChange(item)}
                          className={`min-w-[28px] md:min-w-[36px] h-7 md:h-9 px-1.5 md:px-2 rounded-lg border text-2xs md:text-sm font-bold transition-colors ${
                            item === currentPage
                              ? 'bg-primary border-primary text-white'
                              : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'
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
                    disabled={currentPage === totalPages}
                    className="p-1.5 md:p-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
                    title="Next page"
                  >
                    <span className="material-symbols-outlined text-xs md:text-sm block">chevron_right</span>
                  </button>
                  {/* Last page */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 md:p-2 rounded-lg border border-outline-variant text-on-surface-variant disabled:opacity-30 hover:bg-surface-container-low transition-colors"
                    title="Last page"
                  >
                    <span className="material-symbols-outlined text-xs md:text-sm block">last_page</span>
                  </button>
                </div>
              </div>
            )}
          </Card>
        </section>

      </div>

      {/* AI Chatbot Floating Trigger */}
      <button className="fixed bottom-3 right-3 md:bottom-8 md:right-8 w-10 h-10 md:w-16 md:h-16 bg-[#924700] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-50 outline-none border-none cursor-pointer">
        <span className="material-symbols-outlined text-lg md:text-3xl block" style={{fontVariationSettings: "'FILL' 1"}}>psychology</span>
      </button>

    </MainLayout>
  );
};

export default ContentAIToolsDashboard;
