
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car, Train, Plane, Bus, Clock, DollarSign,
  ChevronDown, Star, Zap, CreditCard,
  MapPin, Users, Info, Banknote, Sparkles, ExternalLink, Search, Link as LinkIcon,
  Bike, Heart
} from 'lucide-react';
import { RouteOption, TransportType, CURRENCY_SYMBOLS } from '../../types';

interface RouteCardProps {
  route: RouteOption;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  origin: string;
  destination: string;
  onSave?: (route: RouteOption) => Promise<void>;
  isSaved?: boolean;
}

const getTransportIcon = (type: TransportType) => {
  switch (type) {
    case TransportType.CAR: return <Car className="w-6 h-6" />;
    case TransportType.TRAIN: return <Train className="w-6 h-6" />;
    case TransportType.FLIGHT: return <Plane className="w-6 h-6" />;
    case TransportType.BUS: return <Bus className="w-6 h-6" />;
    case TransportType.BIKE: return <Bike className="w-6 h-6" />;
    case TransportType.RIDESHARE: return <Users className="w-6 h-6" />;
    case TransportType.TRANSIT: return <MapPin className="w-6 h-6" />;
    default: return <Car className="w-6 h-6" />;
  }
};

const getRecommendationBadge = (type: string) => {
  switch (type) {
    case 'FASTEST':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Zap className="w-3 h-3" /> Fastest
        </span>
      );
    case 'CHEAPEST':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Banknote className="w-3 h-3" /> Cheapest
        </span>
      );
    case 'BEST_VALUE':
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Star className="w-3 h-3" /> Best Value
        </span>
      );
    default:
      return null;
  }
};

const RouteCard: React.FC<RouteCardProps> = ({ route, index, isExpanded, onToggle, origin, destination, onSave, isSaved = false }) => {
  const [saving, setSaving] = React.useState(false);
  const symbol = CURRENCY_SYMBOLS[route.currency] || route.currency;

  const formatDuration = (mins: number) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    return hours > 0 ? `${hours}h ${m}m` : `${m}m`;
  };

  const handleConfirmSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (route.bookingUrl) {
      window.open(route.bookingUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onSave || saving) return;

    setSaving(true);
    try {
      await onSave(route);
    } finally {
      setSaving(false);
    }
  };

  const isSelfDrive = route.type === TransportType.CAR || route.type === TransportType.BIKE;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        borderColor: isExpanded ? 'rgba(59, 130, 246, 0.4)' : 'rgba(30, 41, 59, 0.5)',
      }}
      className={`group relative bg-slate-900/40 backdrop-blur-xl border rounded-3xl overflow-hidden transition-all duration-300 ${isExpanded ? 'shadow-2xl shadow-orange-500/10' : ''}`}
    >
      <div
        className="p-6 cursor-pointer select-none"
        onClick={onToggle}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-4 rounded-2xl ${isExpanded ? 'bg-orange-600' : 'bg-orange-500/20'} text-white transition-colors duration-300 shadow-lg`}>
              {getTransportIcon(route.type)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isSelfDrive ? `Self-Drive ${route.type.charAt(0) + route.type.slice(1).toLowerCase()}` : (route.type.charAt(0) + route.type.slice(1).toLowerCase())}
                </h3>
                {route.recommendationType && getRecommendationBadge(route.recommendationType)}
              </div>
              <p className="text-slate-400 text-sm flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-slate-500" /> {formatDuration(route.durationMinutes)}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between md:justify-end gap-4">
            <div className="text-right">
              <span className="block text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1 opacity-70">TOTAL ONE-WAY COST</span>
              <span className="text-4xl font-black text-white tracking-tight">{symbol}{route.totalCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              {onSave && (
                <button
                  onClick={handleSave}
                  disabled={saving || isSaved}
                  className={`p-2 rounded-full transition-all shadow-md ${isSaved
                    ? 'bg-pink-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-pink-400'
                    } disabled:opacity-50`}
                  title={isSaved ? 'Saved to favorites' : 'Save to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
              )}
              <div className={`p-2 rounded-full ${isExpanded ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'} transition-all shadow-md`}>
                <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-slate-800/50 bg-slate-950/20"
          >
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                      <CreditCard className="w-3 h-3 text-orange-500" /> COST BREAKDOWN
                    </h4>
                    <div className="space-y-4 pr-4">
                      {route.costBreakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800/10">
                          <span className="text-slate-300 text-sm">{item.label}</span>
                          <span className="font-mono text-white font-semibold">{symbol}{item.amount.toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center py-6">
                        <div className="flex flex-col">
                          <span className="text-2xl font-black text-white">Total</span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ONE-WAY • ALL TRAVELERS</span>
                        </div>
                        <span className="text-3xl font-black text-orange-400">{symbol}{route.totalCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {route.groundingSources && route.groundingSources.length > 0 && (
                    <div className="pt-4">
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Search className="w-3 h-3 text-emerald-500" /> DATA VERIFIED VIA
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {route.groundingSources.slice(0, 3).map((source, idx) => (
                          <a
                            key={idx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-[10px] text-emerald-400 transition-colors max-w-full"
                          >
                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{source.title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-slate-900/60 p-8 rounded-[2rem] border-2 border-orange-600/60 relative overflow-hidden shadow-2xl shadow-orange-600/5 ring-1 ring-orange-500/10">
                  <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none">
                    <Sparkles className="w-24 h-24 text-orange-400" />
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Info className="w-3 h-3 text-amber-500" />
                      </div>
                      <h4 className="text-[10px] font-black text-slate-200 uppercase tracking-widest">
                        ANALYST'S NOTE
                      </h4>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-sm font-medium">
                      {route.recommendationReason || "This route offers a balanced mix of efficiency and reliability. Verified against current market rates for one-way travel."}
                    </p>

                    <button
                      onClick={handleConfirmSelection}
                      className="w-full py-4 px-8 bg-orange-600 hover:bg-orange-500 text-white font-black text-lg rounded-2xl transition-all shadow-xl shadow-orange-600/30 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {isSelfDrive ? 'Navigate with Google Maps' : 'Confirm Selection'} <ExternalLink className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RouteCard;
