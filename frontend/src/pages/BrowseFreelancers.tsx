import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Search, MapPin, Star, Briefcase, Filter, X, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useKenyaLocations } from "@/hooks/useKenyaLocations";
import { LocationSelect } from "@/components/LocationSelect";

// ----- Types (match your DRF serializers) -----
interface Profession {
  id: number;
  name: string;
  imageUrl?: string | null;
  count?: number;
  description?: string;
}

interface Freelancer {
  id: number | string;
  name: string;
  profession_name?: string;
  county?: string;
  constituency?: string;
  ward?: string;
  rating?: number | string;
  review_count?: number;
  hourly_rate?: string | number;
  years_experience?: number;
  completed_jobs?: number;
  skills?: string[];
  avatar?: string | null;
  avatar_initials?: string | null;
  availability?: string;
  // any other fields from your API may be present
}

// ----- Constants -----
const ITEMS_PER_PAGE = 12;

const BrowseFreelancers = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const urlSearchParam = searchParams.get("search") ?? "";

  const { counties } = useKenyaLocations();

  // Loading & errors
  const [isLoadingProfessions, setIsLoadingProfessions] = useState(false);
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Data
  const [professionsData, setProfessionsData] = useState<Profession[]>([]);
  const [freelancersData, setFreelancersData] = useState<Freelancer[]>([]);
  const [totalFreelancerCount, setTotalFreelancerCount] = useState<number>(0);

  // UI state / filters
  const [selectedProfession, setSelectedProfession] = useState<Profession | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(urlSearchParam);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedCountyName, setSelectedCountyName] = useState<string>("");
  const [selectedConstituency, setSelectedConstituency] = useState<string>("");
  const [selectedConstituencyName, setSelectedConstituencyName] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [selectedWardName, setSelectedWardName] = useState<string>("");

  const [minRating, setMinRating] = useState<number>(0);
  const [minExperience, setMinExperience] = useState<number>(0);

  // ----- Handlers for location select (passed to LocationSelect) -----
  const handleCountyChange = useCallback((countyId: string, countyName: string) => {
    setSelectedCounty(countyId);
    setSelectedCountyName(countyName);
    setSelectedConstituency("");
    setSelectedConstituencyName("");
    setSelectedWard("");
    setSelectedWardName("");
    setCurrentPage(1);
  }, []);

  const handleConstituencyChange = useCallback((constituencyId: string, constituencyName: string) => {
    setSelectedConstituency(constituencyId);
    setSelectedConstituencyName(constituencyName);
    setSelectedWard("");
    setSelectedWardName("");
    setCurrentPage(1);
  }, []);

  const handleWardChange = useCallback((wardId: string, wardName: string) => {
    setSelectedWard(wardId);
    setSelectedWardName(wardName);
    setCurrentPage(1);
  }, []);

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
    setCurrentPage(1);
  };

  const hasActiveFilters =
    !!selectedCounty ||
    !!selectedConstituency ||
    !!selectedWard ||
    minRating > 0 ||
    minExperience > 0 ||
    !!searchQuery;

  // ----- Fetch Professions on mount -----
  useEffect(() => {
    let mounted = true;
    const loadProfessions = async () => {
      setIsLoadingProfessions(true);
      setApiError(null);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/professions/");
        if (!res.ok) throw new Error(`Failed to fetch professions: ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        setProfessionsData(Array.isArray(data) ? data : data.results ?? []);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setApiError("Failed to load professions.");
        // keep professionsData empty
      } finally {
        if (mounted) setIsLoadingProfessions(false);
      }
    };
    loadProfessions();
    return () => {
      mounted = false;
    };
  }, []);

  // ----- Fetch freelancers when profession selected or filters change -----
  useEffect(() => {
    if (!selectedProfession) {
      // Clear freelancer state when no profession selected
      setFreelancersData([]);
      setTotalFreelancerCount(0);
      return;
    }

    let mounted = true;

    const loadFreelancers = async () => {
      setIsLoadingFreelancers(true);
      setApiError(null);

      try {
        const params = new URLSearchParams();
        if (searchQuery) params.append("search", searchQuery);
        if (selectedCountyName) params.append("county", selectedCountyName);
        if (selectedConstituencyName) params.append("constituency", selectedConstituencyName);
        if (selectedWardName) params.append("ward", selectedWardName);
        if (minRating > 0) params.append("min_rating", String(minRating));
        if (minExperience > 0) params.append("min_experience", String(minExperience));
        params.append("page", String(currentPage));
        params.append("page_size", String(ITEMS_PER_PAGE));

        const url = `http://127.0.0.1:8000/api/professions/${selectedProfession.id}/freelancers/?${params.toString()}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch freelancers: ${res.status}`);
        const data = await res.json();

        // Expecting DRF paginated response: { count, next, previous, results }
        if (!mounted) return;
        setFreelancersData(Array.isArray(data.results) ? data.results : data.results ?? []);
        setTotalFreelancerCount(typeof data.count === "number" ? data.count : Number(data.count) || 0);
      } catch (err) {
        console.error(err);
        if (!mounted) return;
        setApiError("Failed to load freelancers.");
        setFreelancersData([]); // keep UI consistent and empty
        setTotalFreelancerCount(0);
      } finally {
        if (mounted) setIsLoadingFreelancers(false);
      }
    };

    loadFreelancers();

    return () => {
      mounted = false;
    };
  }, [
    selectedProfession?.id,
    searchQuery,
    selectedCountyName,
    selectedConstituencyName,
    selectedWardName,
    minRating,
    minExperience,
    currentPage,
  ]);

  // Filter professions based on search (local filtering of professions list)
  const filteredProfessions = useMemo(() => {
    const activeSearch = (searchQuery || urlSearchParam || "").trim();
    if (!activeSearch) return professionsData;
    return professionsData.filter((profession) => {
      const name = profession.name ?? "";
      const desc = profession.description ?? "";
      return (
        name.toLowerCase().includes(activeSearch.toLowerCase()) ||
        desc.toLowerCase().includes(activeSearch.toLowerCase())
      );
    });
  }, [professionsData, searchQuery, urlSearchParam]);

  // Pagination for professions grid
  const totalPages = Math.max(1, Math.ceil(filteredProfessions.length / ITEMS_PER_PAGE));
  const paginatedProfessions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredProfessions.slice(startIndex, endIndex);
  }, [filteredProfessions, currentPage]);

  // Handler to select profession
  const handleSelectProfession = (profession: Profession) => {
    setSelectedProfession(profession);
    setSearchQuery("");
    setCurrentPage(1);
    // Reset filters other than what you want to persist:
    setSelectedCounty("");
    setSelectedCountyName("");
    setSelectedConstituency("");
    setSelectedConstituencyName("");
    setSelectedWard("");
    setSelectedWardName("");
    setMinRating(0);
    setMinExperience(0);
  };

  // Small helper to render avatar fallback
  const renderAvatarContent = (f: Freelancer) => {
    if (f.avatar) return f.avatar;
    if (f.avatar_initials) return f.avatar_initials;
    // fallback: initials from name
    const parts = (f.name || "").split(" ");
    if (parts.length >= 2) return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
    return (f.name || "").slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-800">
          <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedProfession ? `${selectedProfession.name} Professionals` : "Find Talented Freelancers"}
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
                  setCurrentPage(1);
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
                    placeholder="Search professions or freelancers..."
                    className="pl-10 h-14 text-base bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                {/* All Filters - Show when profession is selected */}
                {selectedProfession && (
                  <div className="border-t pt-6 space-y-6">
                    {/* Filter Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
                        {hasActiveFilters && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
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
                      <Select value={String(minRating)} onValueChange={(val) => { setMinRating(parseFloat(val)); setCurrentPage(1); }}>
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
                      <Select value={String(minExperience)} onValueChange={(val) => { setMinExperience(parseInt(val)); setCurrentPage(1); }}>
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
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCounty && selectedCounty !== "all" && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    <MapPin className="h-3 w-3 mr-1" />
                    {selectedCountyName || selectedCounty}
                  </Badge>
                )}
                {selectedConstituencyName && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {selectedConstituencyName}
                  </Badge>
                )}
                {selectedWardName && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    {selectedWardName}
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300">
                    <Star className="h-3 w-3 mr-1" />
                    {minRating}+ Rating
                  </Badge>
                )}
                {minExperience > 0 && (
                  <Badge variant="secondary" className="px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
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
                  <span className="font-semibold text-gray-900 dark:text-white">{filteredProfessions.length}</span> professions available
                </p>
              </div>

              {filteredProfessions.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-gray-800">
                  <div className="text-gray-600 dark:text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No professions found</h3>
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
                          onClick={() => handleSelectProfession(profession)}
                        >
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={profession.imageUrl ?? ""}
                              alt={profession.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="font-bold text-xl mb-1 text-white">{profession.name}</h3>
                              <p className="text-sm text-gray-200">{profession.count ?? 0} available</p>
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">{profession.description}</p>
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
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>

                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                              return (
                                <PaginationItem key={page}>
                                  <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                                    {page}
                                  </PaginationLink>
                                </PaginationItem>
                              );
                            } else if (page === currentPage - 2 || page === currentPage + 2) {
                              return <PaginationEllipsis key={page} />;
                            }
                            return null;
                          })}

                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
                  <span className="font-semibold text-gray-900 dark:text-white">{totalFreelancerCount}</span> {selectedProfession.name.toLowerCase()}s found
                </p>
              </div>

              {isLoadingFreelancers ? (
                <Card className="p-12 text-center bg-white dark:bg-gray-800">
                  <div className="text-gray-600 dark:text-gray-400">Loading freelancers…</div>
                </Card>
              ) : freelancersData.length === 0 ? (
                <Card className="p-12 text-center bg-white dark:bg-gray-800">
                  <div className="text-gray-600 dark:text-gray-400">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">No freelancers found</h3>
                    <p>Try adjusting your location filters</p>
                  </div>
                </Card>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {freelancersData.map((freelancer, idx) => (
                    <motion.div key={freelancer.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.03 }}>
                      <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 border-gray-200 dark:border-gray-800">
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-amber-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <CardContent className="pt-6 relative z-10">
                          {/* Avatar & Name */}
                          <div className="flex flex-col items-center text-center mb-4">
                            <div className="relative mb-4">
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 via-amber-500 to-teal-500 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                {renderAvatarContent(freelancer)}
                              </div>
                              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full border-4 border-white dark:border-gray-900 flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                            <Link to={`/freelancer/${freelancer.id}`}>
                              <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors cursor-pointer">
                                {freelancer.name}
                              </h3>
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{freelancer.profession_name ?? selectedProfession.name}</p>
                          </div>

                          {/* Location */}
                          <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg py-2 px-3 mb-4">
                            <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                            {freelancer.ward ? `${freelancer.ward}, ` : ""}
                            {freelancer.constituency ? `${freelancer.constituency}, ` : ""}
                            {freelancer.county ?? ""}
                          </div>

                          {/* Rating */}
                          <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg py-2 px-3 mb-4 border border-amber-200 dark:border-amber-800">
                            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                            <span className="font-bold text-gray-900 dark:text-white">{freelancer.rating ?? "—"}</span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">({freelancer.review_count ?? 0} reviews)</span>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/20 dark:to-emerald-950/20 rounded-lg p-3 border border-teal-200 dark:border-teal-800">
                              <div className="flex items-center gap-2 mb-1">
                                <Award className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Experience</span>
                              </div>
                              <div className="text-lg font-bold text-teal-600 dark:text-teal-400">{freelancer.years_experience ?? freelancer.yearsExperience ?? "—"} yrs</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                                <span className="text-xs text-gray-600 dark:text-gray-400">Jobs</span>
                              </div>
                              <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{freelancer.completed_jobs ?? freelancer.completedJobs ?? 0}</div>
                            </div>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1.5 justify-center mb-4 min-h-[60px]">
                            {(freelancer.skills ?? []).slice(0, 6).map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30 transition-colors"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>

                          {/* Actions */}
                          <Button
                            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                            asChild
                          >
                            <Link to={`/freelancer/${freelancer.id}`}>
                              View Profile
                              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
              {/* Pagination for freelancers (use server count to compute pages) */}
              {totalFreelancerCount > ITEMS_PER_PAGE && (
                <div className="mt-8">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>

                      {Array.from({ length: Math.ceil(totalFreelancerCount / ITEMS_PER_PAGE) }, (_, i) => i + 1).map((page) => {
                        const totalPagesCount = Math.ceil(totalFreelancerCount / ITEMS_PER_PAGE);
                        if (page === 1 || page === totalPagesCount || (page >= currentPage - 1 && page <= currentPage + 1)) {
                          return (
                            <PaginationItem key={page}>
                              <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page} className="cursor-pointer">
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                          return <PaginationEllipsis key={page} />;
                        }
                        return null;
                      })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((prev) => Math.min(Math.ceil(totalFreelancerCount / ITEMS_PER_PAGE), prev + 1))}
                          className={currentPage === Math.ceil(totalFreelancerCount / ITEMS_PER_PAGE) ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
