import React, { useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import Navbar from './components/Navbar';
import BusinessCard from './components/BusinessCard';
import { supabase } from './lib/supabase';
import type { Business, Category } from './types';

function App() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [businessesResponse, categoriesResponse] = await Promise.all([
          supabase
            .from('businesses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(6),
          supabase.from('categories').select('*')
        ]);

        if (businessesResponse.error) throw businessesResponse.error;
        if (categoriesResponse.error) throw categoriesResponse.error;

        setBusinesses(businessesResponse.data);
        setCategories(categoriesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (location) {
        query = query.ilike('city', `%${location}%`);
      }

      const { data, error } = await query.limit(6);

      if (error) throw error;
      setBusinesses(data);
    } catch (error) {
      console.error('Error searching businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-yellow-500 to-red-600 h-[500px]">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 h-full flex items-center justify-center relative">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Find the Best Businesses in Ghana</h1>
            <div className="flex items-center justify-center max-w-2xl mx-auto bg-white rounded-lg p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for restaurants, shops, services..."
                className="flex-1 px-4 py-2 outline-none"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Accra, Kumasi, Tamale..."
                className="flex-1 px-4 py-2 outline-none border-l"
              />
              <button 
                onClick={handleSearch}
                className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Businesses */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">Popular in Ghana</h2>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div key={category.id} className="bg-gray-50 p-6 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;