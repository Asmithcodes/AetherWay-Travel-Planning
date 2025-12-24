
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Calendar, Clock, Users, Navigation,
  Sparkles, RefreshCcw, Loader2, Coins, LogOut, User
} from 'lucide-react';
import { TripInput, RouteOption, TripScope, CURRENCY_SYMBOLS } from './types';
// Toggle between mock and real API by changing this import
// For testing without API: import from './services/geminiService.mock'
// For production: import from './services/geminiService'
import { generateRoutes } from './services/geminiService.mock';
import { saveRoute } from './services/databaseService';
import KineticBackground from './components/Background/KineticBackground';
import RouteCard from './components/UI/RouteCard';
import Footer from './components/Layout/Footer';
import AuthModal from './components/UI/AuthModal';
import FavoritesPage from './components/Pages/FavoritesPage';
import HistoryPage from './components/Pages/HistoryPage';
import ResetPasswordPage from './components/Pages/ResetPasswordPage';
import { useAuthStore } from './store/useAuthStore';
import { saveSearchHistory } from './services/databaseService';
import PriceComparisonChart from './components/Charts/PriceComparisonChart';
import DurationComparisonChart from './components/Charts/DurationComparisonChart';
import GooeyNav from './components/Navigation/GooeyNav';

// Check if we're on password reset page BEFORE rendering App
const AppWrapper: React.FC = () => {
  const isResetPassword = window.location.hash.includes('type=recovery');

  if (isResetPassword) {
    return <ResetPasswordPage />;
  }

  return <App />;
};

const App: React.FC = () => {
  const { user, signOut, initialize, isLoading: authLoading } = useAuthStore();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [input, setInput] = useState<TripInput>({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0],
    time: '08:00',
    travelers: 1,
    scope: TripScope.LOCAL,
    currency: 'INR'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [sortBy, setSortBy] = useState<'fastest' | 'cheapest' | 'value'>('value');
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [savedRouteIds, setSavedRouteIds] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explore' | 'favorites' | 'history'>('explore');
  const [viewMode, setViewMode] = useState<'cards' | 'charts'>('cards');

  const destinationInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.origin || !input.destination) return;

    setIsLoading(true);
    setExpandedRouteId(null);
    try {
      const data = await generateRoutes(input);
      setRoutes(data);
      setHasSearched(true);

      // Save search to history if user is logged in
      if (user) {
        await saveSearchHistory(user.id, input);
      }
    } catch (error) {
      alert("An error occurred during routing analysis. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [input, user]);

  const handleSelectHistory = useCallback((searchParams: TripInput) => {
    setInput(searchParams);
    setActiveTab('explore');
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const sortedRoutes = [...routes].sort((a, b) => {
    if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
    if (sortBy === 'cheapest') return a.totalCost - b.totalCost;
    return (a.totalCost * a.durationMinutes) - (b.totalCost * b.durationMinutes);
  });

  const toggleRoute = (id: string) => {
    setExpandedRouteId(prev => prev === id ? null : id);
  };

  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      destinationInputRef.current?.focus();
    }
  };

  const handleSaveRoute = async (route: RouteOption) => {
    if (!user) {
      setToastMessage('Please sign in to save routes');
      setTimeout(() => setToastMessage(null), 3000);
      setIsAuthOpen(true);
      return;
    }

    const result = await saveRoute(
      user.id,
      route,
      input.origin,
      input.destination
    );

    if (result) {
      setSavedRouteIds(prev => new Set(prev).add(route.id));
      setToastMessage('✓ Route saved to favorites!');
      setTimeout(() => setToastMessage(null), 3000);
    } else {
      setToastMessage('Failed to save route. Please try again.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col selection:bg-orange-500/30">
      <KineticBackground />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />

      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/20 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-red-400 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-xl shadow-orange-500/20 transition-transform group-hover:scale-110">A</div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">AetherWays</span>
          </div>
          <div className="hidden md:block">
            <GooeyNav
              items={[
                { label: "Explore", href: "#" },
                { label: "Favorites", href: "#" },
                { label: "History", href: "#" }
              ]}
              initialActiveIndex={activeTab === 'explore' ? 0 : activeTab === 'favorites' ? 1 : 2}
              particleCount={15}
              particleDistances={[90, 10]}
              particleR={100}
              animationTime={600}
              timeVariance={300}
              colors={[1, 2, 3, 1, 2, 3, 1, 4]}
              onItemClick={(index) => {
                const tabs: ('explore' | 'favorites' | 'history')[] = ['explore', 'favorites', 'history'];
                setActiveTab(tabs[index]);
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            {!user ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-500 border border-orange-400/20 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20 active:scale-95"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-4 bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 px-3 py-1.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-400 rounded-lg flex items-center justify-center text-white">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-200 hidden sm:block">
                    {user.email.split('@')[0]}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-20 px-6 max-w-7xl mx-auto w-full relative z-10">
        {activeTab === 'favorites' ? (
          <FavoritesPage />
        ) : activeTab === 'history' ? (
          <HistoryPage onSelectHistory={handleSelectHistory} />
        ) : (
          <div className="grid lg:grid-cols-12 gap-12">

            <section className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-orange-500/10"
                >
                  <Sparkles className="w-3 h-3 text-orange-400" /> Intelligent Routing
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
                  Where to <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 animate-gradient">Next?</span>
                </h1>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                  AetherWays uses advanced kinetic analysis to find your perfect path across air, land, and rail.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-2xl shadow-2xl">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Origin</label>
                      <div className="relative group">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          type="text"
                          value={input.origin}
                          onChange={(e) => setInput({ ...input, origin: e.target.value })}
                          onKeyDown={handleOriginKeyDown}
                          placeholder="e.g. Hyderabad"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-600 font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Destination</label>
                      <div className="relative group">
                        <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                        <input
                          ref={destinationInputRef}
                          type="text"
                          value={input.destination}
                          onChange={(e) => setInput({ ...input, destination: e.target.value })}
                          placeholder="e.g. Mumbai"
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all placeholder:text-slate-600 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Date</label>
                      <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors pointer-events-none" />
                        <input
                          type="date"
                          value={input.date}
                          onChange={(e) => setInput({ ...input, date: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium cursor-pointer [color-scheme:dark]"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Time</label>
                      <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors pointer-events-none" />
                        <input
                          type="time"
                          value={input.time}
                          onChange={(e) => setInput({ ...input, time: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium cursor-pointer [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Travelers</label>
                      <div className="relative group">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors" />
                        <select
                          value={input.travelers}
                          onChange={(e) => setInput({ ...input, travelers: parseInt(e.target.value) })}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium appearance-none"
                        >
                          {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Traveler{n > 1 ? 's' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Currency</label>
                      <div className="relative group">
                        <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors" />
                        <select
                          value={input.currency}
                          onChange={(e) => setInput({ ...input, currency: e.target.value })}
                          className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-orange-500 transition-all font-medium appearance-none"
                        >
                          {Object.keys(CURRENCY_SYMBOLS).map(curr => (
                            <option key={curr} value={curr}>{curr} ({CURRENCY_SYMBOLS[curr]})</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Trip Scope</label>
                    <div className="flex bg-slate-950/50 border border-slate-800 p-1 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setInput({ ...input, scope: TripScope.LOCAL })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${input.scope === TripScope.LOCAL ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Local Journey
                      </button>
                      <button
                        type="button"
                        onClick={() => setInput({ ...input, scope: TripScope.LONG_DISTANCE })}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${input.scope === TripScope.LONG_DISTANCE ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        Long Distance
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  disabled={isLoading}
                  className="w-full py-5 bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-500 hover:to-red-400 text-white font-black text-lg rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Current Market Rates...
                    </>
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      Calculate Verified Routes
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="lg:col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                {!hasSearched && !isLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-slate-800 rounded-[3rem] space-y-6"
                  >
                    <div className="p-8 bg-slate-900/50 rounded-full border border-slate-800">
                      <Navigation className="w-16 h-16 text-slate-600 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-400">Ready for Launch?</h3>
                      <p className="text-slate-500 max-w-sm">Enter your starting point and destination. We'll cross-reference live pricing data for you.</p>
                    </div>
                  </motion.div>
                ) : isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-end mb-8">
                      <div className="space-y-2">
                        <div className="h-8 w-48 bg-slate-800 animate-pulse rounded-lg" />
                        <div className="h-4 w-64 bg-slate-800 animate-pulse rounded-lg" />
                      </div>
                    </div>
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-40 bg-slate-900/50 border border-slate-800 rounded-3xl animate-pulse" />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                      <div>
                        <h2 className="text-3xl font-black text-white flex items-center gap-3">
                          Optimal Routes <span className="text-slate-600">({routes.length})</span>
                        </h2>
                        <p className="text-slate-400 font-medium">Verified Comparison for {input.origin} to {input.destination}</p>
                      </div>
                      <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                        <button
                          onClick={() => setSortBy('value')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${sortBy === 'value'
                            ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                          <Sparkles className="w-3 h-3" /> Best Value
                        </button>
                        <button
                          onClick={() => setSortBy('fastest')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${sortBy === 'fastest'
                            ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-600/30'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                          <Clock className="w-3 h-3" /> Fastest
                        </button>
                        <button
                          onClick={() => setSortBy('cheapest')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${sortBy === 'cheapest'
                            ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-600/30'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                          <Coins className="w-3 h-3" /> Cheapest
                        </button>
                      </div>
                    </div>

                    {/* View Toggle */}
                    {routes.length > 0 && (
                      <div className="flex justify-center mb-6">
                        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
                          <button
                            onClick={() => setViewMode('cards')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'cards'
                              ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/30'
                              : 'text-slate-400 hover:text-white'
                              }`}
                          >
                            Card View
                          </button>
                          <button
                            onClick={() => setViewMode('charts')}
                            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${viewMode === 'charts'
                              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg shadow-orange-600/30'
                              : 'text-slate-400 hover:text-white'
                              }`}
                          >
                            Chart View
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Cards View */}
                    {viewMode === 'cards' && (
                      <div className="space-y-4">
                        {sortedRoutes.map((route, idx) => (
                          <RouteCard
                            key={route.id}
                            route={route}
                            index={idx}
                            isExpanded={expandedRouteId === route.id}
                            onToggle={() => toggleRoute(route.id)}
                            origin={input.origin}
                            destination={input.destination}
                            onSave={handleSaveRoute}
                            isSaved={savedRouteIds.has(route.id)}
                          />
                        ))}
                      </div>
                    )}

                    {/* Charts View */}
                    {viewMode === 'charts' && (
                      <div className="space-y-6">
                        <PriceComparisonChart routes={sortedRoutes} />
                        <DurationComparisonChart routes={sortedRoutes} />
                      </div>
                    )}

                    <div className="p-6 bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-slate-700/20 rounded-3xl mt-8">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400">
                          <RefreshCcw className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white mb-1">Environmental Impact</h4>
                          <p className="text-slate-400 text-sm leading-relaxed">
                            Prices are sourced via Google Search to provide current market accuracy. Actual booking totals may vary slightly at checkout.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>
        )}
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl backdrop-blur-xl"
          >
            <p className="text-white font-bold">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div >
  );
};

export default AppWrapper;
