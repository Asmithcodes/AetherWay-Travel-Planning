import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Users, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { SearchHistory, TripInput } from '../../types';
import { getSearchHistory, deleteSearchHistory } from '../../services/databaseService';
import { useAuthStore } from '../../store/useAuthStore';

interface HistoryPageProps {
    onSelectHistory: (searchParams: TripInput) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ onSelectHistory }) => {
    const { user } = useAuthStore();
    const [history, setHistory] = useState<SearchHistory[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user) {
            loadHistory();
        } else {
            setHistory([]);
            setIsLoading(false);
        }
    }, [user]);

    const loadHistory = async () => {
        if (!user) return;
        setIsLoading(true);
        const data = await getSearchHistory(user.id);
        setHistory(data);
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        const success = await deleteSearchHistory(id);
        if (success) {
            setHistory(prev => prev.filter(item => item.id !== id));
        }
    };

    const handleClick = (item: SearchHistory) => {
        const searchParams: TripInput = {
            origin: item.origin,
            destination: item.destination,
            date: item.date,
            time: item.time,
            travelers: item.travelers,
            scope: item.scope,
            currency: item.currency
        };
        onSelectHistory(searchParams);
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">Sign In to View History</h3>
                <p className="text-slate-400 text-sm text-center max-w-md">
                    Your search history is saved to your account. Sign in to access your previous searches.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-6">
                <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-black text-white mb-2">No Search History Yet</h3>
                <p className="text-slate-400 text-sm text-center max-w-md">
                    Your search history will appear here. Start exploring routes to build your history!
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Search History</h2>
                <p className="text-slate-400">Click any search to quickly re-search with the same parameters</p>
            </div>

            <div className="space-y-4">
                {history.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group relative bg-slate-900/40 border border-white/10 rounded-3xl p-6 hover:border-orange-500/50 transition-all cursor-pointer backdrop-blur-xl"
                        onClick={() => handleClick(item)}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                                {/* Route */}
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0" />
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white font-bold">{item.origin}</span>
                                        <ArrowRight className="w-4 h-4 text-slate-500" />
                                        <span className="text-white font-bold">{item.destination}</span>
                                    </div>
                                </div>

                                {/* Date & Time */}
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">
                                            {new Date(item.date).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">{item.time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        <span className="text-slate-300">{item.travelers} {item.travelers === 1 ? 'traveler' : 'travelers'}</span>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span className="px-2 py-1 bg-slate-800/50 rounded-lg capitalize">{item.scope}</span>
                                    <span className="px-2 py-1 bg-slate-800/50 rounded-lg">{item.currency}</span>
                                    <span>
                                        Searched {new Date(item.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item.id);
                                }}
                                className="p-2 hover:bg-red-500/10 rounded-xl transition-colors group/delete"
                                aria-label="Delete history item"
                            >
                                <Trash2 className="w-5 h-5 text-slate-500 group-hover/delete:text-red-400 transition-colors" />
                            </button>
                        </div>

                        {/* Hover indicator */}
                        <div className="absolute inset-0 rounded-3xl bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default HistoryPage;
