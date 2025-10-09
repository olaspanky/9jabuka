'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Clock, MapPin, Phone, Star, Filter, Search, CheckCircle, XCircle, Menu, Home } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getFoods, placeOrder } from '../../src/app/lib/api';
import Link from 'next/link';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

// Placeholder API function for creating Stripe Checkout session
const createCheckoutSession = async (orderData) => {
  const response = await fetch('https://9jabukabackend.vercel.app/api/orders/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orderData),
  });
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Failed to create checkout session');
  }
  return result;
};

// Valid ZIP codes around Newark, NJ
const VALID_ZIP_CODES = [
  '07102', '07103', '07104', '07105', '07106', '07107', '07108', '07112', '07114', // Newark
  '07111', // Irvington
  '07017', '07018', // East Orange
  '07029', // Harrison
];

// Restaurant locations
const RESTAURANT_LOCATIONS = [
  '666 Springfield Ave, Newark, NJ 07103',
  '891-899 Clinton Ave, Irvington, NJ 07111',
];

// Placeholder function to calculate distance (replace with actual API call)
const calculateDistance = async (userAddress, restaurantLocations) => {
  const zipToDistance = {
    '07103': 0, // Same as Springfield Ave
    '07111': 2, // Close to Clinton Ave
    '07102': 1,
    '07104': 2,
    '07105': 3,
    '07106': 2.5,
    '07107': 2,
    '07108': 1.5,
    '07112': 2,
    '07114': 3,
    '07017': 3.5,
    '07018': 3.5,
    '07029': 4,
  };

  const userZip = userAddress.match(/\b\d{5}\b/)?.[0]; // Extract ZIP code
  const distance = zipToDistance[userZip] || 5; // Default to 5 miles if ZIP not found

  // Custom delivery fee logic
  let deliveryFee;
  if (distance === 1) {
    deliveryFee = 8.00; // $8 for 1 mile
  } else if (distance === 2) {
    deliveryFee = 10.00; // $10 for 2 miles
  } else {
    deliveryFee = (2 + distance).toFixed(2); // Default: $2 base + $1 per mile for other distances
  }

  return { distance, deliveryFee };
};

const FoodOrderingSystem = () => {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showCheckout, setShowCheckout] = useState(false);
  const [allFoods, setAllFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(3.99); // Dynamic delivery fee
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();

  // Watch ZIP code for real-time validation and fee calculation
  const zipCode = watch('zipCode');

  // Fetch food items from backend
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        const foods = await getFoods();
        const transformedFoods = foods.map(food => ({
          id: food._id,
          name: food.name,
          description: food.description,
          price: food.price,
          category: food.category.toLowerCase(),
          image: food.imageUrl,
          time: `${food.cookingTime} min`,
        }));
        setAllFoods(transformedFoods);
        setFilteredFoods(transformedFoods);
        const uniqueCategories = [...new Set(transformedFoods.map(food => food.category))];
        setCategories(['all', ...uniqueCategories]);
      } catch (err) {
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };
    fetchFoods();
  }, []);

  // Calculate delivery fee when ZIP code changes
  useEffect(() => {
    const updateDeliveryFee = async () => {
      if (zipCode && VALID_ZIP_CODES.includes(zipCode)) {
        const userAddress = `Newark, NJ ${zipCode}`; // Simplified for demo
        try {
          const { deliveryFee } = await calculateDistance(userAddress, RESTAURANT_LOCATIONS);
          setDeliveryFee(parseFloat(deliveryFee));
          setError(null);
        } catch (err) {
          setError('Failed to calculate delivery fee');
        }
      }
    };
    updateDeliveryFee();
  }, [zipCode]);

  // Filter foods based on category and search term
  useEffect(() => {
    let filtered = allFoods;
    if (activeCategory !== 'all') {
      filtered = filtered.filter(food => food.category === activeCategory);
    }
    if (searchTerm) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        food.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredFoods(filtered);
  }, [activeCategory, searchTerm, allFoods]);

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      ));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const onCheckoutSubmit = async (data) => {
    try {
      // Validate ZIP code
      if (!VALID_ZIP_CODES.includes(data.zipCode)) {
        throw new Error('Delivery is not available to this ZIP code');
      }

      const orderData = {
        items: cart.map(item => ({
          food: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          quantity: item.quantity,
        })),
        mobileNumber: data.mobileNumber,
        deliveryLocation: `${data.streetAddress}, ${data.city}, ${data.zipCode}`,
        deliveryFee: deliveryFee, // Include dynamic delivery fee
      };

      // Create Stripe Checkout session
      const session = await createCheckoutSession(orderData);
      const stripe = await stripePromise;
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        throw new Error(stripeError.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate payment');
    }
  };

  const formatCategoryName = (category) => {
    if (category === 'all') return 'All Items';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <Elements stripe={stripePromise}>
<div className="min-h-screen bg-gray-50 ">
  <div className="absolute inset-0 bg-[url('/bg2.jpg')] lg:bg-[url('/bg.jpg')] fixed bg-cover bg-center bg-black/50"></div> 

  <div className="relative z-10">

        {/* Header unchanged */}
        <header className="bg-white shadow-sm border-b fixed w-full z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-3">
               <Link href="https://9jabukarestaurant.com">
                <div>
                 <img src="/9ja.png" alt="9jabuka Logo" className="h-8 w-auto" />
                </div>
                </Link>
              </div>
              <nav className="hidden md:flex items-center space-x-8">
                <a href="https://9jabukarestaurant.com" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Home</a>
                <a href="#menu" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Menu</a>
                <a href="/pages/catering" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Reservation and catering</a>
                <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
              </nav>
              <div className="hidden lg:flex flex-1 max-w-md mx-8">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCart(true)}
                  className="relative bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors shadow-sm"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span className="font-medium">${getTotalPrice()}</span>
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t">
              <div className="px-4 py-3 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                </div>
                <nav className="flex flex-col space-y-2">
                  <a href="/" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Menu</a>
                <a href="/pages/catering" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Reservation and catering</a>
                <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium transition-colors">Contact</a>
                </nav>
              </div>
            </div>
          )}
        </header>

        {/* Success/Error Message */}
        {(orderSuccess || error) && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 max-w-md w-full mx-4">
            <div className={`p-4 rounded-lg shadow-lg ${
              orderSuccess ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center space-x-3">
                {orderSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${orderSuccess ? 'text-green-800' : 'text-red-800'}`}>
                    {orderSuccess ? orderSuccess.message : 'Error'}
                  </p>
                  <p className={`text-sm ${orderSuccess ? 'text-green-600' : 'text-red-600'}`}>
                    {orderSuccess ? "You'll receive a confirmation soon." : error}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setError(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="pt-16" id="menu">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">

            <div>
              <img src="/9ja.png" alt=''/>
            </div>
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Browse Menu</h3>
                <div className="text-sm text-white">
                  {!loading && `${filteredFoods.length} dishes available`}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm ${
                      activeCategory === category
                        ? 'bg-green-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-300 hover:border-green-300 hover:text-green-600'
                    }`}
                  >
                    {formatCategoryName(category)}
                    {category !== 'all' && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        activeCategory === category 
                          ? 'bg-white/20' 
                          : 'bg-gray-100'
                      }`}>
                        {allFoods.filter(food => food.category === category).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
            {loading && (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">Loading menu...</p>
              </div>
            )}
            {!loading && (searchTerm || activeCategory !== 'all') && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-blue-800">
                    {filteredFoods.length} result{filteredFoods.length !== 1 ? 's' : ''} found
                    {searchTerm && ` for "${searchTerm}"`}
                    {activeCategory !== 'all' && ` in ${formatCategoryName(activeCategory)}`}
                  </p>
                  {(searchTerm || activeCategory !== 'all') && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setActiveCategory('all');
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
              </div>
            )}
            {!loading && filteredFoods.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredFoods.map(item => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 group"
                  >
                    <div className="relative overflow-hidden h-48">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        {formatCategoryName(item.category)}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-yellow-500 ml-2">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-xs font-medium text-gray-600">4.8</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-1 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{item.time}</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">${item.price}</span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">No dishes found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm ? `No results for "${searchTerm}"` : 'No dishes available in this category'}
                </p>
                {(searchTerm || activeCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory('all');
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Show All Dishes
                  </button>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {cart.length === 0 ? (
                  <div className="text-center py-16 flex-1 flex flex-col justify-center">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">Your cart is empty</p>
                    <p className="text-gray-400 text-sm mt-2">Browse our menu to add items</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
                      {cart.map(item => (
                        <div key={item.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 text-sm truncate">{item.name}</h3>
                            <p className="text-green-600 font-medium text-sm">${item.price}</p>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-medium text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({getTotalItems()} items)</span>
                        <span className="font-medium">${getTotalPrice()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Delivery Fee</span>
                        <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                        <span>Total</span>
                        <span>${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                      </div>
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors mt-4"
                      >
                        Proceed to Checkout
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowCheckout(false)} />
              <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Checkout</h2>
                    <p className="text-gray-600">Complete your order details</p>
                  </div>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleSubmit(onCheckoutSubmit)} className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center text-gray-900">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Delivery Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                        <input
                          type="text"
                          placeholder="Enter your street address"
                          {...register('streetAddress', { required: 'Street address is required' })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                        />
                        {errors.streetAddress && <p className="text-red-500 text-xs mt-1">{errors.streetAddress.message}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            placeholder="City"
                            {...register('city', { required: 'City is required' })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                          <input
                            type="text"
                            placeholder="ZIP Code"
                            {...register('zipCode', {
                              required: 'ZIP code is required',
                              validate: value =>
                                VALID_ZIP_CODES.includes(value) || 'Delivery is not available to this ZIP code',
                            })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                          {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode.message}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="tel"
                            placeholder="Enter your phone number"
                            {...register('mobileNumber', {
                              required: 'Phone number is required',
                            })}
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>
                        {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="text-lg font-medium mb-4 text-gray-900">Order Summary</h3>
                    <div className="space-y-2">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-700">{item.name} × {item.quantity}</span>
                          <span className="font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-2 mt-3 space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="text-gray-900">${getTotalPrice()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Delivery Fee</span>
                          <span className="text-gray-900">${deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg text-gray-900 pt-1 border-t border-gray-200">
                          <span>Total</span>
                          <span>${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg font-semibold transition-colors duration-200 text-lg shadow-sm"
                  >
                    Complete Order - ${(parseFloat(getTotalPrice()) + deliveryFee).toFixed(2)}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Footer unchanged */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div >
 <div>
                 <img src="/9ja.png" alt="9jabuka Logo" className="h-8 w-auto" />
                </div>                  </div>
                 
                </div>
                <p className="text-gray-600 mb-4">
                  Bringing you the authentic taste of Nigeria with fresh ingredients and traditional recipes passed down through generations.
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>Daily 9AM - 7:30PM</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="w-4 h-4" />
                    <span>973-753 4447</span>
                    <span>862-291-6464</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#menu" className="hover:text-green-600 transition-colors">Menu</a></li>
                  <li><a href="#about" className="hover:text-green-600 transition-colors">About Us</a></li>
                  <li><a href="#contact" className="hover:text-green-600 transition-colors">Contact</a></li>
                  <li><a href="#faq" className="hover:text-green-600 transition-colors">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Customer Care</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li><a href="#support" className="hover:text-green-600 transition-colors">Support</a></li>
                  <li><a href="#delivery" className="hover:text-green-600 transition-colors">Delivery Info</a></li>
                  <li><a href="#returns" className="hover:text-green-600 transition-colors">Returns</a></li>
                  <li><a href="#privacy" className="hover:text-green-600 transition-colors">Privacy Policy</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 mt-8 pt-8 text-center">
              <p className="text-sm text-gray-500">
                © 2025 9jabuka. All rights reserved. | Bringing authentic Nigerian flavors to your table.
              </p>
            </div>
          </div>
        </footer>
      </div>
      </div>
    </Elements>
  );
};

export default FoodOrderingSystem;