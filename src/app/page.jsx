// 'use client';

// import React, { useState, useEffect } from 'react';
// import { ShoppingCart, Plus, Minus, X, Clock, MapPin, Phone, Star, Filter, Search } from 'lucide-react';
// import { useForm } from 'react-hook-form';
// import { getFoods, placeOrder } from '../../src/app/lib/api';

// const FoodOrderingSystem = () => {
//   const [cart, setCart] = useState([]);
//   const [showCart, setShowCart] = useState(false);
//   const [activeCategory, setActiveCategory] = useState('all');
//   const [showCheckout, setShowCheckout] = useState(false);
//   const [allFoods, setAllFoods] = useState([]);
//   const [filteredFoods, setFilteredFoods] = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [error, setError] = useState(null);
//   const [orderSuccess, setOrderSuccess] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const { register, handleSubmit, formState: { errors }, reset } = useForm();

//   // Fetch food items from backend
//   useEffect(() => {
//     const fetchFoods = async () => {
//       try {
//         setLoading(true);
//         const foods = await getFoods();
        
//         // Transform foods to match component structure
//         const transformedFoods = foods.map(food => ({
//           id: food._id,
//           name: food.name,
//           description: food.description,
//           price: food.price,
//           category: food.category.toLowerCase(),
//           image: food.imageUrl,
//           time: `${food.cookingTime} min`,
//         }));
        
//         setAllFoods(transformedFoods);
//         setFilteredFoods(transformedFoods);
        
//         // Extract unique categories
//         const uniqueCategories = [...new Set(transformedFoods.map(food => food.category))];
//         setCategories(['all', ...uniqueCategories]);
        
//       } catch (err) {
//         setError('Failed to load menu items');
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchFoods();
//   }, []);

//   // Filter foods based on category and search term
//   useEffect(() => {
//     let filtered = allFoods;
    
//     // Filter by category
//     if (activeCategory !== 'all') {
//       filtered = filtered.filter(food => food.category === activeCategory);
//     }
    
//     // Filter by search term
//     if (searchTerm) {
//       filtered = filtered.filter(food => 
//         food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         food.description.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }
    
//     setFilteredFoods(filtered);
//   }, [activeCategory, searchTerm, allFoods]);

//   const addToCart = (item) => {
//     const existingItem = cart.find(cartItem => cartItem.id === item.id);
//     if (existingItem) {
//       setCart(cart.map(cartItem => 
//         cartItem.id === item.id 
//           ? { ...cartItem, quantity: cartItem.quantity + 1 }
//           : cartItem
//       ));
//     } else {
//       setCart([...cart, { ...item, quantity: 1 }]);
//     }
//   };

//   const removeFromCart = (itemId) => {
//     setCart(cart.filter(item => item.id !== itemId));
//   };

//   const updateQuantity = (itemId, newQuantity) => {
//     if (newQuantity === 0) {
//       removeFromCart(itemId);
//     } else {
//       setCart(cart.map(item => 
//         item.id === itemId ? { ...item, quantity: newQuantity } : item
//       ));
//     }
//   };

//   const getTotalPrice = () => {
//     return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
//   };

//   const getTotalItems = () => {
//     return cart.reduce((total, item) => total + item.quantity, 0);
//   };

//   const onCheckoutSubmit = async (data) => {
//     try {
//       const orderData = {
//         items: cart.map(item => ({
//           food: item.id,
//           quantity: item.quantity,
//         })),
//         mobileNumber: data.mobileNumber,
//         deliveryLocation: `${data.streetAddress}, ${data.city}, ${data.zipCode}`,
//       };
//       const response = await placeOrder(orderData);
//       setOrderSuccess(`Order placed successfully! Reference: ${response.order.referenceNumber}`);
//       setCart([]);
//       setShowCheckout(false);
//       setShowCart(false);
//       reset();
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to place order');
//     }
//   };

//   const formatCategoryName = (category) => {
//     if (category === 'all') return 'All Items';
//     return category.charAt(0).toUpperCase() + category.slice(1);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-green-800 via-red-900 to-orange-900">
//       {/* Header */}
//       <div className="bg-white/95 backdrop-blur-lg border-b fixed w-full z-50 shadow-lg">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-20">
//             <div className="flex items-center space-x-4">
//               <div className="text-4xl">🇳🇬</div>
//               <div>
//                 <h1 className="text-3xl font-bold text-green-800">9jabuka</h1>
//                 <p className="text-sm text-gray-600 font-medium">Authentic Nigerian Cuisine</p>
//               </div>
//             </div>
            
//             {/* Search Bar */}
//             <div className="hidden md:flex flex-1 max-w-md mx-8">
//               <div className="relative w-full">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search for dishes..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90"
//                 />
//               </div>
//             </div>

//             <button
//               onClick={() => setShowCart(true)}
//               className="relative bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full flex items-center space-x-3 transition-all duration-300 hover:scale-105 shadow-lg"
//             >
//               <ShoppingCart className="w-5 h-5" />
//               <span className="font-semibold">${getTotalPrice()}</span>
//               {getTotalItems() > 0 && (
//                 <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
//                   {getTotalItems()}
//                 </span>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Hero Section */}
//       {/* <div className="text-center py-20 px-4 pt-32 bg-gradient-to-r from-green-600/20 to-red-600/20 backdrop-blur-sm">
//         <h2 className="text-xl md:text-xl font-bold text-white mb-6">
//           Taste of
//           <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-yellow-400 to-red-400">
//             Nigeria
//           </span>
//         </h2>
//         <p className="text-xl md:text-xl text-white/90 mb-4 max-w-2xl mx-auto">
//           Authentic Nigerian flavors delivered fresh to your doorstep in the USA
//         </p>
//         <p className="text-lg text-white/70">From Jollof Rice to Suya - Experience home away from home</p>
//       </div> */}

//       {/* Mobile Search */}
//       <div className="md:hidden mx-4 mb-6 -mt-8 relative z-10">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//           <input
//             type="text"
//             placeholder="Search for dishes..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/95 backdrop-blur-sm"
//           />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto py-20 px-4 pt-32">
//         {/* Category Filters */}
//         <div className="flex flex-wrap justify-center gap-3 mb-12">
//           <div className="flex items-center mr-4 mb-2">
//             <Filter className="w-5 h-5 text-white/70 mr-2" />
//             <span className="text-white/70 font-medium">Filter by:</span>
//           </div>
//           {categories.map(category => (
//             <button
//               key={category}
//               onClick={() => setActiveCategory(category)}
//               className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
//                 activeCategory === category
//                   ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl scale-105'
//                   : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
//               }`}
//             >
//               {formatCategoryName(category)}
//               {category !== 'all' && (
//                 <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
//                   {allFoods.filter(food => food.category === category).length}
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>

//         {/* Loading State */}
//         {loading && (
//           <div className="text-center py-16">
//             <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
//             <p className="text-white/80 text-xl">Loading delicious Nigerian dishes...</p>
//           </div>
//         )}

//         {/* Error Message */}
//         {error && (
//           <div className="bg-red-500/20 backdrop-blur-sm border border-red-500/30 text-red-200 p-4 rounded-xl text-center mb-8">
//             {error}
//           </div>
//         )}

//         {/* Results Count */}
//         {!loading && (
//           <div className="text-center mb-8">
//             <p className="text-white/80 text-lg">
//               Showing {filteredFoods.length} of {allFoods.length} dishes
//               {searchTerm && ` for "${searchTerm}"`}
//               {activeCategory !== 'all' && ` in ${formatCategoryName(activeCategory)}`}
//             </p>
//           </div>
//         )}

//         {/* Menu Grid */}
//         {!loading && filteredFoods.length > 0 ? (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
//             {filteredFoods.map(item => (
//               <div key={item.id} className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 group">
//                 <div className="relative overflow-hidden">
//                   <img 
//                     src={item.image} 
//                     alt={item.name} 
//                     className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300" 
//                   />
//                   <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
//                     {formatCategoryName(item.category)}
//                   </div>
//                 </div>
                
//                 <div className="p-6">
//                   <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
//                     {item.name}
//                   </h3>
//                   <p className="text-white/80 mb-4 text-sm leading-relaxed">{item.description}</p>
                  
//                   <div className="flex items-center justify-between mb-4">
//                     <div className="flex items-center space-x-1 text-white/60">
//                       <Clock className="w-4 h-4" />
//                       <span className="text-sm">{item.time}</span>
//                     </div>
//                     <div className="flex items-center space-x-1 text-yellow-400">
//                       <Star className="w-4 h-4 fill-current" />
//                       <span className="text-sm font-medium">4.8</span>
//                     </div>
//                   </div>
                  
//                   <div className="flex items-center justify-between">
//                     <span className="text-2xl font-bold text-white">${item.price}</span>
//                     <button
//                       onClick={() => addToCart(item)}
//                       className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
//                     >
//                       <Plus className="w-4 h-4" />
//                       <span>Add</span>
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : !loading && (
//           <div className="text-center py-16">
//             <div className="text-6xl mb-4">🍽️</div>
//             <h3 className="text-2xl font-bold text-white mb-2">No dishes found</h3>
//             <p className="text-white/70 mb-6">
//               {searchTerm ? `No results for "${searchTerm}"` : 'No dishes available in this category'}
//             </p>
//             {(searchTerm || activeCategory !== 'all') && (
//               <button
//                 onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
//                 className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
//               >
//                 Show All Dishes
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Cart Sidebar */}
//       {showCart && (
//         <div className="fixed inset-0 z-50 overflow-hidden">
//           <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
//           <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl">
//             <div className="p-6 h-full flex flex-col">
//               <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
//                 <button
//                   onClick={() => setShowCart(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               {cart.length === 0 ? (
//                 <div className="text-center py-16 flex-1 flex flex-col justify-center">
//                   <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                   <p className="text-gray-500 text-lg">Your cart is empty</p>
//                   <p className="text-gray-400 text-sm mt-2">Add some delicious Nigerian dishes!</p>
//                 </div>
//               ) : (
//                 <>
//                   <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
//                     {cart.map(item => (
//                       <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border">
//                         <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
//                         <div className="flex-1">
//                           <h3 className="font-semibold text-gray-900">{item.name}</h3>
//                           <p className="text-green-600 font-medium">${item.price}</p>
//                         </div>
//                         <div className="flex items-center space-x-3">
//                           <button
//                             onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                             className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//                           >
//                             <Minus className="w-4 h-4" />
//                           </button>
//                           <span className="w-8 text-center font-semibold text-lg">{item.quantity}</span>
//                           <button
//                             onClick={() => updateQuantity(item.id, item.quantity + 1)}
//                             className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//                           >
//                             <Plus className="w-4 h-4" />
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   <div className="border-t pt-4 mb-6 bg-gray-50 -mx-6 px-6 py-4">
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-600">Subtotal ({getTotalItems()} items):</span>
//                       <span className="font-semibold text-gray-900">${getTotalPrice()}</span>
//                     </div>
//                     <div className="flex justify-between items-center mb-2">
//                       <span className="text-gray-600">Delivery Fee:</span>
//                       <span className="font-semibold text-gray-900">$3.99</span>
//                     </div>
//                     <div className="flex justify-between items-center text-xl font-bold text-green-800 pt-2 border-t">
//                       <span>Total:</span>
//                       <span>${(parseFloat(getTotalPrice()) + 3.99).toFixed(2)}</span>
//                     </div>
//                   </div>

//                   <button
//                     onClick={() => setShowCheckout(true)}
//                     className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
//                   >
//                     Proceed to Checkout
//                   </button>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Checkout Modal */}
//       {showCheckout && (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//           <div className="flex items-center justify-center min-h-screen p-4">
//             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
//             <div className="relative bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
//                   <p className="text-gray-600">Complete your order from 9jabuka</p>
//                 </div>
//                 <button
//                   onClick={() => setShowCheckout(false)}
//                   className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//                 >
//                   <X className="w-6 h-6" />
//                 </button>
//               </div>

//               {error && (
//                 <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
//                   {error}
//                 </div>
//               )}
              
//               {orderSuccess && (
//                 <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6">
//                   {orderSuccess}
//                 </div>
//               )}

//               <div className="space-y-8">
//                 <div>
//                   <h3 className="text-xl font-semibold mb-4 flex items-center text-green-800">
//                     <MapPin className="w-5 h-5 mr-2" />
//                     Delivery Address
//                   </h3>
//                   <div className="space-y-4">
//                     <input
//                       type="text"
//                       placeholder="Street Address"
//                       {...register('streetAddress', { required: 'Street address is required' })}
//                       className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//                     />
//                     {errors.streetAddress && <p className="text-red-500 text-sm">{errors.streetAddress.message}</p>}
                    
//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <input
//                           type="text"
//                           placeholder="City"
//                           {...register('city', { required: 'City is required' })}
//                           className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//                         />
//                         {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
//                       </div>
//                       <div>
//                         <input
//                           type="text"
//                           placeholder="ZIP Code"
//                           {...register('zipCode', { required: 'ZIP code is required' })}
//                           className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//                         />
//                         {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode.message}</p>}
//                       </div>
//                     </div>
                    
//                     <div className="flex items-center space-x-3">
//                       <Phone className="w-5 h-5 text-green-600" />
//                       <input
//                         type="tel"
//                         placeholder="Phone Number"
//                         {...register('mobileNumber', {
//                           required: 'Phone number is required',
//                         })}
//                         className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
//                       />
//                     </div>
//                     {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>}
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
//                   <h3 className="text-lg font-semibold mb-4 text-green-800">Order Summary</h3>
//                   <div className="space-y-3">
//                     {cart.map(item => (
//                       <div key={item.id} className="flex justify-between items-center text-sm">
//                         <span>{item.name} × {item.quantity}</span>
//                         <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
//                       </div>
//                     ))}
//                     <div className="border-t border-green-200 pt-3 mt-3">
//                       <div className="flex justify-between text-sm mb-1">
//                         <span>Subtotal ({getTotalItems()} items)</span>
//                         <span>${getTotalPrice()}</span>
//                       </div>
//                       <div className="flex justify-between text-sm mb-3">
//                         <span>Delivery Fee</span>
//                         <span>$3.99</span>
//                       </div>
//                       <div className="flex justify-between font-bold text-lg text-green-800">
//                         <span>Total</span>
//                         <span>${(parseFloat(getTotalPrice()) + 3.99).toFixed(2)}</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <button
//                   type="button"
//                   onClick={handleSubmit(onCheckoutSubmit)}
//                   className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
//                 >
//                   Place Order - ${(parseFloat(getTotalPrice()) + 3.99).toFixed(2)}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FoodOrderingSystem;

'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Clock, MapPin, Phone, Star, Filter, Search, CheckCircle, XCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { getFoods, placeOrder } from '../../src/app/lib/api';

// Placeholder API functions for admin order management
const getOrders = async () => {
  // Example: Fetch orders from backend
  // Replace with actual API call (e.g., fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }))
  return await fetch('/api/orders').then(res => res.json());
};

const updateOrderStatus = async (orderId, status) => {
  // Example: Update order status
  // Replace with actual API call
  return await fetch(`/api/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }).then(res => res.json());
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
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [orders, setOrders] = useState([]);
  const [isAdmin] = useState(true); // Simulate admin status; replace with auth check
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

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

  // Fetch orders for admin
  useEffect(() => {
    if (isAdmin) {
      const fetchOrders = async () => {
        try {
          const ordersData = await getOrders();
          setOrders(ordersData);
        } catch (err) {
          setError('Failed to load orders');
        }
      };
      fetchOrders();
    }
  }, [isAdmin]);

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
      const orderData = {
        items: cart.map(item => ({
          food: item.id,
          quantity: item.quantity,
        })),
        mobileNumber: data.mobileNumber,
        deliveryLocation: `${data.streetAddress}, ${data.city}, ${data.zipCode}`,
      };
      const response = await placeOrder(orderData);
      setOrderSuccess({
        message: `Order placed successfully! Reference: ${response.order.referenceNumber}`,
        orderId: response.order._id,
      });
      setCart([]);
      setShowCheckout(false);
      setShowCart(false);
      reset();
      // Refresh orders for admin
      if (isAdmin) {
        const ordersData = await getOrders();
        setOrders(ordersData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    }
  };

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      const ordersData = await getOrders();
      setOrders(ordersData);
      setOrderSuccess(null); // Clear user success message if admin updates status
    } catch (err) {
      setError('Failed to update order status');
    }
  };

  const formatCategoryName = (category) => {
    if (category === 'all') return 'All Items';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-red-900 to-orange-900">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-lg border-b fixed w-full z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">🇳🇬</div>
              <div>
                <h1 className="text-3xl font-bold text-green-800">9jabuka</h1>
                <p className="text-sm text-gray-600 font-medium">Authentic Nigerian Cuisine</p>
              </div>
            </div>

            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/90"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
             o
             
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full flex items-center space-x-3 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold">${getTotalPrice()}</span>
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {orderSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl shadow-lg flex items-center space-x-3 max-w-md">
          <CheckCircle className="w-6 h-6" />
          <div>
            <p className="font-semibold">{orderSuccess.message}</p>
            <p className="text-sm">You'll receive a confirmation soon.</p>
          </div>
          <button
            onClick={() => setOrderSuccess(null)}
            className="p-1 hover:bg-green-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Mobile Search */}
      <div className="md:hidden mx-4 mb-6 pt-20 relative z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/95 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-20 px-4 pt-32">
        {/* Admin Panel */}
       

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="flex items-center mr-4 mb-2">
            <Filter className="w-5 h-5 text-white/70 mr-2" />
            <span className="text-white/70 font-medium">Filter by:</span>
          </div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                activeCategory === category
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl scale-105'
                  : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 border border-white/20'
              }`}
            >
              {formatCategoryName(category)}
              {category !== 'all' && (
                <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                  {allFoods.filter(food => food.category === category).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80 text-xl">Loading delicious Nigerian dishes...</p>
          </div>
        )}

        {/* Error Message */}
       

        {/* Results Count */}
        {!loading && (
          <div className="text-center mb-8">
            <p className="text-white/80 text-lg">
              Showing {filteredFoods.length} of {allFoods.length} dishes
              {searchTerm && ` for "${searchTerm}"`}
              {activeCategory !== 'all' && ` in ${formatCategoryName(activeCategory)}`}
            </p>
          </div>
        )}

        {/* Menu Grid */}
        {!loading && filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
            {filteredFoods.map(item => (
              <div key={item.id} className="bg-white/10 backdrop-blur-lg rounded-3xl overflow-hidden hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20 group">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {formatCategoryName(item.category)}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-white/80 mb-4 text-sm leading-relaxed">{item.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-white/60">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{item.time}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-white">${item.price}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-5 py-2 rounded-full font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-2xl font-bold text-white mb-2">No dishes found</h3>
            <p className="text-white/70 mb-6">
              {searchTerm ? `No results for "${searchTerm}"` : 'No dishes available in this category'}
            </p>
            {(searchTerm || activeCategory !== 'all') && (
              <button
                onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
              >
                Show All Dishes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-2xl">
            <div className="p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Order</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16 flex-1 flex flex-col justify-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some delicious Nigerian dishes!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 flex-1 overflow-y-auto">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border">
                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-green-600 font-medium">${item.price}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-semibold text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6 bg-gray-50 -mx-6 px-6 py-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Subtotal ({getTotalItems()} items):</span>
                      <span className="font-semibold text-gray-900">${getTotalPrice()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Delivery Fee:</span>
                      <span className="font-semibold text-gray-900">$3.99</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold text-green-800 pt-2 border-t">
                      <span>Total:</span>
                      <span>${(parseFloat(getTotalPrice()) + 3.99).toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    Proceed to Checkout
                  </button>
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCheckout(false)} />
            <div className="relative bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Checkout</h2>
                  <p className="text-gray-600">Complete your order from 9jabuka</p>
                </div>
                <button
                  onClick={() => setShowCheckout(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6">
                  {error}
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 flex items-center text-green-800">
                    <MapPin className="w-5 h-5 mr-2" />
                    Delivery Address
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Street Address"
                      {...register('streetAddress', { required: 'Street address is required' })}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    />
                    {errors.streetAddress && <p className="text-red-500 text-sm">{errors.streetAddress.message}</p>}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          placeholder="City"
                          {...register('city', { required: 'City is required' })}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                        {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="ZIP Code"
                          {...register('zipCode', { required: 'ZIP code is required' })}
                          className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                        />
                        {errors.zipCode && <p className="text-red-500 text-sm">{errors.zipCode.message}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-green-600" />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        {...register('mobileNumber', {
                          required: 'Phone number is required',
                        })}
                        className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                    </div>
                    {errors.mobileNumber && <p className="text-red-500 text-sm">{errors.mobileNumber.message}</p>}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-200">
                  <h3 className="text-lg font-semibold mb-4 text-green-800">Order Summary</h3>
                  <div className="space-y-3">
                    {cart.map(item => (
                      <div key={item.id} className="flex justify-between items-center text-sm">
                        <span>{item.name} × {item.quantity}</span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-green-200 pt-3 mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Subtotal ({getTotalItems()} items)</span>
                        <span>${getTotalPrice()}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-3">
                        <span>Delivery Fee</span>
                        <span>$3.99</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-green-800">
                        <span>Total</span>
                        <span>${(parseFloat(getTotalPrice()) + 3.99).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmit(onCheckoutSubmit)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white py-4 rounded-2xl font-bold transition-all duration-300 hover:scale-105 shadow-lg text-lg"
                >
                  Place Order - ${(parseFloat(getTotalPrice()) + 3.99).toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodOrderingSystem;