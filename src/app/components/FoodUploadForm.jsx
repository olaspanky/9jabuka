'use client';

import { useForm } from 'react-hook-form';
import { uploadFood } from '../lib/api';
import { useState } from 'react';

export default function FoodUploadForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const onSubmit = async (data) => {
    try {
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
      setSuccess('Food item uploaded successfully!');
      setError(null);
      reset();
    } catch (err) {
      console.error('Frontend error:', err);
      setError(err.response?.data?.message || 'Failed to upload food item');
      setSuccess(null);
    }
  };

  return (
    <div className="max-w-md text-black mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Upload Food Item</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            id="name"
            type="text"
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            {...register('description', { required: 'Description is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price ($)</label>
          <input
            id="price"
            type="number"
            step="0.01"
            {...register('price', { required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <input
            id="category"
            type="text"
            {...register('category', { required: 'Category is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        <div>
          <label htmlFor="cookingTime" className="block text-sm font-medium text-gray-700">Cooking Time (minutes)</label>
          <input
            id="cookingTime"
            type="number"
            {...register('cookingTime', { required: 'Cooking time is required', min: { value: 1, message: 'Cooking time must be at least 1 minute' } })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
          {errors.cookingTime && <p className="text-red-500 text-sm">{errors.cookingTime.message}</p>}
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (JPEG/PNG)</label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/jpg,image/png"
            {...register('image', { required: 'Image is required' })}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {errors.image && <p className="text-red-500 text-sm">{errors.image.message}</p>}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Upload
        </button>
      </form>
    </div>
  );
}