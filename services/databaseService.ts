

import { supabase } from './supabaseClient';
import { UserProfile, SavedRoute, RouteOption, SearchHistory, TripInput } from '../types';

/**
 * Database Service
 * Handles all interactions with Supabase database
 */

// =====================================================
// USER PROFILE OPERATIONS
// =====================================================

/**
 * Get user profile by user ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }

    return data;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
): Promise<boolean> {
    const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating user profile:', error);
        return false;
    }

    return true;
}

// =====================================================
// SAVED ROUTES OPERATIONS
// =====================================================

/**
 * Get all saved routes for a user
 */
export async function getSavedRoutes(userId: string): Promise<SavedRoute[]> {
    const { data, error } = await supabase
        .from('saved_routes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching saved routes:', error);
        return [];
    }

    return data || [];
}

/**
 * Save a route to favorites
 */
export async function saveRoute(
    userId: string,
    route: RouteOption,
    origin: string,
    destination: string,
    notes?: string
): Promise<SavedRoute | null> {
    const { data, error } = await supabase
        .from('saved_routes')
        .insert({
            user_id: userId,
            origin,
            destination,
            transport_type: route.type,
            duration_minutes: route.durationMinutes,
            total_cost: route.totalCost,
            currency: route.currency,
            cost_breakdown: route.costBreakdown,
            booking_url: route.bookingUrl,
            notes
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving route:', error);
        return null;
    }

    return data;
}

/**
 * Delete a saved route
 */
export async function deleteRoute(routeId: string): Promise<boolean> {
    const { error } = await supabase
        .from('saved_routes')
        .delete()
        .eq('id', routeId);

    if (error) {
        console.error('Error deleting route:', error);
        return false;
    }

    return true;
}

/**
 * Check if a route is already saved
 */
export async function isRouteSaved(
    userId: string,
    origin: string,
    destination: string,
    transportType: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from('saved_routes')
        .select('id')
        .eq('user_id', userId)
        .eq('origin', origin)
        .eq('destination', destination)
        .eq('transport_type', transportType)
        .limit(1);

    if (error) {
        console.error('Error checking if route is saved:', error);
        return false;
    }

    return (data?.length || 0) > 0;
}

/**
 * Update notes for a saved route
 */
export async function updateRouteNotes(
    routeId: string,
    notes: string
): Promise<boolean> {
    const { error } = await supabase
        .from('saved_routes')
        .update({ notes })
        .eq('id', routeId);

    if (error) {
        console.error('Error updating route notes:', error);
        return false;
    }

    return true;
}

// =====================================================
// SEARCH HISTORY OPERATIONS
// =====================================================

/**
 * Save a search to history
 */
export async function saveSearchHistory(
    userId: string,
    searchParams: TripInput
): Promise<SearchHistory | null> {
    const { data, error } = await supabase
        .from('search_history')
        .insert({
            user_id: userId,
            origin: searchParams.origin,
            destination: searchParams.destination,
            date: searchParams.date,
            time: searchParams.time,
            travelers: searchParams.travelers,
            scope: searchParams.scope,
            currency: searchParams.currency
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving search history:', error);
        return null;
    }

    return data;
}

/**
 * Get all search history for a user
 */
export async function getSearchHistory(userId: string): Promise<SearchHistory[]> {
    const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to last 50 searches

    if (error) {
        console.error('Error fetching search history:', error);
        return [];
    }

    return data || [];
}

/**
 * Delete a search history item
 */
export async function deleteSearchHistory(historyId: string): Promise<boolean> {
    const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('id', historyId);

    if (error) {
        console.error('Error deleting search history:', error);
        return false;
    }

    return true;
}

/**
 * Clear all search history for a user
 */
export async function clearSearchHistory(userId: string): Promise<boolean> {
    const { error } = await supabase
        .from('search_history')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('Error clearing search history:', error);
        return false;
    }

    return true;
}

