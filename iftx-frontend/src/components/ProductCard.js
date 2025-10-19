import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ProductCard({ product, index = 0 }) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuyNow = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/auth/status", { withCredentials: true });
      if (res.data?.authenticated) {
        navigate(`/product/${product.id}`);
      } else {
        alert("Please login to continue.");
        navigate("/login");
      }
    } catch (err) {
      console.error("Auth status check failed:", err);
      alert("Please login to continue.");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className={`
        group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 
        rounded-2xl p-6 shadow-lg hover:shadow-2xl 
        transition-all duration-500 ease-out
        hover:scale-105 hover:-translate-y-2
        animate-slide-up overflow-hidden
        before:absolute before:inset-0 before:bg-gradient-to-br 
        before:from-blue-50/30 before:to-purple-50/30 before:opacity-0 
        before:transition-opacity before:duration-300 hover:before:opacity-100
        cursor-pointer
      `}
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Gradient overlay for hover effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
      
      {/* Image container with enhanced styling */}
      <div className="relative overflow-hidden rounded-xl mb-4">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg animate-scale-in">
          ${product.price}
        </div>
      </div>

      {/* Content section */}
      <div className="relative z-10">
        <h2 className="font-bold text-xl text-gray-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
          {product.name}
        </h2>
        <p className="text-gray-600 mb-4 leading-relaxed">
          {product.description}
        </p>
        
        {/* Enhanced button */}
        <button
          onClick={handleBuyNow}
          disabled={isLoading}
          className={`
            w-full relative overflow-hidden
            bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800
            text-white font-semibold py-3 px-6 rounded-xl
            transform transition-all duration-300 ease-out
            hover:shadow-lg hover:shadow-blue-500/25
            focus:outline-none focus:ring-4 focus:ring-blue-300/50
            disabled:opacity-70 disabled:cursor-not-allowed
            group-hover:animate-glow
            before:absolute before:inset-0 before:bg-gradient-to-r 
            before:from-white/20 before:to-transparent before:translate-x-[-100%]
            hover:before:translate-x-[100%] before:transition-transform before:duration-700
            ${isLoading ? 'animate-pulse' : 'hover:scale-105'}
          `}
        >
          <span className="relative z-10">
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Buy Now'
            )}
          </span>
        </button>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-gradient-to-tr from-purple-400/10 to-pink-400/10 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </div>
  );
}

export default ProductCard;
