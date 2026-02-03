import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingBag, Users, Package, Eye, Star, Download, Calendar, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const AnalyticsSection = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Analytics data state
  const [metrics, setMetrics] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);
  const [trafficSources, setTrafficSources] = useState([]);
  const [categoryPerformance, setCategoryPerformance] = useState([]);
  const [additionalMetrics, setAdditionalMetrics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/seller/analytics?timeRange=${timeRange}`);
      
      if (response.data.success) {
        const data = response.data.data;
        setMetrics(data.metrics);
        setSalesData(data.salesData);
        setTopProducts(data.topProducts);
        setRecentReviews(data.recentReviews);
        setTrafficSources(data.trafficSources);
        setCategoryPerformance(data.categoryPerformance);
        setAdditionalMetrics(data.additionalMetrics);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      // Create CSV content
      let csvContent = "Analytics Report\n\n";
      
      // Add metrics
      if (metrics) {
        csvContent += "Key Metrics\n";
        csvContent += `Total Revenue,Rs. ${metrics.totalRevenue.value.toFixed(2)},${metrics.totalRevenue.change}%\n`;
        csvContent += `Total Orders,${metrics.totalOrders.value},${metrics.totalOrders.change}%\n`;
        csvContent += `Avg Order Value,Rs. ${metrics.avgOrderValue.value.toFixed(2)},${metrics.avgOrderValue.change}%\n`;
        csvContent += `Total Customers,${metrics.totalCustomers.value},${metrics.totalCustomers.change}%\n\n`;
      }
      
      // Add sales data
      csvContent += "Monthly Sales\n";
      csvContent += "Month,Revenue,Orders\n";
      salesData.forEach(data => {
        csvContent += `${data.month},Rs. ${data.sales},${data.orders}\n`;
      });
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting analytics:', error);
      alert('Failed to export analytics. Please try again.');
    }
  };

  const maxSales = salesData.length > 0 ? Math.max(...salesData.map(d => d.sales)) : 1;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={fetchAnalytics}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h2>
          <p className="text-gray-500 mt-1">Track your store's performance and insights</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { 
              label: 'Total Revenue', 
              value: `Rs. ${metrics.totalRevenue.value.toFixed(2)}`, 
              change: `${metrics.totalRevenue.change}%`, 
              isPositive: metrics.totalRevenue.isPositive,
              icon: DollarSign, 
              color: 'green',
              description: 'vs last period'
            },
            { 
              label: 'Total Orders', 
              value: metrics.totalOrders.value.toString(), 
              change: `${metrics.totalOrders.change}%`, 
              isPositive: metrics.totalOrders.isPositive,
              icon: ShoppingBag, 
              color: 'blue',
              description: 'vs last period'
            },
            { 
              label: 'Avg Order Value', 
              value: `Rs. ${metrics.avgOrderValue.value.toFixed(2)}`, 
              change: `${metrics.avgOrderValue.change}%`, 
              isPositive: metrics.avgOrderValue.isPositive,
              icon: TrendingUp, 
              color: 'purple',
              description: 'vs last period'
            },
            { 
              label: 'Total Customers', 
              value: metrics.totalCustomers.value.toString(), 
              change: `${metrics.totalCustomers.change}%`, 
              isPositive: metrics.totalCustomers.isPositive,
              icon: Users, 
              color: 'orange',
              description: 'unique customers'
            }
          ].map((metric, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${metric.color}-100 rounded-xl flex items-center justify-center`}>
                  <metric.icon className={`text-${metric.color}-600`} size={24} />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${metric.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {metric.change}
                </div>
              </div>
              <p className="text-gray-500 text-sm mb-1">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-800 mb-1">{metric.value}</p>
              <p className="text-xs text-gray-400">{metric.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Sales Overview</h3>
            <p className="text-sm text-gray-500 mt-1">Monthly sales and order trends</p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Orders</span>
            </div>
          </div>
        </div>
        
        {salesData.length > 0 ? (
          <div className="flex items-end gap-2 sm:gap-4 h-64">
            {salesData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full bg-gray-50 rounded-t-lg relative" style={{ height: '100%' }}>
                  {/* Revenue Bar */}
                  <div 
                    className="bg-green-500 rounded-t-lg absolute bottom-0 w-full transition-all hover:bg-green-600 cursor-pointer"
                    style={{ height: `${maxSales > 0 ? (data.sales / maxSales) * 100 : 0}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Rs. {data.sales.toFixed(0)}
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-600 font-medium">{data.month}</span>
                <span className="text-xs text-gray-400">{data.orders} orders</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-400">
            No sales data available
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Top Selling Products</h3>
          </div>
          <div className="space-y-4">
            {topProducts.length > 0 ? (
              topProducts.map((product, idx) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg font-bold text-green-600">
                    #{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-sm text-gray-500">{product.sales} sales</span>
                      <span className="text-xs text-gray-400">•</span>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-600">{product.rating}</span>
                      </div>
                      {product.views && (
                        <>
                          <span className="text-xs text-gray-400">•</span>
                          <div className="flex items-center gap-1">
                            <Eye size={12} className="text-gray-400" />
                            <span className="text-sm text-gray-600">{product.views}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">Rs. {product.revenue.toFixed(2)}</p>
                    {product.growth && (
                      <span className={`text-xs font-semibold ${parseFloat(product.growth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(product.growth) >= 0 ? '↑' : '↓'} {Math.abs(parseFloat(product.growth))}%
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No product data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Reviews</h3>
          </div>
          <div className="space-y-4">
            {recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{review.customer}</p>
                      <p className="text-sm text-gray-500">{review.product}</p>
                    </div>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14}
                          className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{review.date}</span>
                    {review.helpful !== undefined && (
                      <span className="text-xs text-gray-500">{review.helpful} found helpful</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No reviews yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Traffic & Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Traffic Sources</h3>
          <div className="space-y-6">
            {trafficSources.map((traffic, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 bg-${traffic.color}-500 rounded-full`}></div>
                    <span className="font-semibold text-gray-800">{traffic.source}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-gray-800">{traffic.percentage}%</span>
                    <span className="text-sm text-gray-500 ml-2">({traffic.visits} visits)</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-${traffic.color}-500 h-2 rounded-full transition-all`}
                    style={{ width: `${traffic.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Category Performance</h3>
          <div className="space-y-4">
            {categoryPerformance.length > 0 ? (
              categoryPerformance.map((category, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-800">{category.category}</p>
                      <p className="text-sm text-gray-500">{category.sales} products sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">Rs. {category.revenue.toFixed(2)}</p>
                      <p className="text-sm text-gray-500">{category.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      {additionalMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Package className="text-purple-600" size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Conversion Rate</p>
            <p className="text-3xl font-bold text-gray-800">{additionalMetrics.conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Visitors to customers</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Return Rate</p>
            <p className="text-3xl font-bold text-gray-800">{additionalMetrics.returnRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Repeat customers</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Star className="text-orange-600" size={24} />
              </div>
            </div>
            <p className="text-gray-500 text-sm mb-1">Avg Rating</p>
            <p className="text-3xl font-bold text-gray-800">{additionalMetrics.avgRating}</p>
            <p className="text-xs text-gray-400 mt-1">Out of 5 stars</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsSection;