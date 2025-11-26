import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Briefcase, Moon, Sun } from "lucide-react";
import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useTheme } from "next-themes"; // ← This is the key

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useUser();
  const { theme, setTheme } = useTheme(); // ← Get current theme & toggle function

  const userRole = user?.publicMetadata?.role as
    | "admin"
    | "freelancer"
    | "client"
    | undefined;

  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return { label: "Admin Dashboard", to: "/dashboard/admin" };
      case "freelancer":
        return { label: "Freelancer Dashboard", to: "/dashboard/freelancer" };
      case "client":
        return { label: "Client Dashboard", to: "/dashboard/client" };
      default:
        return null;
    }
  };

  const dashboard = getDashboardLink();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-2 rounded-lg">
              <Briefcase className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              MyGigsAfrica
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/browse"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Find Freelancers
            </Link>
            <Link
              to="/jobs"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Browse Jobs
            </Link>

            {/* Dashboard Link */}
            <SignedIn>
              {dashboard && (
                <Link
                  to={dashboard.to}
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
                >
                  {dashboard.label}
                </Link>
              )}
            </SignedIn>
          </div>

          {/* Right Side: Theme Toggle + Auth */}
          <div className="hidden md:flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute inset-0 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </button>

            {/* Auth Buttons */}
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="outline">Sign In</Button>
              </SignInButton>
              <Button asChild>
                <Link to="/register">Become a Freelancer</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 dark:text-gray-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-gray-200 dark:border-gray-800">
            <Link
              to="/browse"
              className="block py-2 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Find Freelancers
            </Link>
            <Link
              to="/jobs"
              className="block py-2 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMenuOpen(false)}
            >
              Browse Jobs
            </Link>

            <SignedIn>
              {dashboard && (
                <Link
                  to={dashboard.to}
                  className="block py-2 font-medium text-gray-700 dark:text-gray-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {dashboard.label}
                </Link>
              )}
            </SignedIn>

            {/* Mobile Theme Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-800">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Theme
              </span>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle dark mode</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
              <SignedOut>
                <Button variant="outline" asChild className="w-full">
                  <SignInButton mode="modal">
                    <span>Sign In</span>
                  </SignInButton>
                </Button>
                <Button asChild className="w-full">
                  <Link to="/register">Become a Freelancer</Link>
                </Button>
              </SignedOut>

              <SignedIn>
                <Button variant="outline" asChild className="w-full">
                  <Link
                    to={dashboard?.to || "#"}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                </Button>
              </SignedIn>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
