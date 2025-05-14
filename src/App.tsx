import { useEffect, useState, useCallback } from 'react';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = useCallback(async (category?: string) => {
    setLoading(true);
    try {
      let query = supabase
        .from('businesses')
        .select('*')
        .order('rating', { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      if (location) {
        query = query.ilike('city', `%${location}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBusinesses(data);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      setError('Failed to load businesses. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, location]);

  useEffect(() => {
    async function fetchData() {
      setError(null);
      try {
        const categoriesResponse = await supabase.from('categories').select('*');
        if (categoriesResponse.error) throw categoriesResponse.error;
        setCategories(categoriesResponse.data || []);

        await fetchBusinesses();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load businesses. Please try again later.');
      }
    }

    fetchData();
  }, [fetchBusinesses]);

  const handleSearch = () => {
    fetchBusinesses(selectedCategory || undefined);
  };

  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName === selectedCategory ? null : categoryName);
    await fetchBusinesses(categoryName === selectedCategory ? undefined : categoryName);
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

      {/* Categories Section - Moved above Featured Businesses */}
      <div className="bg-white py-8 shadow-sm">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.name)}
                className={`p-4 rounded-lg transition cursor-pointer text-center ${
                  selectedCategory === category.name
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <h3 className="text-lg font-semibold">{category.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Businesses */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-8">
          {selectedCategory 
            ? `Best ${selectedCategory} in Ghana`
            : 'Popular in Ghana'}
        </h2>
        {error ? (
          <div className="text-red-600 text-center p-4 bg-red-50 rounded-lg">
            {error}
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md h-80 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : businesses.length === 0 ? (
          <div className="text-center text-gray-600">
            No businesses found. Try adjusting your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;