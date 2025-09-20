'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import {
  ShoppingBag,
  Upload,
  Phone,
  Mail,
  DollarSign,
  Type,
  FileText,
  ShoppingCart,
  Tag,
} from 'lucide-react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default function ListItemPage() {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [loading, setLoading] = useState(true);

  const bgRef = useRef(null);

  useEffect(() => {
    if (loading) {
      if (!isSignedIn) router.push('/sign-in');
      else setLoading(false);
    }
  }, [isSignedIn, loading, router]);

  // Animate background floating icons
  useEffect(() => {
    if (bgRef.current) {
      gsap.to('.bg-icon', {
        y: '+=20',
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        duration: 3,
        stagger: 0.5,
      });
    }
  }, []);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState(user?.primaryEmailAddress?.emailAddress || '');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isSignedIn) return;

    let imageUrl = '';
    if (image) {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      imageUrl = data.secure_url;
    }

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        price,
        contactNumber,
        email,
        imageUrl,
        userId: user.id,
      }),
    });

    router.push('/market');
  };

  if (loading)
    return <p className="text-center mt-20 text-lg sm:text-xl">Checking authentication...</p>;

  return (
    <div
      ref={bgRef}
      className={`relative min-h-screen bg-white flex flex-col items-center px-3 sm:px-6 md:px-8 py-6 overflow-hidden ${poppins.className}`}
    >
      {/* Background floating icons */}
      <ShoppingCart className="bg-icon absolute top-8 left-4 w-8 h-8 sm:w-10 sm:h-10 text-green-200 opacity-40" />
      <Tag className="bg-icon absolute top-32 right-6 w-10 h-10 sm:w-12 sm:h-12 text-green-300 opacity-40" />
      <DollarSign className="bg-icon absolute bottom-24 left-1/4 w-12 h-12 sm:w-14 sm:h-14 text-green-200 opacity-30" />
      <ShoppingBag className="bg-icon absolute bottom-12 right-1/4 w-10 h-10 sm:w-12 sm:h-12 text-green-300 opacity-30" />

      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-10 text-center"
      >
        <ShoppingBag className="w-8 h-8 sm:w-9 sm:h-9 text-green-600" />
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
          Sell Something Awesome
        </h1>
      </motion.div>

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg bg-gray-50 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 grid gap-4 sm:gap-5"
      >
        {/* Title */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Type className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0" />
          <input
            type="text"
            placeholder="Product Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="flex-1 border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-500 outline-none text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Description */}
        <div className="flex items-start gap-2 sm:gap-3">
          <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-1.5 shrink-0" />
          <textarea
            placeholder="Product Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="flex-1 border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-500 outline-none min-h-[90px] sm:min-h-[120px] text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 sm:gap-3">
          <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0" />
          <input
            type="number"
            placeholder="Price in NGN"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="flex-1 border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-500 outline-none text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Contact */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0" />
          <input
            type="text"
            placeholder="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
            className="flex-1 border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-500 outline-none text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Email */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0" />
          <input
            type="email"
            placeholder="Contact Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base focus:ring-2 focus:ring-green-500 outline-none text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* File Upload */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 shrink-0" />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="flex-1 border border-gray-300 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base cursor-pointer text-gray-800"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base md:text-lg shadow-md hover:bg-green-700 transition"
        >
          Publish Listing
        </motion.button>
      </motion.form>
    </div>
  );
}
