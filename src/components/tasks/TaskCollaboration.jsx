import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Paperclip,
  Users,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Image,
  Download,
  Trash2,
  Edit,
  Reply
} from 'lucide-react';
import { useTaskStore } from '../../stores/taskStore';
import { useAuth } from '../../context/AuthContext';
import { format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

const TaskCollaboration = ({ taskId, isOpen, onClose }) => {
  const { tasks, updateTask } = useTaskStore();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [collaborators, setCollaborators] = useState([]);
  const [newCollaborator, setNewCollaborator] = useState('');

  useEffect(() => {
    if (taskId) {
      const foundTask = tasks.find(t => t.id === taskId);
      setTask(foundTask);
      loadTaskData(taskId);
    }
  }, [taskId, tasks]);

  const loadTaskData = (taskId) => {
    // Load from localStorage (in real app, this would be from API)
    const savedComments = localStorage.getItem(`task_comments_${taskId}`);
    const savedAttachments = localStorage.getItem(`task_attachments_${taskId}`);
    const savedActivity = localStorage.getItem(`task_activity_${taskId}`);
    const savedCollaborators = localStorage.getItem(`task_collaborators_${taskId}`);

    if (savedComments) setComments(JSON.parse(savedComments));
    if (savedAttachments) setAttachments(JSON.parse(savedAttachments));
    if (savedActivity) setActivityLog(JSON.parse(savedActivity));
    if (savedCollaborators) setCollaborators(JSON.parse(savedCollaborators));
  };

  const saveTaskData = (type, data) => {
    localStorage.setItem(`task_${type}_${taskId}`, JSON.stringify(data));
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment = {
      id: Date.now(),
      text: newComment,
      author: user?.firstName + ' ' + user?.lastName || 'Current User',
      authorId: user?.id || 'current',
      timestamp: new Date().toISOString(),
      type: 'comment'
    };

    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    saveTaskData('comments', updatedComments);

    // Add to activity log
    addActivity(`${comment.author} added a comment`, 'comment');

    setNewComment('');
    toast.success('Comment added');
  };

  const addActivity = (description, type = 'update') => {
    const activity = {
      id: Date.now(),
      description,
      type,
      timestamp: new Date().toISOString(),
      user: user?.firstName + ' ' + user?.lastName || 'Current User'
    };

    const updatedActivity = [activity, ...activityLog];
    setActivityLog(updatedActivity);
    saveTaskData('activity', updatedActivity);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const attachment = {
        id: Date.now() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        uploadedBy: user?.firstName + ' ' + user?.lastName || 'Current User',
        uploadedAt: new Date().toISOString(),
        url: URL.createObjectURL(file) // In real app, upload to server
      };

      const updatedAttachments = [attachment, ...attachments];
      setAttachments(updatedAttachments);
      saveTaskData('attachments', updatedAttachments);

      addActivity(`${attachment.uploadedBy} uploaded ${file.name}`, 'attachment');
    });

    toast.success(`${files.length} file(s) uploaded`);
  };

  const deleteAttachment = (attachmentId) => {
    const attachment = attachments.find(a => a.id === attachmentId);
    const updatedAttachments = attachments.filter(a => a.id !== attachmentId);
    setAttachments(updatedAttachments);
    saveTaskData('attachments', updatedAttachments);

    if (attachment) {
      addActivity(`${user?.firstName + ' ' + user?.lastName} deleted ${attachment.name}`, 'delete');
    }

    toast.success('Attachment deleted');
  };

  const addCollaborator = () => {
    if (!newCollaborator.trim()) return;

    const collaborator = {
      id: Date.now(),
      name: newCollaborator,
      email: `${newCollaborator.toLowerCase().replace(' ', '.')}@company.com`,
      role: 'Collaborator',
      addedAt: new Date().toISOString(),
      addedBy: user?.firstName + ' ' + user?.lastName || 'Current User'
    };

    const updatedCollaborators = [collaborator, ...collaborators];
    setCollaborators(updatedCollaborators);
    saveTaskData('collaborators', updatedCollaborators);

    addActivity(`${collaborator.addedBy} added ${collaborator.name} as a collaborator`, 'collaborator');

    setNewCollaborator('');
    toast.success('Collaborator added');
  };

  const removeCollaborator = (collaboratorId) => {
    const collaborator = collaborators.find(c => c.id === collaboratorId);
    const updatedCollaborators = collaborators.filter(c => c.id !== collaboratorId);
    setCollaborators(updatedCollaborators);
    saveTaskData('collaborators', updatedCollaborators);

    if (collaborator) {
      addActivity(`${user?.firstName + ' ' + user?.lastName} removed ${collaborator.name} as a collaborator`, 'collaborator');
    }

    toast.success('Collaborator removed');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'attachment': return <Paperclip className="w-4 h-4 text-green-600" />;
      case 'collaborator': return <Users className="w-4 h-4 text-purple-600" />;
      case 'update': return <Edit className="w-4 h-4 text-orange-600" />;
      case 'delete': return <Trash2 className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{task.title}</h2>
              <p className="text-gray-600 dark:text-gray-400">Task Collaboration</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-4">
            {[
              { key: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
              { key: 'attachments', label: 'Attachments', icon: Paperclip, count: attachments.length },
              { key: 'collaborators', label: 'Collaborators', icon: Users, count: collaborators.length },
              { key: 'activity', label: 'Activity', icon: Clock, count: activityLog.length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div className="space-y-4">
              {/* Add Comment */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={addComment}
                    disabled={!newComment.trim()}
                    className="btn-primary flex items-center"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{comment.author}</h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {format(parseISO(comment.timestamp), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="mt-2 text-gray-700 dark:text-gray-300">{comment.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Comments Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400">Start the conversation by adding a comment.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <div className="space-y-4">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                <div className="text-center">
                  <Paperclip className="w-8 h-8 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">Drop files here or</p>
                  <label className="btn-primary cursor-pointer">
                    Choose Files
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Attachments List */}
              <div className="space-y-3">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(attachment.type)}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{attachment.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy} • {format(parseISO(attachment.uploadedAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={attachment.url}
                        download={attachment.name}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => deleteAttachment(attachment.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <div className="text-center py-12">
                    <Paperclip className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Attachments</h3>
                    <p className="text-gray-600 dark:text-gray-400">Upload files to share with your team.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Collaborators Tab */}
          {activeTab === 'collaborators' && (
            <div className="space-y-4">
              {/* Add Collaborator */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newCollaborator}
                    onChange={(e) => setNewCollaborator(e.target.value)}
                    placeholder="Enter collaborator name..."
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={addCollaborator}
                    disabled={!newCollaborator.trim()}
                    className="btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Collaborators List */}
              <div className="space-y-3">
                {collaborators.map(collaborator => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{collaborator.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {collaborator.email} • {collaborator.role}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCollaborator(collaborator.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {collaborators.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Collaborators</h3>
                    <p className="text-gray-600 dark:text-gray-400">Add team members to collaborate on this task.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activityLog.map(activity => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white">{activity.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(parseISO(activity.timestamp), 'MMM dd, yyyy HH:mm')} by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
              {activityLog.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Activity</h3>
                  <p className="text-gray-600 dark:text-gray-400">Activity will appear here as team members interact with this task.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCollaboration;