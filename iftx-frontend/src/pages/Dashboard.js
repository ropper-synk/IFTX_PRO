import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const products = [
  { id: 1, name: "Solar Panel A", description: "High efficiency", price: 120, image: "/assets/solar1.jpg" },
  { id: 2, name: "Solar Panel B", description: "Budget friendly", price: 90, image: "/assets/solar2.jpg" },
  { id: 3, name: "Solar Panel C", description: "Premium quality", price: 200, image: "/assets/solar3.jpg" },
];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [cartLoading, setCartLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [cartItemsLoading, setCartItemsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
    fetchCartData();
    // initialize quantities to 1
    const initial = {};
    products.forEach(p => { initial[p.id] = 1; });
    setQuantities(initial);
  }, []);

  const fetchUserProfile = async () => {
    try {
      // Configure axios to send credentials
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setError('Failed to load user profile');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
      } else {
        setError('Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCartData = async () => {
    try {
      setCartItemsLoading(true);
      const response = await axios.get('http://localhost:5000/api/cart', {
        withCredentials: true
      });
      
      if (response.data.success) {
        setCart(response.data.cart);
        console.log('Cart data loaded:', response.data.cart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setCartItemsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout', {}, {
        withCredentials: true
      });
      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout fails
      window.location.href = '/login';
    }
  };

  const setQty = (id, next) => {
    setQuantities(prev => ({ ...prev, [id]: Math.max(1, next) }));
  };

  const addToCart = async (product) => {
    setCartLoading(true);
    try {
      const qty = quantities[product.id] || 1;
      
      const cartData = {
        productId: product.id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        quantity: qty
      };

      console.log('Adding to cart - Product data:', cartData);
      console.log('Sending request to:', 'http://localhost:5000/api/cart/add');
      
      const response = await axios.post('http://localhost:5000/api/cart/add', cartData, {
        withCredentials: true
      });

      console.log('Cart response:', response.data);

      if (response.data.success) {
        alert(`Added ${qty} ${product.name}(s) to cart!`);
        // Refresh cart data
        fetchCartData();
      } else {
        alert('Failed to add item to cart');
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 401) {
        alert('Please login to add items to cart');
        navigate('/login');
      } else {
        alert('Failed to add item to cart: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/cart/remove/${productId}`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        alert('Item removed from cart');
        fetchCartData();
      }
    } catch (error) {
      console.error('Remove from cart error:', error);
      alert('Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/cart/update/${productId}`, {
        quantity: newQuantity
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        fetchCartData();
      }
    } catch (error) {
      console.error('Update cart error:', error);
      alert('Failed to update cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error || 'User not found'}
          </div>
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">IFTX Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Cart Icon with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowCartDropdown(!showCartDropdown)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                  </svg>
                  {cart && cart.totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {cart.totalItems}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                {showCartDropdown && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                      {cart && (
                        <p className="text-sm text-gray-600">
                          {cart.totalItems} items • ${cart.totalAmount?.toFixed(2)}
                        </p>
                      )}
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {cartItemsLoading ? (
                        <div className="p-4 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                          <p className="text-gray-600 mt-2">Loading cart...</p>
                        </div>
                      ) : cart && cart.items && cart.items.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                          {cart.items.map((item) => (
                            <div key={item.productId} className="p-4 flex items-center space-x-3">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="h-12 w-12 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-gray-900 truncate">
                                  {item.name}
                                </h4>
                                <p className="text-sm text-gray-500">${item.price}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <button
                                    onClick={() => updateCartQuantity(item.productId, Math.max(1, item.quantity - 1))}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                    </svg>
                                  </button>
                                  <span className="text-sm font-medium">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-gray-900">
                                  ${(item.price * item.quantity).toFixed(2)}
                                </p>
                                <button
                                  onClick={() => removeFromCart(item.productId)}
                                  className="text-red-500 hover:text-red-700 text-sm mt-1"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
                          </svg>
                          <p className="text-gray-500 mt-2">Your cart is empty</p>
                        </div>
                      )}
                    </div>
                    
                    {cart && cart.items && cart.items.length > 0 && (
                      <div className="p-4 border-t border-gray-200">
                        <button 
                          onClick={() => {
                            setShowCartDropdown(false);
                            navigate("/checkout");
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
                        >
                          Checkout (${cart.totalAmount?.toFixed(2)})
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close cart dropdown */}
      {showCartDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowCartDropdown(false)}
        ></div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}!
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              You have successfully logged into your IFTX account
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Account Verified
            </div>
          </div>
        </div>

        {/* Product Details Section with Cart Controls */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-900">Products</h3>
            <button
              onClick={() => navigate('/home')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {products.map(p => (
              <div key={p.id} className="border rounded-lg p-4 shadow hover:shadow-lg transition bg-white">
                <img src={p.image} alt={p.name} className="w-full h-40 object-cover mb-2 rounded" />
                <h4 className="font-bold text-lg">{p.name}</h4>
                <p className="text-gray-600">{p.description}</p>
                <div className="font-semibold mt-1">${p.price}</div>

                <div className="mt-3 flex items-center gap-3">
                  <span className="text-sm text-gray-700">Qty</span>
                  <div className="flex items-center border rounded">
                    <button
                      type="button"
                      onClick={() => setQty(p.id, (quantities[p.id] || 1) - 1)}
                      className="px-3 py-1.5 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantities[p.id] || 1}
                      onChange={(e) => setQty(p.id, parseInt(e.target.value || '1', 10))}
                      className="w-14 text-center outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setQty(p.id, (quantities[p.id] || 1) + 1)}
                      className="px-3 py-1.5 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => addToCart(p)}
                    disabled={cartLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {cartLoading ? 'Adding...' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => { addToCart(p); navigate("/checkout"); }}
                    disabled={cartLoading}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Existing Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Full Name:</span>
                <span className="text-gray-900 font-semibold">{user.firstName} {user.lastName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-gray-900 font-semibold">{user.email}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Date of Birth:</span>
                <span className="text-gray-900 font-semibold">
                  {new Date(user.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Gender:</span>
                <span className="text-gray-900 font-semibold">{user.gender}</span>
              </div>
              {user.occupation && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Occupation:</span>
                  <span className="text-gray-900 font-semibold">{user.occupation}</span>
                </div>
              )}
              {user.company && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 font-medium">Company:</span>
                  <span className="text-gray-900 font-semibold">{user.company}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Primary Phone:</span>
                <span className="text-gray-900 font-semibold">{user.primaryPhone}</span>
              </div>
              {user.alternatePhone && (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Alternate Phone:</span>
                  <span className="text-gray-900 font-semibold">{user.alternatePhone}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 lg:col-span-2 mt-8">
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Address Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Street:</span>
                <span className="text-gray-900 font-semibold">{user.address.street}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">City:</span>
                <span className="text-gray-900 font-semibold">{user.address.city}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">State:</span>
                <span className="text-gray-900 font-semibold">{user.address.state}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Zip Code:</span>
                <span className="text-gray-900 font-semibold">{user.address.zipCode}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 font-medium">Country:</span>
                <span className="text-gray-900 font-semibold">{user.address.country}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600 font-medium">Member Since:</span>
                <span className="text-gray-900 font-semibold">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
