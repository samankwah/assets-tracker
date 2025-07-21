import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssetStore } from "../stores/assetStore";
import { ArrowLeft, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import usePageTitle from "../hooks/usePageTitle";

const AddAsset = () => {
  usePageTitle("Add New Asset");
  const navigate = useNavigate();
  const { createAsset } = useAssetStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "Apartment",
    status: "Under Maintenance",
    address: {
      street: "",
      city: "",
    },
    details: {
      bedrooms: "",
      bathrooms: "",
      floors: "",
      balcony: false,
      features: "",
    },
    condition: "Newly Built",
    inspectionDate: "",
    images: [],
  });

  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage = {
            file,
            preview: e.target.result,
            name: file.name,
          };
          setPreviewImages((prev) => [...prev, newImage]);
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, newImage],
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const assetData = {
        ...formData,
        images:
          formData.images.length > 0
            ? formData.images.map((img) => img.preview || img)
            : ["/api/placeholder/400/300"],
        inspectionStatus: "Not Inspected",
        lastInspection: null,
        nextInspection: formData.inspectionDate,
      };

      createAsset(assetData);
      toast.success("Asset created successfully!");
      navigate("/assets");
    } catch (error) {
      toast.error("Failed to create asset");
    } finally {
      setLoading(false);
    }
  };

  const mainImage =
    previewImages.length > 0
      ? previewImages[0].preview
      : "/api/placeholder/400/300";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/assets")}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Add New Asset
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Form */}
            <div className="space-y-6">
              {/* Upload Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Image(s)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  {previewImages.length > 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {previewImages.slice(0, 3).map((img, index) => (
                        <img
                          key={index}
                          src={img.preview}
                          alt={`Preview ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ))}
                      {previewImages.length > 3 && (
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                          +{previewImages.length - 3}
                        </div>
                      )}
                    </div>
                  ) : (
                    <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    Click to upload
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                    Or drag and drop
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                </div>
              </div>

              {/* Asset Name & Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asset Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Los Palmas"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asset Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Asset Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asset Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Apartment">Apartment</option>
                    <option value="House">House</option>
                    <option value="Condo">Condo</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asset Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Active">Active</option>
                    <option value="Decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>

              {/* Asset Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset Address
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    placeholder="Address Line"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    placeholder="City/Town"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Asset Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset Details
                </label>
                <div className="space-y-3">
                  <input
                    type="text"
                    name="details.features"
                    value={formData.details.features}
                    onChange={handleChange}
                    placeholder="Outdoor Features"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      name="details.bedrooms"
                      value={formData.details.bedrooms}
                      onChange={handleChange}
                      placeholder="Bedrooms"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <input
                      type="number"
                      name="details.floors"
                      value={formData.details.floors}
                      onChange={handleChange}
                      placeholder="Floors"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Monitoring Readiness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monitoring Readiness
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Newly Built">Newly Built</option>
                      <option value="Good">Good</option>
                      <option value="Fair">Fair</option>
                      <option value="Needs Repairs">Needs Repairs</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Inspection Date
                    </label>
                    <input
                      type="date"
                      name="inspectionDate"
                      value={formData.inspectionDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {loading && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  )}
                  Save Asset
                </button>
              </div>
            </div>

            {/* Right Column - Preview */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Preview
                </h3>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {/* Image Gallery */}
                  <div className="relative">
                    <img
                      src={mainImage}
                      alt="Asset Preview"
                      className="w-full h-64 object-cover"
                    />
                    {previewImages.length > 1 && (
                      <div className="absolute bottom-2 right-2 flex gap-1">
                        {previewImages.slice(1, 4).map((img, index) => (
                          <img
                            key={index}
                            src={img.preview}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border-2 border-white"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {formData.name || "Asset Name"}
                    </h4>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {formData.description ||
                        "Asset description will appear here..."}
                    </p>

                    {/* Asset Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 mr-2">
                          🛏️
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formData.details.bedrooms || "0"} Beds
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 mr-2">
                          🏠
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formData.type}
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 mr-2">
                          🏢
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formData.details.floors || "0"} Floors
                        </span>
                      </div>
                      <div className="flex items-center text-sm">
                        <span className="text-gray-500 dark:text-gray-400 mr-2">
                          🌿
                        </span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {formData.details.balcony ? "Balcony" : "No Balcony"}
                        </span>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="space-y-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          📍 Address:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {formData.address.street || "Address"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          📅 Inspection:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {formData.inspectionDate || "Not Scheduled"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          🔧 Status:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {formData.condition}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          🏷️ Type:
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white font-medium">
                          {formData.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAsset;
