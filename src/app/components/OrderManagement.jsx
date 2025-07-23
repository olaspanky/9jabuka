'use client';

import { useEffect, useState } from 'react';
import { getOrders, updateOrderStatus } from '../lib/api';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders');
      }
    };
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (referenceNumber, status) => {
    try {
      await updateOrderStatus(referenceNumber, status);
      setOrders((prev) =>
        prev.map((order) =>
          order.referenceNumber === referenceNumber ? { ...order, status } : order
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Manage Orders</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.referenceNumber} className="border p-4 rounded-md">
              <h3 className="text-lg font-semibold">Order #{order.referenceNumber}</h3>
              <p><strong>Customer:</strong> {order.mobileNumber}</p>
              <p><strong>Location:</strong> {order.deliveryLocation}</p>
              <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
              <p><strong>Status:</strong> {order.status}</p>
              <div>
                <strong>Items:</strong>
                <ul className="list-disc ml-5">
                  {order.items.map((item, index) => (
                    <li key={index}>
                      {item.food.name} x {item.quantity}
                    </li>
                  ))}
                </ul>
              </div>
              {order.status === 'pending' && (
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => handleStatusUpdate(order.referenceNumber, 'confirmed')}
                    className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(order.referenceNumber, 'cancelled')}
                    className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}