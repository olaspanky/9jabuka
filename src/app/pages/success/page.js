"use client";
import { useEffect } from 'react';
import { useParams } from 'next/navigation';

const SuccessPage = () => {
  const params = useParams();
  const session_id = params.sessionId; // Adjust based on your dynamic route structure

  useEffect(() => {
    if (session_id) {
      fetch('/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session_id }),
      })
        .then(res => res.json())
        .then(data => {
          console.log('Order placed:', data);
        })
        .catch(err => console.error('Error placing order:', err));
      }
  }, [session_id]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-green-50 p-8 rounded-xl">
        <h1 className="text-2xl font-bold text-green-800">Payment Successful!</h1>
        <p className="text-gray-600">Thank you for your order. You'll receive a confirmation soon.</p>
      </div>
    </div>
  );
};

export default SuccessPage;