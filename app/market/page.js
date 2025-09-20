'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io } from 'socket.io-client'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { Poppins } from 'next/font/google'
import { Zap, Menu, X } from 'lucide-react'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

let socket

export default function MarketPage() {
  const router = useRouter()
  const { isSignedIn, user } = useUser()
  const [listings, setListings] = useState([])
  const [searchTitle, setSearchTitle] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'

  useEffect(() => {
    const fetchListings = async () => {
      const res = await fetch(`${BACKEND_URL}/api/listings`)
      const data = await res.json()
      setListings(data)
    }
    fetchListings()

    socket = io(BACKEND_URL)
    socket.on('new-listing', (newItem) =>
      setListings((prev) => [newItem, ...prev])
    )
    socket.on('update-listing', (updatedItem) =>
      setListings((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i))
      )
    )
    socket.on('delete-listing', (deletedId) =>
      setListings((prev) => prev.filter((i) => i._id !== deletedId))
    )

    return () => socket.disconnect()
  }, [BACKEND_URL])

  useEffect(() => {
    gsap.from('.listing-card', {
      y: 40,
      opacity: 0,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power3.out',
    })
  }, [listings])

  const filteredListings = listings.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTitle.toLowerCase()) &&
      (maxPrice === '' || item.price <= Number(maxPrice))
  )

  const handleDelete = async (id) => {
    await fetch(`${BACKEND_URL}/api/listings/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    socket.emit('delete-listing', id)
  }

  const handlePublish = async (id) => {
    const res = await fetch(`${BACKEND_URL}/api/listings/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id }),
    })
    if (res.ok) {
      const updated = await res.json()
      socket.emit('update-listing', updated)
    }
  }

  const placeholderImg =
    'https://via.placeholder.com/400x300.png?text=No+Image+Available'

  return (
    <div className={`min-h-screen bg-white ${poppins.className}`}>
      {/* Navbar */}
      <nav className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 250 }}
          >
            <Zap className="w-9 h-9 text-green-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-green-700">Karta</h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={() => router.push('/market')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Market
          </button>
          <button
            onClick={() =>
              isSignedIn ? router.push('/list-item') : router.push('/sign-in')
            }
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            List Item
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            Log Out
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col bg-white shadow-md md:hidden"
          >
            <button
              onClick={() => {
                router.push('/market')
                setMenuOpen(false)
              }}
              className="px-4 py-3 text-left text-green-600 hover:bg-green-50"
            >
              Market
            </button>
            <button
              onClick={() => {
                isSignedIn ? router.push('/list-item') : router.push('/sign-in')
                setMenuOpen(false)
              }}
              className="px-4 py-3 text-left text-green-600 hover:bg-green-50"
            >
              List Item
            </button>
            <button
              onClick={() => {
                router.push('/')
                setMenuOpen(false)
              }}
              className="px-4 py-3 text-left text-red-600 hover:bg-red-50"
            >
              Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="p-6 flex flex-col md:flex-row gap-4 items-center justify-center bg-gray-50 border-b">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTitle}
          onChange={(e) => setSearchTitle(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3 text-gray-900 placeholder-gray-500 bg-white"
        />
        <input
          type="number"
          placeholder="Max price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3 text-gray-900 placeholder-gray-500 bg-white"
        />
      </div>

      {/* Listings */}
      <main className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.length === 0 && (
          <p className="text-gray-600 col-span-full text-center">
            No listings found.
          </p>
        )}
        {filteredListings.map((item) => (
          <motion.div
            key={item._id}
            className="listing-card bg-white/90 backdrop-blur-lg border border-gray-200 p-4 rounded-xl shadow hover:shadow-xl transition relative flex flex-col"
            whileHover={{ scale: 1.02 }}
          >
            <motion.img
              src={item.imageUrl || placeholderImg}
              alt={item.title}
              className="w-full h-48 object-cover mb-3 rounded-lg shadow-sm"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
              onError={(e) => {
                e.currentTarget.src = placeholderImg
              }}
            />
            <h3 className="font-bold text-lg mb-1 text-gray-900">
              {item.title}
            </h3>
            <p className="text-gray-700 mb-2 line-clamp-2">
              {item.description}
            </p>
            <p className="font-semibold mb-2 text-green-600">₦{item.price}</p>
            <p className="text-gray-600 mb-1 text-sm">
              Contact: {item.contactNumber}
            </p>
            <p className="text-gray-600 text-sm">Email: {item.email}</p>
            {isSignedIn && user.id === item.userId && (
              <div className="flex gap-2 mt-3">
                {!item.published && (
                  <button
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                    onClick={() => handlePublish(item._id)}
                  >
                    Publish
                  </button>
                )}
                <button
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm"
                  onClick={() => router.push(`/edit-item/${item._id}`)}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  onClick={() => handleDelete(item._id)}
                >
                  Delete
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </main>
    </div>
  )
}
