import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Play,
  Search,
  Bookmark,
  BookmarkCheck,
  Star,
  Info,
  Clock,
  Share2,
  ThumbsUp,
  Film,
  X,
} from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import VideoPlayer from "../components/VideoPlayer.jsx";
import { MOVIES_DATA, GENRES_LIST, generateDynamicMovie } from "../data/movies.js";
import { useApp } from "../context/AppContext.jsx";

export default function Watch() {
  const { showToast } = useApp();
  const playerRef = useRef(null);

  // Active playing movie
  const [activeMovie, setActiveMovie] = useState(MOVIES_DATA[0]);
  const [isPlayingActive, setIsPlayingActive] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("trending"); // "trending" | "rating" | "year"

  // User Interactive Lists (Persisted in localStorage)
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem("fitpass_watchlist");
      return saved ? JSON.parse(saved) : ["tears-of-steel", "pumping-iron-legacy"];
    } catch {
      return ["tears-of-steel", "pumping-iron-legacy"];
    }
  });

  const [continueWatching, setContinueWatching] = useState(() => {
    try {
      const saved = localStorage.getItem("fitpass_continue_watching");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [likedMovies, setLikedMovies] = useState({});
  const [selectedDetailsMovie, setSelectedDetailsMovie] = useState(null);

  // Sync Watchlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("fitpass_watchlist", JSON.stringify(watchlist));
    } catch (e) {
      console.warn("Could not save watchlist", e);
    }
  }, [watchlist]);

  // Load latest continue watching records
  const refreshContinueWatching = () => {
    try {
      const saved = localStorage.getItem("fitpass_continue_watching");
      if (saved) setContinueWatching(JSON.parse(saved));
    } catch {}
  };

  // Play a specific movie
  const handlePlayMovie = (movie) => {
    setActiveMovie(movie);
    setIsPlayingActive(true);
    if (playerRef.current) {
      playerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  // Toggle Watchlist Bookmark
  const toggleWatchlist = (movieId, movieTitle) => {
    setWatchlist((prev) => {
      const exists = prev.includes(movieId);
      if (exists) {
        showToast(`Removed "${movieTitle}" from your Watchlist.`);
        return prev.filter((id) => id !== movieId);
      } else {
        showToast(`Saved "${movieTitle}" to your Watchlist.`);
        return [...prev, movieId];
      }
    });
  };

  // Toggle Like / Dislike
  const handleLike = (movieId) => {
    setLikedMovies((prev) => {
      const current = prev[movieId];
      const next = current === "liked" ? null : "liked";
      if (next === "liked") showToast("Marked as Liked!");
      return { ...prev, [movieId]: next };
    });
  };

  const handleShare = (movie) => {
    navigator.clipboard?.writeText(window.location.href);
    showToast(`Streaming link for "${movie.title}" copied to clipboard!`);
  };

  // Filtered and Sorted Movies
  const displayedMovies = useMemo(() => {
    let list = [...MOVIES_DATA];

    // Filter by genre or special tabs
    if (selectedGenre === "My Watchlist") {
      list = list.filter((m) => watchlist.includes(m.id));
    } else if (selectedGenre === "Continue Watching") {
      const watchedIds = continueWatching.map((c) => c.movieId);
      list = list.filter((m) => watchedIds.includes(m.id));
    } else if (selectedGenre !== "All") {
      list = list.filter((m) => m.genres?.includes(selectedGenre));
    }

    // Filter by query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matched = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q) ||
          m.director?.toLowerCase().includes(q) ||
          m.cast?.some((c) => c.toLowerCase().includes(q)) ||
          m.genres?.some((g) => g.toLowerCase().includes(q))
      );

      // If user typed a search query that has zero matches in our catalog,
      // generate a dynamic cinema entry so they can watch ANY movie they search for!
      if (matched.length === 0) {
        const dynamicEntry = generateDynamicMovie(searchQuery);
        return [dynamicEntry];
      }
      list = matched;
    }

    // Sort list
    if (sortBy === "rating") {
      list.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "year") {
      list.sort((a, b) => b.year - a.year);
    } else {
      // Trending
      list.sort((a, b) => (b.trending ? 1 : 0) - (a.trending ? 1 : 0));
    }

    return list;
  }, [selectedGenre, searchQuery, sortBy, watchlist, continueWatching]);

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen selection:bg-[#CCFF00] selection:text-black">
      
      {/* 1. CINEMATIC HERO SPOTLIGHT BANNER */}
      {!isPlayingActive && (
        <section
          className="relative min-h-[70vh] flex items-end pb-16 pt-32 px-6 lg:px-12 bg-cover bg-center border-b-2 border-zinc-900 select-none"
          style={{
            backgroundImage: `linear-gradient(to top, #0B0C10 10%, rgba(11, 12, 16, 0.7) 60%, rgba(11, 12, 16, 0.4) 100%), url(${
              MOVIES_DATA[0].backdrop
            })`,
          }}
        >
          <div className="max-w-4xl space-y-5 relative z-10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-[#CCFF00] text-black font-sans font-black text-[10px] uppercase px-3 py-1 border border-black tracking-widest">
                FEATURED SPOTLIGHT
              </span>
              <span className="border border-zinc-700 bg-zinc-900/90 text-zinc-300 font-mono text-[10px] uppercase px-2.5 py-1">
                {MOVIES_DATA[0].quality}
              </span>
              <span className="border border-zinc-700 bg-zinc-900/90 text-zinc-300 font-mono text-[10px] uppercase px-2.5 py-1">
                {MOVIES_DATA[0].ageRating}
              </span>
              <span className="text-emerald-400 font-bold text-xs font-mono">
                98% MATCH
              </span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl uppercase tracking-tighter text-white leading-none">
              {MOVIES_DATA[0].title}
            </h1>

            <p className="text-[#CCFF00] font-display text-sm sm:text-base font-bold uppercase tracking-wide">
              "{MOVIES_DATA[0].tagline}"
            </p>

            <p className="text-zinc-300 text-xs sm:text-sm font-medium uppercase tracking-wider max-w-2xl leading-relaxed line-clamp-3">
              {MOVIES_DATA[0].overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={() => handlePlayMovie(MOVIES_DATA[0])}
                className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-display font-black uppercase text-xs px-8 py-3.5 border-2 border-[#CCFF00] hover:bg-white hover:border-white transition-all shadow-[4px_4px_0px_0px_rgba(204,255,0,0.4)]"
              >
                <Play size={16} fill="currentColor" /> WATCH NOW
              </button>

              <button
                onClick={() => toggleWatchlist(MOVIES_DATA[0].id, MOVIES_DATA[0].title)}
                className="inline-flex items-center gap-2 border-2 border-zinc-700 bg-zinc-900/80 text-white font-display font-black uppercase text-xs px-6 py-3.5 hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
              >
                {watchlist.includes(MOVIES_DATA[0].id) ? (
                  <>
                    <BookmarkCheck size={16} className="text-[#CCFF00]" /> IN WATCHLIST
                  </>
                ) : (
                  <>
                    <Bookmark size={16} /> ADD TO WATCHLIST
                  </>
                )}
              </button>

              <button
                onClick={() => setSelectedDetailsMovie(MOVIES_DATA[0])}
                className="p-3.5 border-2 border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors"
                title="Movie Details"
              >
                <Info size={16} />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 2. ACTIVE THEATER VIDEO PLAYER CONTAINER */}
      <section
        ref={playerRef}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${
          isPlayingActive ? "pt-28 pb-12" : "py-0"
        }`}
      >
        {isPlayingActive && activeMovie && (
          <div className="space-y-6">
            <VideoPlayer
              movie={activeMovie}
              onClose={() => {
                setIsPlayingActive(false);
                refreshContinueWatching();
              }}
              isTheaterMode={isTheaterMode}
              setIsTheaterMode={setIsTheaterMode}
            />

            {/* Movie Info & Social Bar Below Video */}
            <div className="border-2 border-zinc-800 bg-zinc-950 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-md">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-black text-2xl uppercase tracking-tight text-white">
                    {activeMovie.title}
                  </h3>
                  <span className="bg-zinc-900 border border-zinc-800 text-[#CCFF00] font-mono text-[10px] px-2 py-0.5">
                    {activeMovie.year}
                  </span>
                  <span className="border border-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-0.5">
                    {activeMovie.duration}
                  </span>
                  <span className="border border-zinc-800 text-zinc-400 font-mono text-[10px] px-2 py-0.5">
                    {activeMovie.ageRating}
                  </span>
                </div>

                <p className="text-zinc-400 text-xs uppercase leading-relaxed max-w-3xl">
                  {activeMovie.overview}
                </p>

                {activeMovie.cast && (
                  <p className="text-zinc-500 text-[10px] font-mono uppercase">
                    STARRING: {activeMovie.cast.join(" · ")} | DIRECTOR: {activeMovie.director}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleLike(activeMovie.id)}
                  className={`p-2.5 border transition-colors ${
                    likedMovies[activeMovie.id] === "liked"
                      ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                  title="Like"
                >
                  <ThumbsUp size={15} />
                </button>

                <button
                  onClick={() => toggleWatchlist(activeMovie.id, activeMovie.title)}
                  className={`p-2.5 border transition-colors ${
                    watchlist.includes(activeMovie.id)
                      ? "border-[#CCFF00] bg-[#CCFF00] text-black"
                      : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white"
                  }`}
                  title="Watchlist"
                >
                  {watchlist.includes(activeMovie.id) ? (
                    <BookmarkCheck size={15} />
                  ) : (
                    <Bookmark size={15} />
                  )}
                </button>

                <button
                  onClick={() => handleShare(activeMovie)}
                  className="p-2.5 border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                  title="Share"
                >
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 3. DISCOVERY RACK: SEARCH, CATEGORIES, & SORT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="border-b-4 border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="FITPASS THEATER STREAMING"
            title="CINEMA & ATHLETIC MOTIVATION."
            description="SEARCH ANY MOVIE IN THE WORLD. IMMERSIVE HIGH-DEFINITION VIDEO PLAYER EQUIPPED WITH FULL SCRUBBER, SPEED, & THEATER CONTROLS."
          />

          {/* Search Input */}
          <div className="relative w-full md:max-w-md border-2 border-zinc-800 bg-zinc-950 p-1.5 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.1)] focus-within:border-[#CCFF00] transition-colors">
            <Search
              size={15}
              strokeWidth={2.5}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH ANY MOVIE TITLE, CAST, OR GENRE..."
              className="w-full bg-transparent pl-10 pr-4 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* GENRE / SPECIAL TAB PILLS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2 items-center">
            {["All", ...GENRES_LIST.slice(1), "My Watchlist", "Continue Watching"].map((tab) => {
              const isActive = selectedGenre === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedGenre(tab)}
                  className={`px-4 py-2 text-xs font-display font-black uppercase tracking-wider border transition-all duration-100 ${
                    isActive
                      ? "bg-[#CCFF00] text-black border-[#CCFF00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-600 hover:text-white"
                  }`}
                >
                  {tab === "My Watchlist" ? `WATCHLIST (${watchlist.length})` : tab}
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="border border-zinc-800 bg-zinc-950 px-3 py-1.5 flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-black uppercase text-zinc-500">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-black uppercase text-[#CCFF00] focus:outline-none"
            >
              <option value="trending" className="bg-zinc-900 text-white">TRENDING NOW</option>
              <option value="rating" className="bg-zinc-900 text-white">TOP RATED</option>
              <option value="year" className="bg-zinc-900 text-white">RELEASE YEAR</option>
            </select>
          </div>
        </div>
      </section>

      {/* 4. CONTINUE WATCHING ROW (IF APPLICABLE) */}
      {continueWatching.length > 0 && selectedGenre === "All" && !searchQuery && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
            <Clock size={16} className="text-[#CCFF00]" />
            <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">
              CONTINUE WATCHING ({continueWatching.length})
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {continueWatching.map((item) => {
              const matched = MOVIES_DATA.find((m) => m.id === item.movieId) || {
                id: item.movieId,
                title: item.title,
                poster: item.poster,
                videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
                duration: "HD",
                year: 2024,
              };
              return (
                <div
                  key={item.movieId}
                  onClick={() => handlePlayMovie(matched)}
                  className="group relative border border-zinc-800 bg-zinc-950 cursor-pointer overflow-hidden transform hover:-translate-y-1 transition-all"
                >
                  <div className="aspect-[2/3] w-full bg-zinc-900 relative">
                    <img
                      src={item.poster || matched.poster}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center">
                      <div className="h-10 w-10 bg-[#CCFF00] text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-zinc-800">
                    <div
                      className="h-full bg-[#CCFF00]"
                      style={{ width: `${item.percentage || 10}%` }}
                    />
                  </div>

                  <div className="p-2.5">
                    <p className="font-display font-black text-xs uppercase text-white truncate">
                      {item.title}
                    </p>
                    <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                      {item.percentage}% WATCHED
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. MAIN MOVIE CARDS CATALOG GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <h3 className="font-display font-black text-sm uppercase tracking-widest text-zinc-400">
            CATALOG TITLES ({displayedMovies.length})
          </h3>
          {searchQuery && (
            <span className="text-[10px] font-mono text-[#CCFF00] uppercase">
              SEARCH RESULTS FOR: "{searchQuery}"
            </span>
          )}
        </div>

        {displayedMovies.length === 0 ? (
          <div className="border-2 border-zinc-800 bg-zinc-950 p-12 text-center max-w-md mx-auto space-y-3">
            <Film size={28} className="text-zinc-600 mx-auto" />
            <p className="font-display font-black text-base uppercase text-zinc-400">
              NO MOVIES MATCH THIS SELECTION.
            </p>
            <button
              onClick={() => {
                setSelectedGenre("All");
                setSearchQuery("");
              }}
              className="text-xs font-black uppercase text-[#CCFF00] underline"
            >
              CLEAR ACTIVE FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedMovies.map((movie) => {
              const inWatchlist = watchlist.includes(movie.id);
              return (
                <div
                  key={movie.id}
                  className="border-2 border-zinc-800 bg-zinc-950 flex flex-col justify-between overflow-hidden group hover:border-[#CCFF00]/60 hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,0.4)] transition-all duration-200"
                >
                  {/* Poster Image Stage */}
                  <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full bg-zinc-900 overflow-hidden">
                    <img
                      src={movie.backdrop || movie.poster}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quality & Rating Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="bg-[#CCFF00] text-black font-sans font-black text-[8px] uppercase px-2 py-0.5 border border-black">
                        {movie.quality}
                      </span>
                      {movie.ageRating && (
                        <span className="bg-black/80 text-white font-mono text-[8px] uppercase px-1.5 py-0.5 border border-zinc-700">
                          {movie.ageRating}
                        </span>
                      )}
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWatchlist(movie.id, movie.title);
                        }}
                        className={`p-1.5 border transition-colors ${
                          inWatchlist
                            ? "bg-[#CCFF00] text-black border-black"
                            : "bg-black/70 text-zinc-300 border-zinc-700 hover:text-white"
                        }`}
                        title={inWatchlist ? "In Watchlist" : "Add to Watchlist"}
                      >
                        {inWatchlist ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
                      </button>
                    </div>

                    {/* Center Quick Play Overlay Button */}
                    <div
                      onClick={() => handlePlayMovie(movie)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                    >
                      <div className="h-12 w-12 bg-[#CCFF00] text-black flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Play size={20} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Movie Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display font-black text-base uppercase text-white truncate group-hover:text-[#CCFF00] transition-colors">
                          {movie.title}
                        </h4>
                        <div className="flex items-center gap-1 text-[#CCFF00] text-[10px] font-mono font-bold shrink-0">
                          <Star size={11} fill="currentColor" />
                          <span>{movie.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-500 uppercase mt-1">
                        <span>{movie.year}</span>
                        <span>•</span>
                        <span>{movie.duration}</span>
                        {movie.genres?.[0] && (
                          <>
                            <span>•</span>
                            <span className="text-zinc-400">{movie.genres[0]}</span>
                          </>
                        )}
                      </div>

                      <p className="mt-2 text-[10px] text-zinc-400 uppercase line-clamp-2 leading-relaxed">
                        {movie.overview}
                      </p>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                      <button
                        onClick={() => handlePlayMovie(movie)}
                        className="inline-flex items-center gap-1.5 text-xs font-display font-black uppercase text-[#CCFF00] hover:text-white transition-colors tracking-wider"
                      >
                        <Play size={12} fill="currentColor" /> STREAM MOVIE →
                      </button>

                      <button
                        onClick={() => setSelectedDetailsMovie(movie)}
                        className="text-zinc-500 hover:text-white p-1"
                        title="Overview details"
                      >
                        <Info size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. MOVIE DETAILS OVERVIEW MODAL */}
      {selectedDetailsMovie && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-zinc-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_0px_rgba(204,255,0,1)]">
            <div className="relative aspect-video w-full bg-zinc-900">
              <img
                src={selectedDetailsMovie.backdrop || selectedDetailsMovie.poster}
                alt={selectedDetailsMovie.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedDetailsMovie(null)}
                className="absolute top-4 right-4 p-2 bg-black/80 border border-zinc-700 text-white hover:bg-[#CCFF00] hover:text-black hover:border-black transition-colors"
              >
                <X size={16} />
              </button>

              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div>
                  <span className="bg-[#CCFF00] text-black font-sans font-black text-[9px] uppercase px-2.5 py-1 border border-black">
                    {selectedDetailsMovie.quality}
                  </span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl uppercase text-white mt-2 leading-none">
                    {selectedDetailsMovie.title}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    handlePlayMovie(selectedDetailsMovie);
                    setSelectedDetailsMovie(null);
                  }}
                  className="bg-[#CCFF00] text-black font-display font-black text-xs uppercase px-6 py-3 border border-black hover:bg-white flex items-center gap-2"
                >
                  <Play size={14} fill="currentColor" /> PLAY NOW
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 uppercase">
                <span className="text-[#CCFF00] font-bold">★ {selectedDetailsMovie.rating}/10</span>
                <span>•</span>
                <span>{selectedDetailsMovie.year}</span>
                <span>•</span>
                <span>{selectedDetailsMovie.duration}</span>
                <span>•</span>
                <span>{selectedDetailsMovie.ageRating}</span>
              </div>

              {selectedDetailsMovie.tagline && (
                <p className="font-display font-black text-sm uppercase text-[#CCFF00]">
                  "{selectedDetailsMovie.tagline}"
                </p>
              )}

              <p className="text-zinc-300 text-xs uppercase leading-relaxed">
                {selectedDetailsMovie.overview}
              </p>

              {selectedDetailsMovie.cast && (
                <div className="pt-2 border-t border-zinc-900 text-xs font-mono space-y-1">
                  <p className="text-zinc-500 uppercase">
                    DIRECTOR: <span className="text-white">{selectedDetailsMovie.director}</span>
                  </p>
                  <p className="text-zinc-500 uppercase">
                    CAST: <span className="text-white">{selectedDetailsMovie.cast.join(", ")}</span>
                  </p>
                  <p className="text-zinc-500 uppercase">
                    GENRES: <span className="text-white">{selectedDetailsMovie.genres?.join(", ")}</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
