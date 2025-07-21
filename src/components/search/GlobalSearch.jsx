import { useState, useEffect, useRef } from "react";
import { useClickOutsideAndEscape } from "../../hooks/useClickOutside";
import {
  Search,
  Filter,
  X,
  Building,
  Calendar,
  CheckSquare,
  User,
  Clock,
  MapPin,
  AlertCircle,
  FileText,
  Tag,
  Save,
  Bookmark,
  Star,
} from "lucide-react";
import { useAssetStore } from "../../stores/assetStore";
import { useTaskStore } from "../../stores/taskStore";
import { useSearchStore } from "../../stores/searchStore";
import { useNavigate } from "react-router-dom";
import SearchSuggestions from "./SearchSuggestions";
import SavedSearches from "./SavedSearches";
import SavedSearchModal from "./SavedSearchModal";
import savedSearchService from "../../services/savedSearchService";

const GlobalSearch = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    type: "all",
    status: "all",
    priority: "all",
  });
  const [searchResults, setSearchResults] = useState({
    assets: [],
    tasks: [],
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showSavedSearches, setShowSavedSearches] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [quickAccessSearches, setQuickAccessSearches] = useState([]);

  const { assets, getAssetById } = useAssetStore();
  const { tasks } = useTaskStore();
  const { addToHistory, addToRecent, saveSearch } = useSearchStore();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  
  // Add click outside functionality
  const searchContainerRef = useClickOutsideAndEscape(onClose, isOpen);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    // Load quick access searches
    setQuickAccessSearches(savedSearchService.getQuickAccessSearches());
  }, [isOpen]);

  useEffect(() => {
    if (
      searchTerm.trim() ||
      selectedFilters.type !== "all" ||
      selectedFilters.status !== "all" ||
      selectedFilters.priority !== "all"
    ) {
      performSearch();
    } else {
      setSearchResults({ assets: [], tasks: [], total: 0 });
    }
  }, [searchTerm, selectedFilters]);

  const performSearch = async () => {
    setIsLoading(true);

    try {
      const searchLower = searchTerm.toLowerCase();

      // Search assets
      const filteredAssets = assets.filter((asset) => {
        const matchesSearch =
          !searchTerm ||
          asset.name.toLowerCase().includes(searchLower) ||
          asset.description?.toLowerCase().includes(searchLower) ||
          asset.serialNumber?.toLowerCase().includes(searchLower) ||
          asset.location?.toLowerCase().includes(searchLower) ||
          asset.type?.toLowerCase().includes(searchLower) ||
          asset.status?.toLowerCase().includes(searchLower) ||
          asset.address?.city?.toLowerCase().includes(searchLower) ||
          asset.address?.state?.toLowerCase().includes(searchLower);

        const matchesType =
          selectedFilters.type === "all" || selectedFilters.type === "assets";
        const matchesStatus =
          selectedFilters.status === "all" ||
          asset.status === selectedFilters.status;

        return matchesSearch && matchesType && matchesStatus;
      });

      // Search tasks
      const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
          !searchTerm ||
          task.title?.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower) ||
          task.type?.toLowerCase().includes(searchLower) ||
          task.assignedTo?.toLowerCase().includes(searchLower) ||
          task.assetName?.toLowerCase().includes(searchLower);

        const matchesType =
          selectedFilters.type === "all" || selectedFilters.type === "tasks";
        const matchesStatus =
          selectedFilters.status === "all" ||
          task.status === selectedFilters.status;
        const matchesPriority =
          selectedFilters.priority === "all" ||
          task.priority === selectedFilters.priority;

        return matchesSearch && matchesType && matchesStatus && matchesPriority;
      });

      const results = {
        assets: filteredAssets,
        tasks: filteredTasks,
        total: filteredAssets.length + filteredTasks.length,
      };

      setSearchResults(results);

      // Add to search history if there's a search term
      if (searchTerm.trim()) {
        addToHistory(searchTerm, results);
        addToRecent(searchTerm);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults({ assets: [], tasks: [], total: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleResultClick = (result, type) => {
    setSelectedResult(result);
    if (type === "asset") {
      navigate(`/assets`);
    } else if (type === "task") {
      navigate(`/tasks`);
    }
    onClose();
  };

  const getAssetIcon = (type) => {
    switch (type) {
      case "Building":
        return <Building className="w-4 h-4" />;
      case "Equipment":
        return <FileText className="w-4 h-4" />;
      default:
        return <Building className="w-4 h-4" />;
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case "Inspection":
        return <CheckSquare className="w-4 h-4" />;
      case "Maintenance":
        return <FileText className="w-4 h-4" />;
      case "Safety Check":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <CheckSquare className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "Maintenance":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "In Progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "Overdue":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "Low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const clearFilters = () => {
    setSelectedFilters({
      type: "all",
      status: "all",
      priority: "all",
    });
  };

  const handleSaveSearch = () => {
    if (searchTerm.trim() || hasActiveFilters) {
      setShowSaveModal(true);
    }
  };

  const handleExecuteSavedSearch = (search, result) => {
    setSearchTerm(search.query || '');
    setSelectedFilters(search.filters || {
      type: "all",
      status: "all",
      priority: "all",
    });
    setShowSavedSearches(false);
  };

  const handleSaveSearchComplete = (savedSearch) => {
    setQuickAccessSearches(savedSearchService.getQuickAccessSearches());
    setShowSaveModal(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
  };

  const hasActiveFilters =
    selectedFilters.type !== "all" ||
    selectedFilters.status !== "all" ||
    selectedFilters.priority !== "all";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div ref={searchContainerRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Global Search
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search assets, tasks, and more..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Filters:
              </span>
            </div>

            <select
              value={selectedFilters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="assets">Assets</option>
              <option value="tasks">Tasks</option>
            </select>

            <select
              value={selectedFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Overdue">Overdue</option>
            </select>

            <select
              value={selectedFilters.priority}
              onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Priority</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Clear Filters
              </button>
            )}

            <button
              onClick={() => setShowSavedSearches(true)}
              className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved Searches</span>
            </button>

            {(searchTerm || hasActiveFilters) && (
              <button
                onClick={handleSaveSearch}
                className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <Save className="w-4 h-4" />
                <span>Save Search</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Access Searches */}
        {quickAccessSearches.length > 0 && !searchTerm && searchResults.total === 0 && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Access Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {quickAccessSearches.map(search => (
                <button
                  key={search.id}
                  onClick={() => handleExecuteSavedSearch(search)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-sm">{search.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {!searchTerm && searchResults.total === 0 ? (
            <SearchSuggestions
              searchTerm={searchTerm}
              onSuggestionClick={handleSuggestionClick}
              onSearchTermChange={setSearchTerm}
            />
          ) : (
            <div className="p-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    Searching...
                  </span>
                </div>
              ) : searchResults.total > 0 ? (
                <div className="space-y-6">
                  {/* Results Summary */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Found {searchResults.total} result
                    {searchResults.total !== 1 ? "s" : ""}
                    {searchTerm && ` for "${searchTerm}"`}
                  </div>

                  {/* Assets Results */}
                  {searchResults.assets.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        Assets ({searchResults.assets.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.assets.map((asset) => (
                          <div
                            key={asset.id}
                            onClick={() => handleResultClick(asset, "asset")}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {getAssetIcon(asset.type)}
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {asset.name}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {asset.description}
                                </p>
                                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{asset.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Tag className="w-3 h-3" />
                                    <span>{asset.type}</span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                  asset.status
                                )}`}
                              >
                                {asset.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tasks Results */}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <CheckSquare className="w-5 h-5 mr-2" />
                        Tasks ({searchResults.tasks.length})
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.tasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => handleResultClick(task, "task")}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {getTaskIcon(task.type)}
                                  <h4 className="font-medium text-gray-900 dark:text-white">
                                    {task.title}
                                  </h4>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {task.description}
                                </p>
                                <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {new Date(
                                        task.dueDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <User className="w-3 h-3" />
                                    <span>
                                      {task.assignedTo || "Unassigned"}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Building className="w-3 h-3" />
                                    <span>{task.assetName}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getStatusColor(
                                    task.status
                                  )}`}
                                >
                                  {task.status}
                                </span>
                                <span
                                  className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : searchTerm || hasActiveFilters ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No results found
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Try adjusting your search terms or filters
                  </p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    Start typing to search
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                    Search across assets, tasks, and more
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Keyboard Shortcuts */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>
                  Press{" "}
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    Escape
                  </kbd>{" "}
                  to close
                </span>
                <span>
                  Press{" "}
                  <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    Enter
                  </kbd>{" "}
                  to select
                </span>
              </div>
              <div>
                {searchResults.total > 0 && (
                  <span>
                    {searchResults.total} result
                    {searchResults.total !== 1 ? "s" : ""} found
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Searches Modal */}
      {showSavedSearches && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <SavedSearches
            onExecuteSearch={handleExecuteSavedSearch}
            currentEntityType={selectedFilters.type === 'all' ? 'assets' : selectedFilters.type}
            onClose={() => setShowSavedSearches(false)}
          />
        </div>
      )}

      {/* Save Search Modal */}
      <SavedSearchModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveSearchComplete}
        searchData={{
          query: searchTerm,
          filters: selectedFilters,
          entityType: selectedFilters.type === 'all' ? 'assets' : selectedFilters.type,
          resultCount: searchResults.total
        }}
      />
    </div>
  );
};

export default GlobalSearch;
