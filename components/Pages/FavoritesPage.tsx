
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Trash2, Calendar, MapPin, Navigation, Loader2 } from 'lucide-react';
import { SavedRoute, TransportType, CURRENCY_SYMBOLS } from '../../types';
import { getSavedRoutes, deleteRoute } from '../../services/databaseService';
import { useAuthStore } from '../../store/useAuthStore';
import RouteCard from '../UI/RouteCard';

const FavoritesPage: React.FC = () => {
    const { user } = useAuthStore();
    const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

    useEffect(() => {
        loadSavedRoutes();
    }, [user]);

    const loadSavedRoutes = async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const routes = await getSavedRoutes(user.id);
        setSavedRoutes(routes);
        setIsLoading(false);
    };

    const handleDelete = async (routeId: string) => {
        const success = await deleteRoute(routeId);
        if (success) {
            setSavedRoutes(prev => prev.filter(r => r.id !== routeId));
        }
    };

    const toggleRoute = (id: string) => {
        setExpandedRouteId(prev => prev === id ? null : id);
    };

    // Convert SavedRoute to RouteOption format for RouteCard
    const convertToRouteOption = (savedRoute: SavedRoute) => ({
        id: savedRoute.id,
        type: savedRoute.transport_type,
        durationMinutes: savedRoute.duration_minutes,
        totalCost: savedRoute.total_cost,
        currency: savedRoute.currency,
        costBreakdown: savedRoute.cost_breakdown,
        bookingUrl: savedRoute.booking_url
    });

    if (!user) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12">
                <div className="p-8 bg-slate-900/50 rounded-full border border-slate-800 mb-6">
                    <Heart className="w-16 h-16 text-slate-600" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">Sign In to View Favorites</h2>
                <p className="text-slate-400 max-w-md">
                    Create an account to save your favorite routes and access them anytime.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
                    <p className="text-slate-400 font-medium">Loading your favorites...</p>
                </div>
            </div>
        );
    }

    if (savedRoutes.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-12">
                <div className="p-8 bg-slate-900/50 rounded-full border border-slate-800 mb-6">
                    <Heart className="w-16 h-16 text-slate-600" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">No Favorites Yet</h2>
                <p className="text-slate-400 max-w-md mb-6">
                    Start exploring routes and save your favorites by clicking the heart icon on any route card.
                </p>
                <button
                    onClick={() => window.location.href = '/'}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-all"
                >
                    Explore Routes
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2">My Favorites</h1>
                    <p className="text-slate-400 font-medium">
                        {savedRoutes.length} saved {savedRoutes.length === 1 ? 'route' : 'routes'}
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {savedRoutes.map((savedRoute, idx) => (
                        <motion.div
                            key={savedRoute.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative"
                        >
                            {/* Route Info Header */}
                            <div className="mb-2 flex items-center justify-between px-2">
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-medium">{savedRoute.origin}</span>
                                    </div>
                                    <Navigation className="w-3 h-3" />
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-4 h-4" />
                                        <span className="font-medium">{savedRoute.destination}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500">
                                        Saved {new Date(savedRoute.created_at).toLocaleDateString()}
                                    </span>
                                    <button
                                        onClick={() => handleDelete(savedRoute.id)}
                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Remove from favorites"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Route Card */}
                            <RouteCard
                                route={convertToRouteOption(savedRoute)}
                                index={idx}
                                isExpanded={expandedRouteId === savedRoute.id}
                                onToggle={() => toggleRoute(savedRoute.id)}
                                origin={savedRoute.origin}
                                destination={savedRoute.destination}
                                isSaved={true}
                            />

                            {/* Notes Section */}
                            {savedRoute.notes && (
                                <div className="mt-2 p-4 bg-slate-900/40 border border-slate-800 rounded-2xl">
                                    <p className="text-sm text-slate-300 italic">"{savedRoute.notes}"</p>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default FavoritesPage;
