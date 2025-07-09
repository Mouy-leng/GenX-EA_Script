import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-primary">EduHub</h1>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <a 
              href="#" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
            >
              Resources
            </a>
            <a 
              href="#" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
            >
              Categories
            </a>
            <a 
              href="#" 
              className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
            >
              Community
            </a>
          </nav>
          
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            
            <Button className="hidden md:block bg-primary text-white hover:bg-blue-700 transition-colors duration-200">
              Join Community
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a 
                href="#" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
              >
                Resources
              </a>
              <a 
                href="#" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
              >
                Categories
              </a>
              <a 
                href="#" 
                className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors duration-200"
              >
                Community
              </a>
              <Button className="w-full mt-2 bg-primary text-white hover:bg-blue-700 transition-colors duration-200">
                Join Community
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
