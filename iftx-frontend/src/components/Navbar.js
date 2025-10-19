import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/login", label: "Login", icon: "🔐" },
    { path: "/signup", label: "Sign Up", icon: "📝" },
    { path: "/admin-login", label: "Admin", icon: "👨‍💼" },
  ];

  return (
    <nav className={`
      fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out
      ${isScrolled 
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50' 
        : 'bg-gradient-to-r from-blue-600/95 via-blue-700/95 to-purple-700/95 backdrop-blur-sm'
      }
      animate-slide-up
    `}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo Section */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group"
          >
            <div className={`
              relative p-2 rounded-xl transition-all duration-300 group-hover:scale-110
              ${isScrolled 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                : 'bg-white/20 backdrop-blur-sm'
              }
              group-hover:shadow-lg group-hover:shadow-blue-500/25
            `}>
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center animate-bounce-gentle">
                <span className="text-blue-600 font-bold text-lg">⚡</span>
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className={`
                font-bold text-2xl transition-all duration-300 group-hover:scale-105
                ${isScrolled ? 'text-gray-800' : 'text-white'}
              `}>
                IFTX
              </h1>
              <span className={`
                text-xs font-medium -mt-1 transition-all duration-300
                ${isScrolled ? 'text-blue-600' : 'text-blue-200'}
              `}>
                Solar Solutions
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ease-out
                  group hover:scale-105 flex items-center space-x-2
                  ${isActiveRoute(link.path)
                    ? isScrolled
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                    : isScrolled
                      ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }
                  before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-r 
                  before:from-blue-400/20 before:to-purple-400/20 before:opacity-0 
                  before:transition-opacity before:duration-300 hover:before:opacity-100
                `}
              >
                <span className="text-sm">{link.icon}</span>
                <span className="relative z-10">{link.label}</span>
                {isActiveRoute(link.path) && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-bounce" />
                )}
              </Link>
            ))}
          </div>

          {/* CTA Button (Desktop) */}
          <div className="hidden md:block">
            <button className={`
              relative overflow-hidden px-6 py-2 rounded-xl font-semibold transition-all duration-300 ease-out
              transform hover:scale-105 hover:shadow-lg group
              ${isScrolled
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/25'
                : 'bg-white text-blue-600 hover:bg-blue-50'
              }
              before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent 
              before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
            `}>
              <span className="relative z-10 flex items-center space-x-2">
                <span>Get Quote</span>
                <span className="transform group-hover:translate-x-1 transition-transform duration-300">→</span>
              </span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className={`
              md:hidden p-2 rounded-xl transition-all duration-300 hover:scale-110
              ${isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}
            `}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
              <div className={`
                w-6 h-0.5 transition-all duration-300 transform origin-center
                ${isMenuOpen ? 'rotate-45 translate-y-1' : ''}
                ${isScrolled ? 'bg-gray-700' : 'bg-white'}
              `} />
              <div className={`
                w-6 h-0.5 transition-all duration-300
                ${isMenuOpen ? 'opacity-0' : 'opacity-100'}
                ${isScrolled ? 'bg-gray-700' : 'bg-white'}
              `} />
              <div className={`
                w-6 h-0.5 transition-all duration-300 transform origin-center
                ${isMenuOpen ? '-rotate-45 -translate-y-1' : ''}
                ${isScrolled ? 'bg-gray-700' : 'bg-white'}
              `} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`
          md:hidden overflow-hidden transition-all duration-500 ease-out
          ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className={`
            py-4 space-y-2 border-t transition-all duration-300
            ${isScrolled ? 'border-gray-200' : 'border-white/20'}
          `}>
            {navLinks.map((link, index) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300
                  transform hover:scale-105 hover:translate-x-2
                  ${isActiveRoute(link.path)
                    ? isScrolled
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white/20 text-white backdrop-blur-sm'
                    : isScrolled
                      ? 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                      : 'text-white/90 hover:bg-white/10 hover:text-white'
                  }
                  animate-slide-up
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-lg">{link.icon}</span>
                <span>{link.label}</span>
                {isActiveRoute(link.path) && (
                  <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse" />
                )}
              </Link>
            ))}
            
            {/* Mobile CTA */}
            <div className="pt-4 px-4">
              <button className={`
                w-full relative overflow-hidden py-3 rounded-xl font-semibold transition-all duration-300
                transform hover:scale-105 animate-scale-in
                ${isScrolled
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white text-blue-600'
                }
                before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/20 before:to-transparent 
                before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700
              `}>
                <span className="relative z-10">Get Free Quote</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Background overlay for mobile menu */}
      {isMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
}

export default Navbar;
