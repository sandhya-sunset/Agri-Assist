import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Camera,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Leaf,
  Sparkles,
  TrendingUp,
  ShoppingCart,
  History,
  Info,
  ArrowRight,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  Shield,
  MessageCircle,
  Eye,
  MessageSquare,
} from "lucide-react";
import Navbar from "../Components/Navbar";

const DiseaseDetection = () => {
  const apiBaseUrl = "http://localhost:5000";
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState("");
  const plantOptions = [
    "Apple", "Blueberry", "Cherry", "Corn", "Grape",
    "Orange", "Peach", "Pepper", "Potato", "Raspberry",
    "Soybean", "Squash", "Strawberry", "Tomato"
  ];
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [selectedRecentResult, setSelectedRecentResult] = useState(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isHistoryDetailLoading, setIsHistoryDetailLoading] = useState(false);
  const [activeHistoryId, setActiveHistoryId] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [forumPosts, setForumPosts] = useState([]);
  const [forumLoading, setForumLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDetectionHistory();
    fetchRecentForumPosts();
  }, []);

  const fetchRecentForumPosts = async () => {
    try {
      setForumLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/forum?sortBy=latest"
      );
      const data = await response.json();
      if (data.success) {
        setForumPosts(data.data.slice(0, 3));
      }
    } catch (err) {
      console.error("Error fetching forum posts:", err);
    } finally {
      setForumLoading(false);
    }
  };

  const fetchDetectionHistory = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/detection/history`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDetectionHistory(data.data);
        if (data.data.length > 0 && !activeHistoryId) {
          const latestDetection = data.data[0];
          setActiveHistoryId(latestDetection._id);
          setSelectedRecentResult(buildResultFromDetection(latestDetection));
        }
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const buildResultFromDetection = (detection) => ({
    detectionId: detection._id,
    disease: detection.diseaseDetected,
    confidence: Number(detection.confidence).toFixed(2),
    recommendations: groupRecommendationDetails(detection),
    imagePath: detection.imagePath,
  });

  const groupRecommendationDetails = (detection) => {
    if (detection.recommendationDetails) {
      return detection.recommendationDetails;
    }

    const groupedRecommendations = {
      fertilizers: [],
      boosters: [],
      pesticides: [],
      treatments: [],
    };

    (detection.recommendations || []).forEach((item) => {
      if (item.type === "fertilizer") groupedRecommendations.fertilizers.push(item);
      if (item.type === "booster") groupedRecommendations.boosters.push(item);
      if (item.type === "pesticide") groupedRecommendations.pesticides.push(item);
      if (item.type === "treatment") groupedRecommendations.treatments.push(item);
    });

    return {
      diseaseName: detection.diseaseDetected,
      plantType: detection.plantType,
      description:
        detection.plantType
          ? `Saved detection for ${detection.plantType}. Review the recommended care products and next steps below.`
          : "Saved detection record. Review the recommended care products and next steps below.",
      preventionTips: [],
      symptoms: [],
      ...groupedRecommendations,
    };
  };

  const loadDetectionDetails = async (detectionId, shouldCloseModal = false) => {
    try {
      setIsHistoryDetailLoading(true);
      setActiveHistoryId(detectionId);
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiBaseUrl}/api/detection/${detectionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.message || "Failed to load detection details");
        return;
      }

      const detection = data.data;
      const nextResult = buildResultFromDetection(detection);

      setSelectedImage(null);
      setPreviewUrl(`${apiBaseUrl}/${detection.imagePath}`);
      setResult(nextResult);
      setSelectedRecentResult(nextResult);
      setError(null);

      if (shouldCloseModal) {
        setIsHistoryModalOpen(false);
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Error loading detection details:", err);
      setError("Failed to load detection details. Please try again.");
    } finally {
      setIsHistoryDetailLoading(false);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setRecordToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/detection/${recordToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await response.json();
      if (data.success) {
        setDetectionHistory((prev) =>
          prev.filter((item) => item._id !== recordToDelete),
        );
        if (activeHistoryId === recordToDelete) {
          setActiveHistoryId(null);
          const nextDetection = detectionHistory.find(
            (item) => item._id !== recordToDelete,
          );
          setSelectedRecentResult(
            nextDetection ? buildResultFromDetection(nextDetection) : null,
          );
        }
        if (result?.detectionId === recordToDelete) {
          resetAnalysis();
        }
        setDeleteModalOpen(false);
        setRecordToDelete(null);
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error("Error deleting detection:", err);
      alert("Error deleting detection");
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError("Image size must be less than 10MB");
        return;
      }
      // Reset all state when new image is selected
      setResult(null);
      setError(null);
      setSelectedImage(file);
      setSelectedPlant("");
      setPreviewUrl(URL.createObjectURL(file));
      console.log("New image selected:", file.name);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    if (!selectedPlant) {
      setError("Please select the plant type first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("plantType", selectedPlant);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${apiBaseUrl}/api/detection/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      console.log("Detection response:", data);
      console.log("Recommendations received:", data.data?.recommendations);

      if (data.success) {
        setPreviewUrl(`${apiBaseUrl}/${data.data.imagePath}`);
        setResult(data.data);
        setSelectedRecentResult(data.data);
        setActiveHistoryId(data.data.detectionId);
        fetchDetectionHistory();
      } else {
        setError(data.message || "Analysis failed");
      }
    } catch (err) {
      setError("Failed to analyze image. Please try again.");
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setSelectedPlant("");
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const recentDetections = detectionHistory.slice(0, 5);

  // eslint-disable-next-line no-unused-vars
  const getSeverityColor = (confidence) => {
    if (confidence >= 90) return "text-red-600 bg-red-50 border-red-200";
    if (confidence >= 70)
      return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-yellow-600 bg-yellow-50 border-yellow-200";
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return "bg-green-500";
    if (confidence >= 70) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const formatDiseaseLabel = (value) => {
    if (!value) return "Unknown Disease";

    return value
      .replace(/___/g, " - ")
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const handleBuyNow = (productName, productType = "Fertilizer") => {
    // First, try to extract meaningful keywords from the recommendation name
    const commonSuffixes = ["Spray", "Booster", "Soap", "Oil", "Fertilizer", "Powder", "Liquid", "Solution", "Mix", "Treatment"];
    const words = productName.split(" ").filter(word => word.length > 0);

    // Remove common disease/plant prefixes and suffixes
    let filteredWords = words.filter(word => {
      const lowerWord = word.toLowerCase();
      return !commonSuffixes.includes(word) &&
        !["recovery", "protection", "cure", "control", "preventive"].includes(lowerWord) &&
        word.length > 2; // Only keep meaningful words (3+ characters)
    });

    // If we filtered too much, keep at least the first 2 original words
    if (filteredWords.length === 0) {
      filteredWords = words.slice(0, 2);
    }

    // Build search query from filtered words
    let searchQuery = filteredWords.slice(0, 3).join(" ").trim();

    // If search query is empty or very short, use the product type as fallback
    if (!searchQuery || searchQuery.length < 3) {
      searchQuery = productType; // Search by category like "Fertilizer" or "Pesticide"
    }

    navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
  };

  const renderDetectionSummary = (detectionResult) => {
    if (!detectionResult?.recommendations) {
      return null;
    }

    return (
      <div className="space-y-6">
        <div className="p-6 bg-linear-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-600 mb-1">
                Detected Disease
              </p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatDiseaseLabel(detectionResult.disease)}
              </h3>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-700">
                Confidence Level
              </span>
              <span className="text-sm font-bold text-gray-900">
                {detectionResult.confidence}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${getConfidenceColor(parseFloat(detectionResult.confidence))}`}
                style={{ width: `${detectionResult.confidence}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-2xl border border-green-100 bg-green-50/70">
            <p className="text-xs font-bold uppercase tracking-wide text-green-700 mb-2">
              Care Summary
            </p>
            <p className="text-sm text-gray-700 leading-6">
              {detectionResult.recommendations.description}
            </p>
          </div>
          {detectionResult.recommendations.preventionTips?.length > 0 && (
            <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50/70">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-700 mb-2">
                Prevention Tips
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                {detectionResult.recommendations.preventionTips.slice(0, 3).map((tip, idx) => (
                  <li key={idx} className="flex gap-2">
                    <Shield size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {(detectionResult.recommendations.fertilizers?.length > 0 || detectionResult.recommendations.boosters?.length > 0 || detectionResult.recommendations.pesticides?.length > 0) && (
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <ShoppingCart size={18} className="text-green-600" />
              Recommended Care Products
            </h4>
            <div className="space-y-4">
              {detectionResult.recommendations.fertilizers?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-700">Fertilizers</p>
                  {detectionResult.recommendations.fertilizers.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-green-200 rounded-xl shadow-sm">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h5 className="font-bold text-gray-900">{item.name}</h5>
                        <button
                          onClick={() => handleBuyNow(item.name, "Fertilizer")}
                          className="text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded whitespace-nowrap transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Dosage: {item.dosage}</span>
                        <span className="text-xs text-gray-500">{item.applicationMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detectionResult.recommendations.boosters?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-700">Plant Boosters</p>
                  {detectionResult.recommendations.boosters.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-emerald-200 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-gray-900">{item.name}</h5>
                          <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                            Booster
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyNow(item.name, "Booster")}
                          className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded whitespace-nowrap transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">Dosage: {item.dosage}</span>
                        <span className="text-xs text-gray-500">{item.applicationMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {detectionResult.recommendations.pesticides?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-gray-700">Nature-Friendly Pesticides</p>
                  {detectionResult.recommendations.pesticides.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="p-4 bg-white border border-orange-200 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-bold text-gray-900">{item.name}</h5>
                          <span className="text-[11px] font-bold uppercase tracking-wide text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                            Eco Care
                          </span>
                        </div>
                        <button
                          onClick={() => handleBuyNow(item.name, "Pesticide")}
                          className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1 rounded whitespace-nowrap transition-colors"
                        >
                          Buy Now
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex flex-wrap items-center gap-2 justify-between">
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded">Dosage: {item.dosage}</span>
                        <span className="text-xs text-gray-500">{item.applicationMethod}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {detectionResult.recommendations.treatments?.length > 0 && (
          <div>
            <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Info size={18} className="text-blue-600" />
              What To Do Next
            </h4>
            <div className="space-y-3">
              {detectionResult.recommendations.treatments.slice(0, 1).map((treatment, idx) => (
                <div key={idx} className="p-4 bg-white border border-blue-200 rounded-xl shadow-sm">
                  <h5 className="font-bold text-gray-900 mb-2">{treatment.name}</h5>
                  {treatment.description && (
                    <p className="text-sm text-gray-600 mb-3">{treatment.description}</p>
                  )}
                  {treatment.steps?.length > 0 && (
                    <ul className="space-y-2 text-sm text-gray-700">
                      {treatment.steps.slice(0, 4).map((step, stepIdx) => (
                        <li key={stepIdx} className="flex gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {stepIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-blue-50">
      <Navbar />
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              <Sparkles size={16} />
              AI-Powered Detection
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Plant Disease Detection
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Upload a photo of your plant leaf and get instant disease
              detection with treatment recommendations.
            </p>
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-500 mb-3">Currently Supporting 14 Plant Types:</p>
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Apple</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Blueberry</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Cherry</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Corn</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Grape</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Orange</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Peach</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Pepper</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Potato</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Raspberry</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Soybean</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Squash</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Strawberry</span>
                <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-3 py-1 rounded-full">Tomato</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Upload className="text-green-600" size={24} />
                Upload Plant Image
              </h2>

              {!previewUrl ? (
                <div
                  className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-400 transition-all duration-300 cursor-pointer bg-gray-50 hover:bg-green-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-20 h-20 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                    <Camera className="text-white" size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Choose an image
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    or drag and drop here
                  </p>
                  <p className="text-xs text-gray-400">PNG, JPG up to 10MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border-4 border-gray-100">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-80 object-cover"
                    />
                    <button
                      onClick={resetAnalysis}
                      className="absolute top-3 right-3 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Select Plant Type</label>
                    <select
                      value={selectedPlant}
                      onChange={(e) => setSelectedPlant(e.target.value)}
                      className="w-full p-3 bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-hidden focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
                    >
                      <option value="">-- Choose a Plant --</option>
                      {plantOptions.map((plant) => (
                        <option key={plant} value={plant}>
                          {plant}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedImage ? (
                    <button
                      onClick={handleAnalyze}
                      disabled={isAnalyzing || !selectedPlant}
                      className="w-full py-4 mt-6 bg-linear-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Analyze Disease
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-800">
                      Viewing a saved detection. Use New Scan to upload another image.
                    </div>
                  )}
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle
                    className="text-red-600 shrink-0 mt-0.5"
                    size={20}
                  />
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Error</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="text-green-600" size={24} />
                Analysis Results
              </h2>

              {!result ? (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Leaf className="text-gray-400" size={40} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    No Analysis Yet
                  </h3>
                  <p className="text-sm text-gray-500 max-w-xs">
                    Upload a plant leaf image to get instant disease detection
                    and treatment recommendations
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {renderDetectionSummary(result)}

                  <div className="flex gap-3">
                    <button
                      onClick={resetAnalysis}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={18} />
                      New Scan
                    </button>
                    <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2">
                      <Download size={18} />
                      Save Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {detectionHistory.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="text-green-600" size={24} />
                  Recent Detections
                </h2>
                <button
                  onClick={() => setIsHistoryModalOpen(true)}
                  className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  View All
                  <ArrowRight size={16} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentDetections.map((detection) => (
                  <div
                    key={detection._id}
                    onClick={() => loadDetectionDetails(detection._id)}
                    className={`p-4 border rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group relative ${activeHistoryId === detection._id ? "border-green-300 bg-green-50/60" : "border-gray-100"}`}
                  >
                    <button
                      onClick={(e) => handleDelete(e, detection._id)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                      title="Delete Record"
                    >
                      <Trash2 size={16} />
                    </button>
                    <div className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={`${apiBaseUrl}/${detection.imagePath}`}
                          alt="Detection"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                          {detection.diseaseDetected}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {new Date(detection.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getConfidenceColor(detection.confidence)}`}
                              style={{ width: `${detection.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-600">
                            {detection.confidence.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedRecentResult && (
                <div className="mt-8 border-t border-gray-100 pt-8">
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Saved Detection Summary
                      </h3>
                      <p className="text-sm text-gray-500">
                        Full details for the selected previous detection.
                      </p>
                    </div>
                    <button
                      onClick={() => loadDetectionDetails(selectedRecentResult.detectionId)}
                      className="text-sm font-bold text-green-600 hover:text-green-700"
                    >
                      Open In Main Result
                    </button>
                  </div>
                  {renderDetectionSummary(selectedRecentResult)}
                </div>
              )}
            </div>
          )}

          {/* Community Forum Section */}
          <div className="mt-12 bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <MessageCircle className="text-green-600" size={28} />
                  Community Forum
                </h2>
                <p className="text-gray-600">
                  Share knowledge with other farmers and get answers from agricultural experts
                </p>
              </div>
              <button
                onClick={() => navigate("/forum")}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-200 transition-all whitespace-nowrap"
              >
                <MessageSquare size={18} />
                View All
              </button>
            </div>

            {forumLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-green-600" size={24} />
                <span className="ml-2 text-gray-600">Loading discussions...</span>
              </div>
            ) : forumPosts.length > 0 ? (
              <div className="space-y-4">
                {forumPosts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => navigate(`/forum/${post._id}`)}
                    className="p-5 border border-gray-200 rounded-xl hover:shadow-md hover:border-green-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                          {post.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          by <span className="font-semibold">{post.userName}</span> • {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                        {post.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {post.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {post.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle size={14} />
                        {post.replies?.length || 0} replies
                      </span>
                      {post.status === "answered" && (
                        <span className="flex items-center gap-1 text-green-600 font-semibold">
                          <CheckCircle size={14} />
                          Answered
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No discussions yet. Be the first to start one!</p>
                <button
                  onClick={() => navigate("/forum/create")}
                  className="mt-4 text-green-600 font-bold hover:underline"
                >
                  Ask a Question
                </button>
              </div>
            )}
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
              <p className="text-sm text-gray-600">
                Advanced deep learning models trained on millions of plant
                images
              </p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
              <p className="text-sm text-gray-600">
                Get disease detection and treatment recommendations in seconds
              </p>
            </div>

            <div className="bg-linear-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Leaf className="text-white" size={24} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Expert Care</h3>
              <p className="text-sm text-gray-600">
                Treatment plans created by agricultural experts and scientists
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Trash2 className="text-red-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              Delete Detection?
            </h3>
            <p className="text-gray-500 text-center mb-6 text-sm">
              Are you sure you want to delete this record? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 md:p-6">
          <div className="mx-auto flex h-full max-w-6xl items-start justify-center">
            <div className="flex h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Detection History</h3>
                  <p className="text-sm text-gray-500">
                    Open any saved scan to restore its details on this page.
                  </p>
                </div>
                <button
                  onClick={() => setIsHistoryModalOpen(false)}
                  className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid flex-1 overflow-hidden lg:grid-cols-[380px_1fr]">
                <div className="overflow-y-auto border-b border-gray-100 p-4 lg:border-b-0 lg:border-r">
                  <div className="space-y-3">
                    {detectionHistory.map((detection) => (
                      <button
                        key={detection._id}
                        onClick={() => loadDetectionDetails(detection._id, true)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${activeHistoryId === detection._id ? "border-green-300 bg-green-50 shadow-sm" : "border-gray-100 bg-white hover:border-green-200 hover:bg-green-50/40"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            <img
                              src={`${apiBaseUrl}/${detection.imagePath}`}
                              alt="Detection"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-gray-900">
                              {formatDiseaseLabel(detection.diseaseDetected)}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {new Date(detection.createdAt).toLocaleString()}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className={`h-full rounded-full ${getConfidenceColor(detection.confidence)}`}
                                  style={{ width: `${detection.confidence}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-gray-700">
                                {Number(detection.confidence).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center overflow-y-auto bg-gray-50/60 p-6">
                  <div className="w-full max-w-2xl rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                    {isHistoryDetailLoading ? (
                      <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-center text-gray-500">
                        <Loader2 className="animate-spin text-green-600" size={28} />
                        <p className="text-sm font-medium">Loading saved detection details...</p>
                      </div>
                    ) : (
                      <div className="flex min-h-64 flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-full bg-green-100 p-4 text-green-700">
                          <History size={28} />
                        </div>
                        <h4 className="text-xl font-bold text-gray-900">Open a saved detection</h4>
                        <p className="mt-2 max-w-md text-sm text-gray-500">
                          Choose any record from the left and its image, disease result, and saved care recommendations will be restored on this page.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiseaseDetection;
