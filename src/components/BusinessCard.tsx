import React from 'react';
import { MapPin, Star, Phone } from 'lucide-react';
import type { Business } from '../types';

interface BusinessCardProps {
  business: Business;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <img 
        src={business.cover_image || 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg'} 
        alt={business.name} 
        className="w-full h-48 object-cover" 
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{business.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{business.description}</p>
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin size={16} className="mr-2" />
          {business.address}, {business.city}
        </div>
        {business.phone && (
          <div className="flex items-center text-gray-600">
            <Phone size={16} className="mr-2" />
            {business.phone}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;