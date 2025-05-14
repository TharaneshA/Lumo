"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import LoginModal from "./auth/login-modal"
import SignupModal from "./auth/signup-modal"

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openLoginModal = () => {
    setShowLoginModal(true)
    setIsMobileMenuOpen(false)
  }

  const openSignupModal = () => {
    setShowSignupModal(true)
    setIsMobileMenuOpen(false)
  }

  const switchToSignup = () => {
    setShowLoginModal(false)
    setShowSignupModal(true)
  }

  const switchToLogin = () => {
    setShowSignupModal(false)
    setShowLoginModal(true)
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? "bg-background/95 backdrop-blur-sm shadow-md" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-primary font-heading">Lumo</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                How It Works
              </Link>
              <Button variant="ghost" className="hover:text-primary" onClick={openLoginModal}>
                Login
              </Button>
              <Button
                className="glow-effect bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={openSignupModal}
              >
                Sign Up
              </Button>
            </nav>

            <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
              <Link
                href="/"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="#features"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              <Button variant="ghost" className="justify-start" onClick={openLoginModal}>
                Login
              </Button>
              <Button
                className="glow-effect bg-primary text-primary-foreground hover:bg-primary/90 w-full"
                onClick={openSignupModal}
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modals */}
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSwitchToSignup={switchToSignup} />}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} onSwitchToLogin={switchToLogin} />}
    </>
  )
}
