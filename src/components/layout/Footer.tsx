
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Flag } from "lucide-react";

const Footer = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <footer className="bg-dirigo-blue text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Dirigo Votes</h3>
            <p className="text-sm text-gray-300">
              A platform for meaningful political discussion, education, and civic engagement.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Links</h3>
            <ul className="space-y-2">
              <li><Link to="/issues" className="text-gray-300 hover:text-white">Issues</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white">About</Link></li>
              <li><Link to="/verify" className="text-gray-300 hover:text-white">Verification</Link></li>
              <li><Link to="/new-signup" className="text-gray-300 hover:text-white">New Sign Up</Link></li>
              {isAuthenticated && (
                <li>
                  <Link to="/reports" className="text-gray-300 hover:text-white flex items-center gap-1">
                    <Flag className="h-4 w-4" />
                    <span>Reports</span>
                  </Link>
                </li>
              )}
              <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact</h3>
            <p className="text-sm text-gray-300">
              Have questions or feedback?<br />
              <a href="mailto:contact@dirigovotes.com" className="text-dirigo-red hover:underline">
                contact@dirigovotes.com
              </a>
            </p>
            <div className="mt-4 flex space-x-4">
              {/* Social media icons would go here */}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Dirigo Votes. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
