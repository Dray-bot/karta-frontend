"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const { isSignedIn, user } = useUser()
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [contactNumber, setContactNumber] = useState("")
  const [email, setEmail] = useState("")
  const [image, setImage] = useState(null)
  const [currentImage, setCurrentImage] = useState("")

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in")
      return
    }

    const fetchListing = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings/${id}`
      )
      const data = await res.json()

      if (data.userId !== user.id) {
        alert("Not authorized to edit this item.")
        router.push("/market")
        return
      }

      setTitle(data.title)
      setDescription(data.description)
      setPrice(data.price)
      setContactNumber(data.contactNumber)
      setEmail(data.email)
      setCurrentImage(data.imageUrl || "")
      setLoading(false)
    }

    fetchListing()
  }, [id, isSignedIn, user, router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    let imageUrl = currentImage
    if (image) {
      const formData = new FormData()
      formData.append("file", image)
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
      )

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      )

      const data = await res.json()
      imageUrl = data.secure_url
    }

    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/listings/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        price,
        contactNumber,
        email,
        imageUrl,
        userId: user.id,
      }),
    })

    router.push("/market")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg font-medium text-gray-600 animate-pulse">
          Loading listing data...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 p-6">
      <motion.h1
        className="text-3xl md:text-4xl font-bold mb-6 text-green-700"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Edit Your Listing
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white p-6 rounded-xl shadow-lg flex flex-col gap-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <input
          type="text"
          placeholder="Item Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />
        <textarea
          placeholder="Item Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />
        <input
          type="text"
          placeholder="Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />

        {currentImage && (
          <div className="flex flex-col items-center gap-2">
            <img
              src={currentImage}
              alt="Current Item"
              className="w-full h-48 object-cover rounded-lg shadow"
            />
            <p className="text-sm text-gray-500">Current Image</p>
          </div>
        )}

        <input
          type="file"
          onChange={(e) => setImage(e.target.files[0])}
          className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />

        <motion.button
          type="submit"
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Update Item
        </motion.button>
      </motion.form>
    </div>
  )
}
