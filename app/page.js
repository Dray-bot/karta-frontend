"use client"

import { useEffect, useState } from "react"
import { Poppins } from "next/font/google"
import Link from "next/link"
import { Zap } from "lucide-react"
import { motion } from "framer-motion"

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"] })

export default function LandingPage() {
  const [nodes, setNodes] = useState([])
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Create nodes
  useEffect(() => {
    const newNodes = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 3,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
    }))
    setNodes(newNodes)
  }, [])

  // Animate nodes
  useEffect(() => {
    const animate = () => {
      setNodes(prev =>
        prev.map(n => {
          let nx = n.x + n.vx
          let ny = n.y + n.vy
          if (nx < 0 || nx > window.innerWidth) n.vx *= -1
          if (ny < 0 || ny > window.innerHeight) n.vy *= -1
          return { ...n, x: nx, y: ny }
        })
      )
      requestAnimationFrame(animate)
    }
    animate()
  }, [])

  // Track mouse
  useEffect(() => {
    const handleMouse = e => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener("mousemove", handleMouse)
    return () => window.removeEventListener("mousemove", handleMouse)
  }, [])

  return (
    <div className={`${poppins.className} relative w-full h-screen bg-white overflow-hidden`}>
      {/* Particle network background */}
      <svg className="absolute w-full h-full top-0 left-0">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.size} fill="rgba(34,197,94,0.6)" />
        ))}
        {nodes.map((n, i) =>
          nodes.map((m, j) => {
            const dx = n.x - m.x
            const dy = n.y - m.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 120) {
              return (
                <line
                  key={`${i}-${j}`}
                  x1={n.x}
                  y1={n.y}
                  x2={m.x}
                  y2={m.y}
                  stroke="rgba(34,197,94,0.2)"
                  strokeWidth="1"
                />
              )
            }
          })
        )}
        {nodes.map((n, i) => {
          const dx = n.x - mousePos.x
          const dy = n.y - mousePos.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            return (
              <line
                key={`mouse-${i}`}
                x1={n.x}
                y1={n.y}
                x2={mousePos.x}
                y2={mousePos.y}
                stroke="rgba(34,197,94,0.3)"
                strokeWidth="1"
              />
            )
          }
        })}
      </svg>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        {/* Logo + Title */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6"
        >
          <span className="text-4xl md:text-7xl font-bold text-gray-900">
            Welcome to
          </span>
          <span className="flex items-center gap-2 text-green-600 text-4xl md:text-7xl font-bold">
            Karta <Zap className="w-10 h-10 text-green-600" />
          </span>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="text-base md:text-xl text-gray-700 mb-10 max-w-lg md:max-w-2xl px-2"
        >
          Your modern marketplace. Buy smarter, sell faster, and connect directly with trusted people around you.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: "easeOut" }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/sign-in">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition"
            >
              Sign In
            </motion.button>
          </Link>
          <Link href="/sign-up">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 font-semibold text-green-700 border-2 border-green-700 rounded-lg hover:bg-green-700 hover:text-white transition"
            >
              Sign Up
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
