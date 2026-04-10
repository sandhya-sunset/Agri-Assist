import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../Components/Toast';
import { API_BASE_URL } from '../config';
import { CheckCircle, Clock } from 'lucide-react';

const ApplyExpert = () => {
  const [formData, setFormData] = useState({
    degree: '',
    specialization: '',
    experienceYears: '',
    institution: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.degree || !formData.specialization || !formData.experienceYears || !formData.institution) {
      addToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/apply-expert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        addToast(data.message, 'success');
        // Update user state locally
        const updatedUser = { ...user, expertApplicationStatus: 'pending' };
        login(updatedUser, token);
        navigate('/');
      } else {
        addToast(data.message || 'Application failed', 'error');
      }
    } catch (error) {
      console.error(error);
      addToast('Failed to submit application. Server error.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'expert') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You are an Expert!</h2>
            <p className="text-gray-600 mb-6">Your agriculture expert application has been approved. You can now reply to posts in the Community Forum.</p>
            <button onClick={() => navigate('/forum')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition">Go to Forum</button>
          </div>
        </div>
      </div>
    );
  }

  if (user?.expertApplicationStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <Clock className="mx-auto h-16 w-16 text-yellow-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h2>
            <p className="text-gray-600 mb-6">Your application is currently being reviewed by an admin. We will notify you once it's approved.</p>
            <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">Return Home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6 mt-16">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Apply as an Agriculture Expert</h1>
            <p className="text-gray-600">Join our community of experts to help farmers with your knowledge and experience.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-800 text-sm">
              <strong>Requirements:</strong> Please provide your educational background and professional experience in the agriculture sector. Our team will review these details to grant you an expert badge.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Highest Degree/Qualification *</label>
                <input 
                  type="text" 
                  name="degree"
                  value={formData.degree}
                  onChange={handleChange}
                  placeholder="e.g. B.Sc. Agriculture"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Issuing Institution / University *</label>
                <input 
                  type="text" 
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. Tribhuvan University"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Area of Specialization *</label>
                <input 
                  type="text" 
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g. Plant Pathology, Soil Science"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Years of Experience *</label>
                <input 
                  type="number" 
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  min="0"
                  placeholder="e.g. 5"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Brief Bio & Current Role</label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about what you do..."
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplyExpert;
