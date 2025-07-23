'use client';

import { useForm } from 'react-hook-form';
import { uploadFood } from '../lib/api';
import { useState } from 'react';
import { Upload, Image, DollarSign, Clock, Tag, FileText, ChefHat, Check, AlertCircle, X } from 'lucide-react';
import { useEffect } from 'react';

export default function FoodUploadForm() {
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const watchedImage = watch('image');

  // Handle image preview
useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [watchedImage]);

  const onSubmit = async (data) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price);
      formData.append('category', data.category);
      formData.append('cookingTime', data.cookingTime);
      
      if (data.image[0]) {
        formData.append('image', data.image[0]);
      } else {
        throw new Error('No image selected');
      }

      console.log('Sending form data:', Object.fromEntries(formData));
      const response = await uploadFood(formData);
      setSuccess('Food item uploaded successfully! Your delicious dish is now available on 9jabuka.');
      setError(null);
      setImagePreview(null);
      reset();
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err.response?.data?.message || 'Failed to upload food item. Please try again.');
      setSuccess(null);
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    'Main Course',
    'Appetizer',
    'Soup',
    'Rice Dishes',
    'Grilled',
    'Seafood',
    'Vegetarian',
    'Dessert',
    'Beverages',
    'Traditional',
    'Street Food'
  ];

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-green-800 via-red-900 to-orange-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="text-4xl">🇳🇬</div>
            <div>
              <h1 className="text-3xl font-bold text-white">9jabuka</h1>
              <p className="text-sm text-white/80">Admin Panel</p>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Add New Dish</h2>
          <p className="text-white/80">Share the authentic taste of Nigeria with our customers</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-700 p-6 text-white">
            <div className="flex items-center space-x-3">
              <ChefHat className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Upload Food Item</h3>
                <p className="text-green-100">Fill in the details below to add a new dish to the menu</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-green-800">Success!</h4>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-red-800">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <Image className="w-4 h-4 mr-2 text-green-600" />
                  Dish Image
                </label>
                <div className="space-y-4">
                  {imagePreview && (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          reset({ ...watch(), image: null });
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <div className="relative">
                    <input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png"
                      {...register('image', { required: 'Please select an image for your dish' })}
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-50 hover:bg-green-50"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm font-medium text-gray-600">Click to upload image</span>
                      <span className="text-xs text-gray-500">JPEG, PNG (Max 5MB)</span>
                    </label>
                  </div>
                  {errors.image && (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.image.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dish Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <ChefHat className="w-4 h-4 mr-2 text-green-600" />
                    Dish Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="e.g., Jollof Rice with Chicken"
                    {...register('name', { 
                      required: 'Dish name is required',
                      minLength: { value: 2, message: 'Name must be at least 2 characters' }
                    })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                    Price (USD)
                  </label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="15.99"
                    {...register('price', { 
                      required: 'Price is required', 
                      min: { value: 0.01, message: 'Price must be greater than $0' },
                      max: { value: 999.99, message: 'Price must be less than $1000' }
                    })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  />
                  {errors.price && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Category and Cooking Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-2 text-green-600" />
                    Category
                  </label>
                  <select
                    id="category"
                    {...register('category', { required: 'Please select a category' })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900"
                  >
                    <option value="">Select a category...</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* Cooking Time */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-green-600" />
                    Cooking Time (minutes)
                  </label>
                  <input
                    id="cookingTime"
                    type="number"
                    min="1"
                    max="300"
                    placeholder="25"
                    {...register('cookingTime', { 
                      required: 'Cooking time is required', 
                      min: { value: 1, message: 'Cooking time must be at least 1 minute' },
                      max: { value: 300, message: 'Cooking time must be less than 5 hours' }
                    })}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500"
                  />
                  {errors.cookingTime && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.cookingTime.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-green-600" />
                  Description
                </label>
                <textarea
                  id="description"
                  rows="4"
                  placeholder="Describe your delicious Nigerian dish... Include ingredients, preparation style, and what makes it special."
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: { value: 10, message: 'Description must be at least 10 characters' },
                    maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                  })}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-900 placeholder-gray-500 resize-none"
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.description ? (
                    <p className="text-red-500 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.description.message}
                    </p>
                  ) : (
                    <span className="text-gray-500 text-sm">
                      {watch('description')?.length || 0}/500 characters
                    </span>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 disabled:scale-100 shadow-lg flex items-center justify-center space-x-3 text-lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Add Dish to Menu</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-sm">
            Make sure your images are high quality and show the dish clearly. 
            <br />
            This helps customers make better choices and increases orders!
          </p>
        </div>
      </div>
    </div>
  );
}