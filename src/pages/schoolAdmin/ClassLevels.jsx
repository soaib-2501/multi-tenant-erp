import React, { useState, useEffect, useCallback } from "react";
import SchoolLayout from "../../components/erp/school/SchoolLayout";
import { schoolAdminApi } from "../../services/schoolAdminApi";
import { useTheme } from "../../context/ThemeContext";

export default function ClassLevels() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Master-Detail Interaction States
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [sectionsCache, setSectionsCache] = useState({});
  const [loadingSections, setLoadingSections] = useState({});

  const fetchLiveClassStructures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await schoolAdminApi.getClassLevels();
      const liveData = response?.results || response;
      if (Array.isArray(liveData)) {
        const sortedClasses = liveData.sort((a, b) => (a.numeric_order || 0) - (b.numeric_order || 0));
        setClasses(sortedClasses);
      } else {
        setClasses([]);
      }
    } catch (err) {
      console.error("Live configuration sync paused:", err);
      setError("Failed to synchronize active class levels with the data cluster.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveClassStructures();
  }, [fetchLiveClassStructures]);

  const toggleClassRow = async (classId) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }

    setExpandedClassId(classId);

    if (!sectionsCache[classId]) {
      setLoadingSections((prev) => ({ ...prev, [classId]: true }));
      try {
        const response = await schoolAdminApi.getSectionsByClass(classId);
        let liveSections = response?.results || response || [];

        if (liveSections.length > 0) {
          liveSections = liveSections.filter((sec) => {
            const secClassId = typeof sec.class_level === "object" ? sec.class_level?.id : sec.class_level;
            return !secClassId || secClassId === classId;
          });
        }

        setSectionsCache((prev) => ({ ...prev, [classId]: liveSections }));
      } catch (err) {
        console.error(`Failed to fetch sections for class ${classId}:`, err);
        setSectionsCache((prev) => ({ ...prev, [classId]: [] }));
      } finally {
        setLoadingSections((prev) => ({ ...prev, [classId]: false }));
      }
    }
  };

  const handleDeleteClass = async (classId, e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this Class Level and all its Sections?"
    );
    if (!confirmDelete) return;

    try {
      await schoolAdminApi.deleteClassLevelById(classId);
      setClasses((prev) => prev.filter((c) => c.id !== classId));
      if (expandedClassId === classId) setExpandedClassId(null);
    } catch (err) {
      console.error("Failed to delete class:", err);
      alert("Error: Could not delete class level. Please check server connection.");
    }
  };

  const handleDeleteSection = async (classId, sectionId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this specific section?");
    if (!confirmDelete) return;

    try {
      await schoolAdminApi.deleteSectionById(sectionId);
      setSectionsCache((prev) => ({
        ...prev,
        [classId]: prev[classId].filter((sec) => sec.id !== sectionId),
      }));
      setClasses((prev) =>
        prev.map((c) => {
          if (c.id === classId) {
            return { ...c, sectionCount: Math.max(0, (c.sectionCount || c.sections?.length || 1) - 1) };
          }
          return c;
        })
      );
    } catch (err) {
      console.error("Failed to delete section:", err);
      alert("Error: Could not delete section.");
    }
  };

  const filteredClasses = classes.filter((c) => {
    const className = c?.name || "";
    const classCode = c?.code || "";
    return (
      className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <SchoolLayout title="Class Framework Directory">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">
            Institution Class Levels
          </h2>
          <p className="text-sm font-body font-medium text-on-surface-variant mt-1">
            Manage grade tiers, expand rows to view mapped section groupings, and strictly govern layout
            structures.
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 shadow-xs mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search classes by name or code..."
            className="w-full bg-surface-container-low pl-9 pr-4 py-2 rounded-lg text-xs font-semibold border border-transparent focus:border-primary focus:bg-surface-container-lowest outline-none transition-all font-body text-on-surface placeholder:text-on-surface-variant"
          />
        </div>
        <span className="text-xs font-bold text-on-surface-variant shrink-0 font-body">
          {loading
            ? "Calculating..."
            : `Showing ${filteredClasses.length} of ${classes.length} database entries`}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl text-xs font-semibold flex items-center gap-2 font-body">
          <span className="material-symbols-outlined text-base">cloud_off</span>
          <span>{error}</span>
          <button
            onClick={fetchLiveClassStructures}
            className="ml-auto underline text-xs font-bold hover:text-error/90 transition"
          >
            Retry Sync
          </button>
        </div>
      )}

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-high/50 border-b border-outline-variant/10 text-xs font-black text-on-surface-variant uppercase tracking-wider font-body">
                <th className="py-4 px-6 w-10"></th>
                <th className="py-4 px-4">Class Details</th>
                <th className="py-4 px-4">Identification Code</th>
                <th className="py-4 px-4">Allocated Sections</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface text-xs font-semibold font-body">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined animate-spin text-primary text-2xl">
                        progress_activity
                      </span>
                      <span className="font-bold text-xs tracking-tight">
                        Streaming relational dataset tables...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredClasses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                      <span className="material-symbols-outlined text-3xl text-outline">grid_off</span>
                      <p className="font-bold text-xs">No matching live class level clusters recorded.</p>
                      <p className="text-xs text-on-surface-variant font-medium">
                        Seed parameters through your administration interface panel.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClasses.map((cls) => {
                  const isExpanded = expandedClassId === cls.id;
                  const sections = sectionsCache[cls.id] || [];
                  const isLoadingSections = loadingSections[cls.id];

                  return (
                    <React.Fragment key={cls.id}>
                      <tr
                        onClick={() => toggleClassRow(cls.id)}
                        className={`transition-colors cursor-pointer group ${
                          isExpanded ? "bg-primary/5" : "hover:bg-surface-container-high/30"
                        }`}
                      >
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`material-symbols-outlined text-outline transition-transform duration-300 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                isExpanded
                                  ? "bg-primary text-white"
                                  : "bg-primary/10 text-primary border border-primary/20"
                              }`}
                            >
                              <span className="material-symbols-outlined text-base">meeting_room</span>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface group-hover:text-primary transition-colors font-headline">
                                {cls.name || "Unnamed Class Level"}
                              </p>
                              <p className="text-2xs text-on-surface-variant mt-0.5 font-mono font-body">
                                ID: {String(cls.id).substring(0, 8).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono text-on-surface-variant font-bold">
                          {cls.code || "UNASSIGNED"}
                        </td>

                        <td className="py-4 px-4">
                          <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded-full text-2xs font-bold font-body">
                            {(cls.sectionCount || cls.sections?.length || sections.length || 0)} Active
                            Sections
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-2xs font-black uppercase font-body ${
                              cls.status === "Active" || cls.is_active === true
                                ? "bg-success/10 text-success border border-success/20"
                                : "bg-surface-container-high text-on-surface-variant border border-outline-variant/20"
                            }`}
                          >
                            {cls.status || (cls.is_active ? "Active" : "Archived")}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => handleDeleteClass(cls.id, e)}
                            className="w-8 h-8 rounded-full bg-surface-container-lowest border border-outline-variant/10 text-on-surface-variant hover:text-error hover:bg-error/10 hover:border-error/20 flex items-center justify-center ml-auto transition-all shadow-sm outline-none"
                            title="Delete Class Level"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="6" className="bg-surface-container-high/30 p-0 border-b border-outline-variant/10">
                            <div className="px-16 py-6 animate-fadeIn">
                              <div className="flex justify-between items-center mb-4">
                                <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-wider font-headline">
                                  Sections under {cls.name}
                                </h4>
                              </div>

                              {isLoadingSections ? (
                                <div className="text-center py-6 text-on-surface-variant text-xs font-bold flex justify-center items-center gap-2 font-body">
                                  <span className="material-symbols-outlined animate-spin text-sm">
                                    refresh
                                  </span>
                                  Sorting and verifying strict section data...
                                </div>
                              ) : sections.length === 0 ? (
                                <div className="text-center py-6 bg-surface-container-lowest border border-outline-variant/10 rounded-lg text-on-surface-variant text-xs font-bold shadow-2xs font-body">
                                  No sections currently deployed to this class level.
                                </div>
                              ) : (
                                <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-lg overflow-hidden shadow-2xs">
                                  <table className="w-full text-left">
                                    <thead className="bg-surface-container-high/50 border-b border-outline-variant/10 text-2xs text-on-surface-variant uppercase tracking-wider font-black font-body">
                                      <tr>
                                        <th className="py-2.5 px-4">Section Name</th>
                                        <th className="py-2.5 px-4">Section Level</th>
                                        <th className="py-2.5 px-4 text-right">Remove</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/10 text-xs font-bold text-on-surface font-body">
                                      {sections.map((sec) => (
                                        <tr key={sec.id} className="hover:bg-surface-container-high/30 transition-colors">
                                          <td className="py-3 px-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                                            {cls.name} - {sec.name.replace("Section ", "Sec ")}
                                          </td>
                                          <td className="py-3 px-4 text-primary font-bold">{cls.name}</td>
                                          <td className="py-3 px-4 text-right">
                                            <button
                                              onClick={() => handleDeleteSection(cls.id, sec.id)}
                                              className="text-outline hover:text-error transition-colors outline-none"
                                              title="Delete Section"
                                            >
                                              <span className="material-symbols-outlined text-sm">close</span>
                                            </button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      
    </SchoolLayout>
  );
}