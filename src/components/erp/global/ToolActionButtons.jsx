import React, { useState } from 'react';
import { handleShare } from '../../../services/exportService';
import html2pdf from 'html2pdf.js';

export default function ToolActionButtons({ 
  contentData, 
  toolName, 
  exportType = 'PDF', // Defaults to PDF, pass 'PPTX' for presentations
  contentRef, // reference to the DOM element to print
  onSave,
  isSaving = false,
  requiresAnswerPrompt = false,
  onToggleAnswers,
  onExport // Optional custom export function override
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false); // State for dropdown menu

  const handleDefaultExport = async () => {
    if (!contentData || !contentRef?.current) {
      alert("No content available to export.");
      return;
    }
    
    // Prompt for answers if required
    let toggledAnswers = false;
    if (requiresAnswerPrompt && onToggleAnswers) {
      const reveal = window.confirm("Do you want to export with the answers revealed?");
      if (reveal) {
        await onToggleAnswers(true);
        toggledAnswers = true;
        // Wait a tick for React to render the answers
        await new Promise(r => setTimeout(r, 100));
      }
    }

    setIsExporting(true);
    const element = contentRef.current;
    
    // Store original styles and scroll position
    const originalStyle = element.getAttribute('style') || '';
    const originalScrollTop = element.scrollTop;
    
    try {
      // Temporarily expand element to full height and reset scroll to top 
      // so html2canvas captures the entire content.
      element.style.overflow = 'visible';
      element.style.height = 'max-content';
      element.style.maxHeight = 'none';
      element.scrollTop = 0;

      const filename = `${toolName.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      
      const opt = {
        margin:       [0.5, 0.5, 0.5, 0.5],
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export PDF.");
    } finally {
      // Restore original styles and scroll position
      element.setAttribute('style', originalStyle);
      element.scrollTop = originalScrollTop;
      setIsExporting(false);
      
      // Hide answers again if we toggled them
      if (toggledAnswers && onToggleAnswers) {
        await onToggleAnswers(false);
      }
    }
  };

  const onShare = () => {
    handleShare(
      `Academic Architect: ${toolName}`, 
      `Check out this ${toolName} I generated using the AI Assistant!`
    );
  };

  // --- Native File Sharing Logic (Strictly PDF & Links) ---
  const handleNativeShare = async (shareType) => {
    setIsShareOpen(false); // Close dropdown
    
    try {
      // 1. Share standard Link
      if (shareType === 'link') {
        onShare();
        return;
      }

      // 2. Share physical PDF using html2pdf
      if (shareType === 'pdf') {
        if (!contentRef?.current) return;
        
        const fileName = `${toolName.replace(/\s+/g, '_')}.pdf`;
        const element = contentRef.current;
        
        const originalStyle = element.getAttribute('style') || '';
        const originalScrollTop = element.scrollTop;
        
        try {
          element.style.overflow = 'visible';
          element.style.height = 'max-content';
          element.style.maxHeight = 'none';
          element.scrollTop = 0;

          const opt = {
            margin:       0.5,
            filename:     fileName,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };

          // Output as blob
          const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
          const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

          // Open the native share dialog directly with the fetched file
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: fileName, 
              files: [file]
            });
          } else {
            alert("Your browser does not support direct file sharing. Please use the Export button to download it first.");
          }
        } finally {
          element.setAttribute('style', originalStyle);
          element.scrollTop = originalScrollTop;
        }
      }

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error("Sharing failed:", error);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-100 bg-white rounded-b-xl">
      <button 
        onClick={onSave}
        disabled={isSaving || !contentData}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#0058be] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-all disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">
          {isSaving ? 'sync' : 'save'}
        </span>
        {isSaving ? 'Saving...' : `Save ${toolName.split(' ')[0]}`}
      </button>

      <button 
        onClick={onExport || handleDefaultExport}
        disabled={isExporting || !contentData}
        className="flex items-center gap-2 px-6 py-2.5 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-lg hover:bg-[#dce9ff] transition-all disabled:opacity-50"
      >
        <span className="material-symbols-outlined text-lg">
          {isExporting ? 'hourglass_empty' : 'download'}
        </span>
        {isExporting ? 'Exporting...' : `Export ${exportType}`}
      </button>

      {/* --- Share Dropdown Button --- */}
      <div className="relative">
        <button 
          onClick={() => setIsShareOpen(!isShareOpen)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#eff4ff] text-[#0058be] text-sm font-bold rounded-lg hover:bg-[#dce9ff] transition-all"
        >
          <span className="material-symbols-outlined text-lg">share</span>
          Share
        </button>

        {isShareOpen && (
          <div className="absolute bottom-full mb-2 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
            <button 
              onClick={() => handleNativeShare('link')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-gray-500">link</span>
              Share Link
            </button>
            <button 
              onClick={() => handleNativeShare('pdf')}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-red-500">picture_as_pdf</span>
              Share as PDF
            </button>
          </div>
        )}
      </div>

      <button className="flex items-center gap-2 px-6 py-2.5 bg-[#6b38d4] text-white text-sm font-bold rounded-lg shadow-sm hover:bg-purple-700 transition-all ml-auto">
        <span className="material-symbols-outlined text-lg">assignment_add</span>
        Assign
      </button>
    </div>
  );
}