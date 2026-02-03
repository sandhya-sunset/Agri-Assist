import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, X, Loader2, CheckCircle, AlertCircle, 
  Leaf, Sparkles, TrendingUp, ShoppingCart, History,
  Info, ArrowRight, RefreshCw, Download, Share2, Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';

const DiseaseDetection = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [detectionHistory, setDetectionHistory] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDetectionHistory();
  }, []);

  const fetchDetectionHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/detection/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDetectionHistory(data.data.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching history:', err);
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
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/detection/${recordToDelete}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDetectionHistory(prev => prev.filter(item => item._id !== recordToDelete));
        setDeleteModalOpen(false);
        setRecordToDelete(null);
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error('Error deleting detection:', err);
      alert('Error deleting detection');
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/detection/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        fetchDetectionHistory();
      } else {
        setError(data.message || 'Analysis failed');
      }
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (confidence) => {
    if (confidence >= 90) return 'text-red-600 bg-red-50 border-red-200';
    if (confidence >= 70) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'bg-green-500';
    if (confidence >= 70) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
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
            Upload a photo of your plant leaf and get instant disease detection with treatment recommendations
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Upload className="text-green-600" size={24} />
              Upload Plant Image
            </h2>

            {!previewUrl ? (
              <div className="border-3 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-green-400 transition-all duration-300 cursor-pointer bg-gray-50 hover:bg-green-50"
                onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200">
                  <Camera className="text-white" size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Choose an image</h3>
                <p className="text-sm text-gray-500 mb-4">
                  or drag and drop here
                </p>
                <p className="text-xs text-gray-400">
                  PNG, JPG up to 10MB
                </p>
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

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Analysis Yet</h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Upload a plant leaf image to get instant disease detection and treatment recommendations
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl border border-green-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-600 mb-1">Detected Disease</p>
                      <h3 className="text-2xl font-bold text-gray-900">{result.disease}</h3>
                    </div>
                    <CheckCircle className="text-green-600" size={32} />
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-gray-700">Confidence Level</span>
                      <span className="text-sm font-bold text-gray-900">{result.confidence}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${getConfidenceColor(parseFloat(result.confidence))}`}
                        style={{ width: `${result.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>

                {result.recommendations && (
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <Info size={18} className="text-blue-600" />
                      Recommended Treatments
                    </h4>
                    
                    {result.recommendations.fertilizers && result.recommendations.fertilizers.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-700">Fertilizers:</p>
                        {result.recommendations.fertilizers.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                            <h5 className="font-bold text-gray-900 mb-1">{item.name}</h5>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-600">Dosage: {item.dosage}</span>
                              <button className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                                <ShoppingCart size={14} />
                                Buy Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {result.recommendations.pesticides && result.recommendations.pesticides.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-sm font-bold text-gray-700">Pesticides:</p>
                        {result.recommendations.pesticides.slice(0, 2).map((item, idx) => (
                          <div key={idx} className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                            <h5 className="font-bold text-gray-900 mb-1">{item.name}</h5>
                            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-orange-600">Dosage: {item.dosage}</span>
                              <button className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                                <ShoppingCart size={14} />
                                Buy Now
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
              <button className="text-sm font-bold text-green-600 hover:text-green-700 flex items-center gap-1">
                View All
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {detectionHistory.map((detection) => (
                <div key={detection._id} className="p-4 border border-gray-100 rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group relative">
                  <button 
                    onClick={(e) => handleDelete(e, detection._id)}
                    className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                    title="Delete Record"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={`http://localhost:5000/${detection.imagePath}`} 
                        alt="Detection" 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{detection.diseaseDetected}</h4>
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
                        <span className="text-xs font-bold text-gray-600">{detection.confidence.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">AI-Powered</h3>
            <p className="text-sm text-gray-600">Advanced deep learning models trained on millions of plant images</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-600">Get disease detection and treatment recommendations in seconds</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
              <Leaf className="text-white" size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Expert Care</h3>
            <p className="text-sm text-gray-600">Treatment plans created by agricultural experts and scientists</p>
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
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Detection?</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">
              Are you sure you want to delete this record? This action cannot be undone.
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
    </div>
  );
};

export default DiseaseDetection;