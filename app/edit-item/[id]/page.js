'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';

export default function EditItemPage() {
  const router = useRouter();
  const params = useParams(); // get the listing id from URL
  const { id } = params;
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    const fetchListing = async () => {
      const res = await fetch(`http://localhost:5000/api/listings/${id}`);
      const data = await res.json();
      if (data.userId !== user.id) {
        alert('Not authorized to edit this item.');
        router.push('/market');
        return;
      }
      setTitle(data.title);
      setDescription(data.description);
      setPrice(data.price);
      setContactNumber(data.contactNumber);
      setEmail(data.email);
      setCurrentImage(data.imageUrl || '');
      setLoading(false);
    };

    fetchListing();
  }, [id, isSignedIn, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = currentImage;
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', 'ml_default');
      const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      imageUrl = data.secure_url;
    }

    await fetch(`http://localhost:5000/api/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price, contactNumber, email, imageUrl, userId: user.id }),
    });

    router.push('/market');
  };

  if (loading) return <p>Loading listing data...</p>;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Your Item</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow-md flex flex-col gap-4">
        <input type="text" placeholder="Item Title" value={title} onChange={(e) => setTitle(e.target.value)} required className="border px-4 py-2 rounded" />
        <textarea placeholder="Item Description" value={description} onChange={(e) => setDescription(e.target.value)} required className="border px-4 py-2 rounded" />
        <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required className="border px-4 py-2 rounded" />
        <input type="text" placeholder="Contact Number" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required className="border px-4 py-2 rounded" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="border px-4 py-2 rounded" />
        {currentImage && <img src={currentImage} alt="Current Item" className="w-full h-48 object-cover mb-2 rounded" />}
        <input type="file" onChange={(e) => setImage(e.target.files[0])} className="border px-4 py-2 rounded" />
        <button type="submit" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition">Update Item</button>
      </form>
    </div>
  );
}
