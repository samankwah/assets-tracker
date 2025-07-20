import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTaskStore } from "../stores/taskStore";
import { useAssetStore } from "../stores/assetStore";
import usePageTitle from "../hooks/usePageTitle";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  Building,
  Upload,
  X,
  Link,
  Bookmark,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const AddTask = () => {
  usePageTitle("Add Task");
  const navigate = useNavigate();

  const { createTask } = useTaskStore();
  const { assets } = useAssetStore();

  const [formData, setFormData] = useState({
    title: "",
    assetId: "",
    type: "General Maintenance",
    priority: "Low",
    dueDate: "",
    assignedTo: "",
    notificationEnabled: "Yes",
    notificationTime: "2 days before",
  });

  const [previewAsset, setPreviewAsset] = useState(null);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const taskTypes = [
    "General Maintenance",
    "Inspection",
    "Safety Check",
    "Cleaning",
    "Planning",
    "Repair",
    "Renovation",
  ];

  const priorities = [
    { value: "Low", color: "text-blue-600", bg: "bg-blue-100", icon: "●" },
    {
      value: "Medium",
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      icon: "♦",
    },
    { value: "High", color: "text-red-600", bg: "bg-red-100", icon: "♦" },
  ];

  const notificationTimes = [
    "1 hour before",
    "2 hours before",
    "1 day before",
    "2 days before",
    "3 days before",
    "1 week before",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update preview asset when asset selection changes
    if (name === "assetId" && value) {
      const selectedAsset = assets.find(
        (asset) => asset.id.toString() === value
      );
      setPreviewAsset(selectedAsset);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 5 * 1024 * 1024; // 5MB

    files.forEach((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB.`);
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image file.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          id: Date.now() + Math.random(),
          file,
          preview: e.target.result,
          name: file.name,
          size: file.size,
        };
        setUploadedImages((prev) => [...prev, imageData]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (imageId) => {
    setUploadedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Set default time if not provided
      const defaultTime = "08:00";
      const dueDateTime = new Date(`${formData.dueDate}T${defaultTime}:00`);

      const taskData = {
        ...formData,
        assetId: parseInt(formData.assetId),
        assetName: previewAsset?.name || "",
        dueDate: dueDateTime.toISOString(),
        time: defaultTime,
        frequency: "One-time",
        description: `${formData.type} task for ${
          previewAsset?.name || "selected asset"
        }`,
        notifications: {
          email: formData.notificationEnabled === "Yes",
          sms: false,
          inApp: true,
        },
        notificationSettings: {
          type: "Email",
          reminderTime: formData.notificationTime,
        },
        images: uploadedImages.map((img) => ({
          id: img.id,
          name: img.name,
          size: img.size,
          url: img.preview, // In real app, this would be uploaded to server
        })),
      };

      createTask(taskData);
      toast.success("Task created successfully!");
      navigate("/tasks");
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  const selectedPriority = priorities.find(
    (p) => p.value === formData.priority
  );

  // Header button handlers
  const handleClose = () => {
    if (Object.values(formData).some(value => value !== '' && value !== 'General Maintenance' && value !== 'Low' && value !== 'Yes' && value !== '2 days before') || uploadedImages.length > 0) {
      if (window.confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
        navigate('/tasks');
      }
    } else {
      navigate('/tasks');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Add Task',
        text: 'Create a new maintenance task',
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard!'))
        .catch(() => toast.error('Failed to copy link'));
    }
  };

  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data?')) {
      setFormData({
        title: "",
        assetId: "",
        type: "General Maintenance",
        priority: "Low",
        dueDate: "",
        assignedTo: "",
        notificationEnabled: "Yes",
        notificationTime: "2 days before",
      });
      setUploadedImages([]);
      setPreviewAsset(null);
      toast.success('Form cleared successfully');
    }
  };

  const handleBookmark = () => {
    // Save current form data to localStorage as a draft
    const draftData = {
      ...formData,
      images: uploadedImages,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('taskDraft', JSON.stringify(draftData));
    toast.success('Task saved as draft!');
  };

  // Load draft on component mount
  const loadDraft = () => {
    const savedDraft = localStorage.getItem('taskDraft');
    if (savedDraft) {
      setHasDraft(true);
      try {
        const draftData = JSON.parse(savedDraft);
        if (window.confirm('A saved draft was found. Would you like to load it?')) {
          setFormData({
            title: draftData.title || "",
            assetId: draftData.assetId || "",
            type: draftData.type || "General Maintenance",
            priority: draftData.priority || "Low",
            dueDate: draftData.dueDate || "",
            assignedTo: draftData.assignedTo || "",
            notificationEnabled: draftData.notificationEnabled || "Yes",
            notificationTime: draftData.notificationTime || "2 days before",
          });
          if (draftData.images && draftData.images.length > 0) {
            setUploadedImages(draftData.images);
          }
          toast.success('Draft loaded successfully');
          localStorage.removeItem('taskDraft'); // Remove draft after loading
          setHasDraft(false);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('taskDraft'); // Remove corrupted draft
        setHasDraft(false);
      }
    }
  };

  // Load draft on component mount
  useEffect(() => {
    const timer = setTimeout(loadDraft, 500); // Small delay to ensure component is mounted
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b rounded-xl border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/tasks")}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add Task
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Close (with unsaved changes warning)"
              >
                <X className="w-5 h-5" />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Share or copy link"
              >
                <Link className="w-5 h-5" />
              </button>
              <button 
                onClick={handleClearForm}
                className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Clear all form data"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={handleBookmark}
                className={`p-2 transition-colors relative ${
                  hasDraft 
                    ? 'text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300' 
                    : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
                title={hasDraft ? "Draft available - Save current state" : "Save as draft"}
              >
                <Bookmark className={`w-5 h-5 ${hasDraft ? 'fill-current' : ''}`} />
                {hasDraft && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              {/* Single Card Container */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm space-y-6">
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Roof Inspection for Block C"
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    required
                  />
                </div>

                {/* Select Asset */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Select Asset
                  </label>
                  <select
                    name="assetId"
                    value={formData.assetId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                    required
                  >
                    <option value="">No 4 Calgary Street</option>
                    {assets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} - {asset.address?.city || "N/A"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Task Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    {taskTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.value}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date and Add Notification - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pr-10 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                      />
                      {/* <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /> */}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Date must be in YYYY-MM-DD (2025-07-28) format
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Add Notification
                    </label>
                    <select
                      name="notificationEnabled"
                      value={formData.notificationEnabled}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                    >
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>
                </div>

                {/* When To Notify */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    When To Notify
                  </label>
                  <select
                    name="notificationTime"
                    value={formData.notificationTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white appearance-none"
                  >
                    {notificationTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Compact Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                    Upload Images
                  </label>

                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer flex items-center justify-center space-x-2"
                    >
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to upload images (PNG, JPG, GIF up to 5MB each)
                      </span>
                    </label>
                  </div>

                  {/* Compact Uploaded Images */}
                  {uploadedImages.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {uploadedImages.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.preview}
                              alt={image.name}
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(image.id)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        {uploadedImages.length} image(s) uploaded
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating...
                      </div>
                    ) : (
                      "Submit"
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Preview Task
                </h3>

                {/* Asset Images - Show uploaded images or placeholders */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {uploadedImages.length > 0 ? (
                    <>
                      {uploadedImages.slice(0, 3).map((image, index) => (
                        <div
                          key={image.id}
                          className="aspect-square rounded-lg overflow-hidden"
                        >
                          <img
                            src={image.preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {/* Fill remaining slots with placeholders if needed */}
                      {uploadedImages.length < 3 &&
                        Array.from({ length: 3 - uploadedImages.length }).map(
                          (_, index) => (
                            <div
                              key={`placeholder-${index}`}
                              className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"
                            ></div>
                          )
                        )}
                    </>
                  ) : (
                    <>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="aspect-square bg-blue-200 dark:bg-blue-800 rounded-lg"></div>
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Property
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {previewAsset?.name || "Las Palmas Condo"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Task Type
                    </span>
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          selectedPriority?.bg || "bg-blue-100"
                        }`}
                      ></span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.type}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Due Date
                    </span>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.dueDate
                          ? new Date(formData.dueDate).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )
                          : "July 23rd 2025"}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Priority
                    </span>
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          selectedPriority?.bg || "bg-red-100"
                        }`}
                      ></span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formData.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Time
                    </span>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        08:00 AM
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Task Status
                    </span>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        Not Inspected
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Notification Type
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      Email
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating...
                    </div>
                  ) : (
                    "Create Task"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTask;
