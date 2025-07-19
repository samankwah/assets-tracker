import { useState } from 'react';
import { X, Search, Clock, Users, CheckCircle, Copy, Filter } from 'lucide-react';
import { taskTemplates, getTemplatesByType, searchTemplates } from '../../data/taskTemplates';
import toast from 'react-hot-toast';

const TaskTemplateModal = ({ isOpen, onClose, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  if (!isOpen) return null;

  const filteredTemplates = () => {
    let templates = taskTemplates;
    
    if (selectedType) {
      templates = getTemplatesByType(selectedType);
    }
    
    if (searchTerm) {
      templates = searchTemplates(searchTerm).filter(template => 
        !selectedType || template.type === selectedType
      );
    }
    
    return templates;
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      toast.success(`Template "${selectedTemplate.name}" applied successfully`);
      onClose();
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  const templates = filteredTemplates();
  const types = [...new Set(taskTemplates.map(t => t.type))];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-full max-h-[90vh] flex overflow-hidden">
        {/* Left Panel - Template List */}
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Templates</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose from pre-built maintenance templates</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="mt-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                {types.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              {templates.length} template{templates.length !== 1 ? 's' : ''} found
            </div>
          </div>

          {/* Template List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.priority === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      template.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {template.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatDuration(template.estimatedDuration)}
                      </span>
                      <span className={`px-2 py-1 rounded-full ${
                        template.type === 'Inspection' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        template.type === 'Maintenance' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                        template.type === 'Cleaning' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        template.type === 'Repair' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {template.type}
                      </span>
                      <span>{template.frequency}</span>
                    </div>
                    <span className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {template.checklist.length} items
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {templates.length === 0 && (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">
                  <Search className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Template Details */}
        <div className="w-1/2 flex flex-col">
          {selectedTemplate ? (
            <>
              {/* Template Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {selectedTemplate.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  <button
                    onClick={handleUseTemplate}
                    className="btn-primary flex items-center"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Use Template
                  </button>
                </div>

                {/* Template Meta */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {formatDuration(selectedTemplate.estimatedDuration)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400">Frequency:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {selectedTemplate.frequency}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                      {selectedTemplate.type}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                    <span className={`ml-1 font-medium ${
                      selectedTemplate.priority === 'High' ? 'text-red-600 dark:text-red-400' :
                      selectedTemplate.priority === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      {selectedTemplate.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Template Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Checklist */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Checklist ({selectedTemplate.checklist.length} items)
                    </h4>
                    <div className="space-y-2">
                      {selectedTemplate.checklist.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 mt-0.5 mr-3 text-gray-400" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Required Tools */}
                  {selectedTemplate.requiredTools && selectedTemplate.requiredTools.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Required Tools & Materials
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.requiredTools.map((tool, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedTemplate.notes && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Additional Notes
                      </h4>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-gray-700 dark:text-gray-300">
                          {selectedTemplate.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <CheckCircle className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a Template
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose a template from the list to view its details and checklist
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskTemplateModal;