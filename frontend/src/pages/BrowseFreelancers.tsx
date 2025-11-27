import { useState, useMemo, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  MapPin,
  Star,
  Briefcase,
  Filter,
  X,
  DollarSign,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { useKenyaLocations } from "@/hooks/useKenyaLocations";
import { LocationSelect } from "@/components/LocationSelect";
// API imports - uncomment when ready to connect to Django backend
import { fetchFreelancers, fetchProfessions, type Freelancer, type Profession } from "@/lib/api";

// ============================================
// MOCK DATA - Replace with Django API calls
// ============================================
// When ready to connect to backend, uncomment API imports and replace mock data
// with actual API calls using fetchProfessions() and fetchFreelancers()

interface Profession {
  id: number;
  name: string;
  imageUrl: string;
  count: number;
  description: string;
}

// DJANGO BACKEND SETUP:
// Create a Profession model with fields: name, image (ImageField), description
// Create a ProfessionSerializer to serialize the model
// Create a ProfessionViewSet to handle CRUD operations
// Register the viewset in urls.py: router.register(r'professions', ProfessionViewSet)
// The count field should be computed in the serializer by counting related freelancers

const allProfessions: Profession[] = [
  {
    id: 1,
    name: "Carpenter",
    imageUrl:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    count: 1234,
    description: "Furniture making, repairs & installations",
  },
  {
    id: 2,
    name: "Teacher",
    imageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop",
    count: 2156,
    description: "Tutoring & academic support",
  },
  {
    id: 3,
    name: "Mama Fua",
    imageUrl:
      "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=300&fit=crop",
    count: 892,
    description: "Laundry & cleaning services",
  },
  {
    id: 4,
    name: "Photographer",
    imageUrl:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&h=300&fit=crop",
    count: 654,
    description: "Events, portraits & commercial",
  },
  {
    id: 5,
    name: "Plumber",
    imageUrl:
      "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400&h=300&fit=crop",
    count: 1087,
    description: "Pipe repairs & installations",
  },
  {
    id: 6,
    name: "Caregiver",
    imageUrl:
      "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400&h=300&fit=crop",
    count: 743,
    description: "Elderly & child care",
  },
  {
    id: 7,
    name: "Electrician",
    imageUrl:
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
    count: 965,
    description: "Wiring, repairs & installations",
  },
  {
    id: 8,
    name: "Mason",
    imageUrl:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    count: 834,
    description: "Bricklaying & construction",
  },
  {
    id: 9,
    name: "Painter",
    imageUrl:
      "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400&h=300&fit=crop",
    count: 721,
    description: "Interior & exterior painting",
  },
  {
    id: 10,
    name: "Driver",
    imageUrl:
      "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=300&fit=crop",
    count: 1523,
    description: "Personal & commercial driving",
  },
  {
    id: 11,
    name: "Chef",
    imageUrl:
      "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&h=300&fit=crop",
    count: 612,
    description: "Cooking & catering services",
  },
  {
    id: 12,
    name: "Tailor",
    imageUrl:
      "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400&h=300&fit=crop",
    count: 478,
    description: "Clothing design & alterations",
  },
  {
    id: 13,
    name: "Hairdresser",
    imageUrl:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
    count: 891,
    description: "Hair styling & treatments",
  },
  {
    id: 14,
    name: "Mechanic",
    imageUrl:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop",
    count: 1245,
    description: "Vehicle repairs & maintenance",
  },
  {
    id: 15,
    name: "Security Guard",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&h=300&fit=crop",
    count: 1876,
    description: "Property & personal security",
  },
  {
    id: 16,
    name: "Gardener",
    imageUrl:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    count: 567,
    description: "Landscaping & plant care",
  },
  {
    id: 17,
    name: "Cleaner",
    imageUrl:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    count: 1432,
    description: "Home & office cleaning",
  },
  {
    id: 18,
    name: "Babysitter",
    imageUrl:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop",
    count: 923,
    description: "Child care & supervision",
  },
  {
    id: 19,
    name: "Web Developer",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=300&fit=crop",
    count: 534,
    description: "Website & app development",
  },
  {
    id: 20,
    name: "Graphic Designer",
    imageUrl:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop",
    count: 687,
    description: "Visual design & branding",
  },
];

// Generate mock freelancers for all professions with real location data
const generateFreelancersForProfession = (profession: Profession) => {
  const firstNames = [
    "Sarah",
    "Michael",
    "Grace",
    "David",
    "Jane",
    "Peter",
    "Lucy",
    "James",
    "Mary",
    "John",
    "Ruth",
    "Daniel",
    "Ann",
    "Joseph",
    "Faith",
  ];
  const lastNames = [
    "Wanjiku",
    "Ochieng",
    "Muthoni",
    "Kipchoge",
    "Njeri",
    "Kamau",
    "Akinyi",
    "Otieno",
    "Wambui",
    "Mutua",
    "Chepkemoi",
    "Kimani",
    "Waithera",
    "Korir",
    "Nyambura",
  ];

  // Real locations from API
  const locations = [
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Westlands",
      ward: "Kitisuru",
    },
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Westlands",
      ward: "Parklands/Highridge",
    },
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Langata",
      ward: "Karen",
    },
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Dagoretti North",
      ward: "Kilimani",
    },
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Embakasi South",
      ward: "Pipeline",
    },
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Kasarani",
      ward: "Zimmerman",
    },
    {
      county: "Nairobi",
      countyCode: 47,
      constituency: "Roysambu",
      ward: "Kahawa West",
    },
    {
      county: "Mombasa",
      countyCode: 1,
      constituency: "Mvita",
      ward: "Shimanzi/Ganjoni",
    },
    {
      county: "Mombasa",
      countyCode: 1,
      constituency: "Nyali",
      ward: "Kongowea",
    },
    {
      county: "Mombasa",
      countyCode: 1,
      constituency: "Kisauni",
      ward: "Bamburi",
    },
    {
      county: "Mombasa",
      countyCode: 1,
      constituency: "Likoni",
      ward: "Mtongwe",
    },
    {
      county: "Kisumu",
      countyCode: 42,
      constituency: "Kisumu Central",
      ward: "Market Milimani",
    },
    {
      county: "Kisumu",
      countyCode: 42,
      constituency: "Kisumu West",
      ward: "Central Kisumu",
    },
    {
      county: "Kisumu",
      countyCode: 42,
      constituency: "Kisumu East",
      ward: "Kajulu",
    },
    {
      county: "Kiambu",
      countyCode: 22,
      constituency: "Thika Town",
      ward: "Township",
    },
    {
      county: "Kiambu",
      countyCode: 22,
      constituency: "Ruiru",
      ward: "Biashara",
    },
    {
      county: "Kiambu",
      countyCode: 22,
      constituency: "Kikuyu",
      ward: "Kikuyu",
    },
    {
      county: "Nakuru",
      countyCode: 32,
      constituency: "Nakuru Town East",
      ward: "Biashara",
    },
    {
      county: "Nakuru",
      countyCode: 32,
      constituency: "Nakuru Town West",
      ward: "London",
    },
    {
      county: "Nakuru",
      countyCode: 32,
      constituency: "Naivasha",
      ward: "Lake View",
    },
  ];

  const freelancers = [];
  const count = Math.floor(Math.random() * 8) + 5; // 5-12 freelancers per profession

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];

    // Generate skills based on profession
    const skillsMap: Record<string, string[]> = {
      Carpenter: [
        "Furniture Making",
        "Cabinet Installation",
        "Wood Carving",
        "Repairs",
        "Custom Design",
      ],
      Teacher: ["Mathematics", "Science", "English", "History", "Geography"],
      "Mama Fua": [
        "Laundry",
        "Ironing",
        "Dry Cleaning",
        "Stain Removal",
        "Folding",
      ],
      Photographer: ["Portrait", "Events", "Product", "Editing", "Lighting"],
      Plumber: [
        "Pipe Installation",
        "Leak Repair",
        "Water Heating",
        "Drainage",
        "Maintenance",
      ],
      Caregiver: [
        "Elderly Care",
        "Child Care",
        "First Aid",
        "Companionship",
        "Meal Prep",
      ],
      Electrician: [
        "Wiring",
        "Installation",
        "Repairs",
        "Maintenance",
        "Solar Systems",
      ],
      Mason: [
        "Bricklaying",
        "Plastering",
        "Tiling",
        "Foundation",
        "Concrete Work",
      ],
      Painter: [
        "Interior",
        "Exterior",
        "Decorative",
        "Spray Painting",
        "Wallpaper",
      ],
      Driver: [
        "Personal",
        "Commercial",
        "Delivery",
        "Long Distance",
        "Chauffeur",
      ],
      Chef: [
        "Continental",
        "Local Cuisine",
        "Baking",
        "Catering",
        "Meal Planning",
      ],
      Tailor: [
        "Dressmaking",
        "Alterations",
        "Custom Design",
        "Fitting",
        "Repairs",
      ],
      Hairdresser: [
        "Braiding",
        "Styling",
        "Coloring",
        "Treatments",
        "Extensions",
      ],
      Mechanic: [
        "Engine Repair",
        "Diagnostics",
        "Maintenance",
        "Bodywork",
        "Electrical",
      ],
      "Security Guard": [
        "Surveillance",
        "Patrol",
        "Access Control",
        "Reporting",
        "Emergency Response",
      ],
      Gardener: [
        "Landscaping",
        "Lawn Care",
        "Planting",
        "Pruning",
        "Irrigation",
      ],
      Cleaner: [
        "Deep Cleaning",
        "Office Cleaning",
        "Carpet Cleaning",
        "Window Cleaning",
        "Sanitization",
      ],
      Babysitter: [
        "Child Supervision",
        "Meal Preparation",
        "Activity Planning",
        "Homework Help",
        "First Aid",
      ],
      "Web Developer": [
        "React",
        "Node.js",
        "TypeScript",
        "JavaScript",
        "HTML/CSS",
      ],
      "Graphic Designer": [
        "Photoshop",
        "Illustrator",
        "Figma",
        "Logo Design",
        "Branding",
      ],
    };

    const professionSkills = skillsMap[profession.name] || [
      "Skill 1",
      "Skill 2",
      "Skill 3",
    ];
    const skills = professionSkills.slice(0, 3 + Math.floor(Math.random() * 2));

    freelancers.push({
      id: `${profession.id}-${i}`,
      name: `${firstName} ${lastName}`,
      profession: profession.name,
      location: location.ward,
      constituency: location.constituency,
      county: location.county,
      countyCode: location.countyCode.toString(),
      rating: (4.0 + Math.random() * 1.0).toFixed(1),
      reviews: Math.floor(Math.random() * 300) + 10,
      hourlyRate: `$${15 + Math.floor(Math.random() * 35)}`,
      hourlyRateNumber: 15 + Math.floor(Math.random() * 35),
      skills: skills,
      avatar: `${firstName.charAt(0)}${lastName.charAt(0)}`,
      completedJobs: Math.floor(Math.random() * 400) + 10,
      yearsExperience: Math.floor(Math.random() * 10) + 1,
      availability: Math.random() > 0.3 ? "Available" : "Busy",
    });
  }

  return freelancers;
};

const allFreelancers: any[] = [];

const ITEMS_PER_PAGE = 12;

const BrowseFreelancers = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchParam = searchParams.get("search");
  const { counties } = useKenyaLocations();

  // ============================================
  // API INTEGRATION - Uncomment when ready
  // ============================================
  // Step 1: Add state for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0); // Total freelancers from API

  // Step 2: Replace allFreelancers with API data
  const [freelancersData, setFreelancersData] = useState<Freelancer[]>([]);

  // Step 3: Fetch freelancers whenever filters change
     priceRange, currentPage]);

  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>("");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("");
  const [selectedConstituencyName, setSelectedConstituencyName] =
    useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [selectedWardName, setSelectedWardName] = useState<string>("");
  const [selectedProfession, setSelectedProfession] =
    useState<Profession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Additional filters
  const [minRating, setMinRating] = useState<number>(0);
  const [minExperience, setMinExperience] = useState<number>(0);

  // Location change handlers - using useCallback to prevent re-renders
  const handleCountyChange = useCallback(
    (countyId: string, countyName: string) => {
      setSelectedCounty(countyId);
      setSelectedCountyName(countyName);
      setSelectedConstituency("");
      setSelectedConstituencyName("");
      setSelectedWard("");
      setSelectedWardName("");
    },
    []
  );

  const handleConstituencyChange = useCallback(
    (constituencyId: string, constituencyName: string) => {
      setSelectedConstituency(constituencyId);
      setSelectedConstituencyName(constituencyName);
      setSelectedWard("");
      setSelectedWardName("");
    },
    []
  );

  const handleWardChange = useCallback((wardId: string, wardName: string) => {
    setSelectedWard(wardId);
    setSelectedWardName(wardName);
  }, []);

  // Filter professions based on search (use URL param or manual search)
  const filteredProfessions = useMemo(() => {
    const activeSearch = searchQuery || urlSearchParam || "";
    return allProfessions.filter((profession) => {
      const matchesSearch =
        activeSearch === "" ||
        profession.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        profession.description
          .toLowerCase()
          .includes(activeSearch.toLowerCase());

      return matchesSearch;
    });
  }, [searchQuery, urlSearchParam]);

  // Paginate professions
  const paginatedProfessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProfessions.slice(startIndex, endIndex);
  }, [filteredProfessions, currentPage]);

  const totalPages = Math.ceil(filteredProfessions.length / ITEMS_PER_PAGE);

  // Get freelancers for selected profession - memoized to prevent regeneration
  const professionFreelancers = useMemo(() => {
    if (!selectedProfession) return [];
    return generateFreelancersForProfession(selectedProfession);
  }, [selectedProfession?.id]); // Only depend on profession ID to prevent unnecessary re-renders

  // Filter freelancers when a profession is selected
  const filteredFreelancers = useMemo(() => {
    if (!selectedProfession) return [];

    const activeSearch = searchQuery.trim();
    return professionFreelancers.filter((freelancer) => {
      const matchesSearch =
        !activeSearch ||
        freelancer.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        freelancer.skills.some((skill: string) =>
          skill.toLowerCase().includes(activeSearch.toLowerCase())
        );

      const matchesCounty =
        !selectedCountyName || freelancer.county === selectedCountyName;
      const matchesConstituency =
        !selectedConstituencyName ||
        freelancer.constituency === selectedConstituencyName;
      const matchesWard =
        !selectedWardName || freelancer.location === selectedWardName;
      const matchesRating = parseFloat(freelancer.rating) >= minRating;
      const matchesExperience = freelancer.yearsExperience >= minExperience;

      return (
        matchesSearch &&
        matchesCounty &&
        matchesConstituency &&
        matchesWard &&
        matchesRating &&
        matchesExperience
      );
    });
  }, [
    selectedProfession,
    professionFreelancers,
    searchQuery,
    selectedCountyName,
    selectedConstituencyName,
    selectedWardName,
    minRating,
    minExperience,
  ]);

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCounty("");
    setSelectedCountyName("");
    setSelectedConstituency("");
    setSelectedConstituencyName("");
    setSelectedWard("");
    setSelectedWardName("");
    setMinRating(0);
    setMinExperience(0);
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedCounty ||
    selectedConstituency ||
    selectedWard ||
    minRating > 0 ||
    minExperience > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedProfession
                ? `${selectedProfession.name} Professionals`
                : "Find Talented Freelancers"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {selectedProfession
                ? `Browse skilled ${selectedProfession.name.toLowerCase()}s across Kenya and Africa`
                : "Connect with skilled professionals across Kenya and Africa"}
            </p>
            {selectedProfession && (
              <Button
                variant="outline"
                className="mt-4 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  setSelectedProfession(null);
                  resetAllFilters();
                }}
              >
                ← Back to All Professions
              </Button>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Search Bar - Always visible at top */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    placeholder=""
                    className="pl-10 h-14 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>

                {/* All Filters - Show when profession is selected */}
                {selectedProfession && (
                  <div className="border-t pt-6 space-y-6">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Filters
                        </h3>
                        {hasActiveFilters && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                          >
                            Active
                          </Badge>
                        )}
                      </div>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetAllFilters}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear All
                        </Button>
                      )}
                    </div>

                    {/* Location Filters */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Location
                      </h4>
                      <LocationSelect
                        selectedCounty={selectedCounty}
                        selectedConstituency={selectedConstituency}
                        selectedWard={selectedWard}
                        onCountyChange={handleCountyChange}
                        onConstituencyChange={handleConstituencyChange}
                        onWardChange={handleWardChange}
                        showLabels={false}
                      />
                    </div>

                    {/* Rating Filter */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        Minimum Rating
                      </h4>
                      <Select
                        value={minRating.toString()}
                        onValueChange={(val) => setMinRating(parseFloat(val))}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectValue placeholder="Any rating" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 z-50">
                          <SelectItem value="0">Any Rating</SelectItem>
                          <SelectItem value="3">3+ Stars</SelectItem>
                          <SelectItem value="4">4+ Stars</SelectItem>
                          <SelectItem value="4.5">4.5+ Stars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Experience Filter */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Minimum Experience
                      </h4>
                      <Select
                        value={minExperience.toString()}
                        onValueChange={(val) => setMinExperience(parseInt(val))}
                      >
                        <SelectTrigger className="h-11 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                          <SelectValue placeholder="Any experience" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 z-50">
                          <SelectItem value="0">Any Experience</SelectItem>
                          <SelectItem value="1">1+ Years</SelectItem>
                          <SelectItem value="3">3+ Years</SelectItem>
                          <SelectItem value="5">5+ Years</SelectItem>
                          <SelectItem value="10">10+ Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Filters Display */}
          {selectedProfession && hasActiveFilters && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Active Filters:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCounty && selectedCounty !== "all" && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCounty}
                  </Badge>
                )}
                {selectedConstituencyName && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {selectedConstituencyName}
                  </Badge>
                )}
                {selectedWardName && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  >
                    {selectedWardName}
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {minRating}+ Rating
                  </Badge>
                )}
                {minExperience > 0 && (
                  <Badge
                    variant="secondary"
                    className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {minExperience}+ Years
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Professions Grid - Show when no profession selected */}
          {!selectedProfession ? (
            <>
              {/* Results Count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filteredProfessions.length}
                  </span>{" "}
                  professions available
                </p>
              </div>

              {filteredProfessions.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-gray-800">
                  <div className="text-gray-600 dark:text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      No professions found
                    </h3>
                    <p>Try a different search term</p>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {paginatedProfessions.map((profession, idx) => (
                      <motion.div
                        key={profession.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.03 }}
                      >
                        <Card
                          className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group overflow-hidden bg-white dark:bg-gray-800"
                          onClick={() => {
                            setSelectedProfession(profession);
                            setSearchQuery("");
                          }}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={profession.imageUrl}
                              alt={profession.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="font-bold text-xl mb-1 text-white">
                                {profession.name}
                              </h3>
                              <p className="text-sm text-gray-200">
                                {profession.count} available
                              </p>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {profession.description}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                              }
                              className={
                                currentPage === 1
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                              page === 1 ||
                              page === totalPages ||
                              (page >= currentPage - 1 &&
                                page <= currentPage + 1)
                            ) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink
                                    onClick={() => setCurrentPage(page)}
                                    isActive={currentPage === page}
                                    className="cursor-pointer"
                                  >
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (
                              page === currentPage - 2 ||
                              page === currentPage + 2
                            ) {
                              return <PaginationEllipsis key={page} />;
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  Math.min(totalPages, prev + 1)
                                )
                              }
                              className={
                                currentPage === totalPages
                                  ? "pointer-events-none opacity-50"
                                  : "cursor-pointer"
                              }
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            /* Freelancers Grid - Show when profession selected */
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {filteredFreelancers.length}
                  </span>{" "}
                  {selectedProfession.name.toLowerCase()}s found
                </p>
              </div>

              {filteredFreelancers.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-gray-800">
                  <div className="text-gray-600 dark:text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                      No freelancers found
                    </h3>
                    <p>Try adjusting your location filters</p>
                  </div>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFreelancers.map((freelancer, idx) => (
                    <motion.div
                      key={freelancer.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.03 }}
                    >
                      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 border-gray-200 dark:border-gray-800">
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardContent className="pt-6 relative z-10">
                          {/* Avatar & Name */}
                          <div className="flex flex-col items-center text-center mb-4">
                            <div className="relative mb-4">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                {freelancer.avatar}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                            <Link to={`/freelancer/${freelancer.id}`}>
                              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                                {freelancer.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                              {freelancer.profession}
                            </p>
                          </div>

                          {/* Location */}
                          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2 px-3 mb-4">
                            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                            {freelancer.location}, {freelancer.county}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg py-2 px-3 mb-4 border border-amber-200 dark:border-amber-800">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-gray-900 dark:text-white">
                              {freelancer.rating}
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              ({freelancer.reviews} reviews)
                            </span>
                          </div>

                          {/* Actions */}
                          <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                            asChild
                          >
                            <Link to={`/freelancer/${freelancer.id}`}>
                              View Profile
                              <svg
                                className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BrowseFreelancers;
