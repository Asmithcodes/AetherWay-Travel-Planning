
import { TripInput, RouteOption, TransportType } from '../types';

/**
 * Mock Gemini Service
 * Returns fake route data for testing without API calls
 */

const MOCK_ROUTES: RouteOption[] = [
    {
        id: 'mock-flight-1',
        type: TransportType.FLIGHT,
        durationMinutes: 90,
        totalCost: 4500,
        currency: 'INR',
        costBreakdown: [
            { label: 'Base Fare', amount: 3200 },
            { label: 'Taxes & Fees', amount: 800 },
            { label: 'Baggage', amount: 500 }
        ],
        bookingUrl: 'https://www.google.com/flights',
        recommendationType: 'FASTEST',
        recommendationReason: 'This is the fastest option available. Direct flight with minimal layover time.',
        groundingSources: [
            { title: 'IndiGo Airlines', uri: 'https://www.goindigo.in' },
            { title: 'Air India', uri: 'https://www.airindia.in' }
        ]
    },
    {
        id: 'mock-train-1',
        type: TransportType.TRAIN,
        durationMinutes: 960,
        totalCost: 1200,
        currency: 'INR',
        costBreakdown: [
            { label: 'Ticket Fare (AC 2-Tier)', amount: 1000 },
            { label: 'Reservation Fee', amount: 150 },
            { label: 'Service Charge', amount: 50 }
        ],
        bookingUrl: 'https://www.irctc.co.in',
        recommendationType: 'CHEAPEST',
        recommendationReason: 'Most economical option with comfortable AC seating. Overnight journey saves on hotel costs.',
        groundingSources: [
            { title: 'IRCTC', uri: 'https://www.irctc.co.in' },
            { title: 'RailYatri', uri: 'https://www.railyatri.in' }
        ]
    },
    {
        id: 'mock-bus-1',
        type: TransportType.BUS,
        durationMinutes: 1020,
        totalCost: 800,
        currency: 'INR',
        costBreakdown: [
            { label: 'Sleeper Bus Ticket', amount: 750 },
            { label: 'Booking Fee', amount: 50 }
        ],
        bookingUrl: 'https://www.redbus.in',
        recommendationType: 'BEST_VALUE',
        recommendationReason: 'Great balance between cost and comfort. Sleeper bus with good amenities and reliable service.',
        groundingSources: [
            { title: 'RedBus', uri: 'https://www.redbus.in' },
            { title: 'AbhiBus', uri: 'https://www.abhibus.com' }
        ]
    },
    {
        id: 'mock-car-1',
        type: TransportType.CAR,
        durationMinutes: 780,
        totalCost: 3500,
        currency: 'INR',
        costBreakdown: [
            { label: 'Fuel Cost', amount: 2000 },
            { label: 'Toll Charges', amount: 800 },
            { label: 'Parking', amount: 200 },
            { label: 'Food & Breaks', amount: 500 }
        ],
        bookingUrl: 'https://www.google.com/maps',
        recommendationReason: 'Self-drive option offers flexibility and privacy. Scenic route with multiple rest stops available.',
        groundingSources: [
            { title: 'Google Maps', uri: 'https://www.google.com/maps' }
        ]
    },
    {
        id: 'mock-rideshare-1',
        type: TransportType.RIDESHARE,
        durationMinutes: 840,
        totalCost: 1500,
        currency: 'INR',
        costBreakdown: [
            { label: 'Shared Cab Fare', amount: 1400 },
            { label: 'Platform Fee', amount: 100 }
        ],
        bookingUrl: 'https://www.blablacar.in',
        recommendationReason: 'Affordable shared ride with verified drivers. Split costs with other travelers.',
        groundingSources: [
            { title: 'BlaBlaCar', uri: 'https://www.blablacar.in' },
            { title: 'QuickRide', uri: 'https://www.quickride.in' }
        ]
    }
];

export async function generateRoutes(input: TripInput): Promise<RouteOption[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Adjust currency if needed
    const routes = MOCK_ROUTES.map(route => ({
        ...route,
        currency: input.currency,
        // Simple currency conversion (just for demo)
        totalCost: route.currency === input.currency
            ? route.totalCost
            : Math.round(route.totalCost * getCurrencyMultiplier(input.currency)),
        costBreakdown: route.costBreakdown.map(item => ({
            ...item,
            amount: route.currency === input.currency
                ? item.amount
                : Math.round(item.amount * getCurrencyMultiplier(input.currency))
        }))
    }));

    return routes;
}

function getCurrencyMultiplier(targetCurrency: string): number {
    const multipliers: Record<string, number> = {
        'INR': 1,
        'USD': 0.012,
        'EUR': 0.011,
        'GBP': 0.0095,
        'JPY': 1.8,
        'AUD': 0.018,
        'CAD': 0.016
    };
    return multipliers[targetCurrency] || 1;
}
