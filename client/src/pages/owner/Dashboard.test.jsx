import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import OwnerDashboard from './Dashboard';
import ownerService from '../../services/owner.service';
import { AuthContext } from '../../context/AuthContext';

// Mock dependencies
vi.mock('../../services/owner.service', () => ({
    default: {
        getDashboardStats: vi.fn(),
        getRooms: vi.fn(),
        getTenants: vi.fn()
    }
}));

// Mock StatsCard to avoid Skeleton issues and simplify assertions
vi.mock('../../components/common/StatsCard', () => ({
    default: ({ title, value }) => <div data-testid="stats-card">{title}: {value}</div>
}));

describe('Owner Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockStats = {
        tenants: 10,
        occupancy: 80,
        pendingRent: 15000,
        complaints: 2
    };

    const mockUser = {
        name: 'Test Owner',
        role: 'owner'
    };

    const renderDashboard = () => {
        render(
            <AuthContext.Provider value={{ user: mockUser }}>
                <BrowserRouter>
                    <OwnerDashboard />
                </BrowserRouter>
            </AuthContext.Provider>
        );
    };

    it('FETCHES and renders dashboard stats', async () => {
        ownerService.getDashboardStats.mockResolvedValue({ success: true, data: mockStats });

        renderDashboard();

        expect(screen.getByText(/Welcome back, Test Owner/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(ownerService.getDashboardStats).toHaveBeenCalled();
            expect(screen.getByText('Pending Rent: ₹15000')).toBeInTheDocument();
            expect(screen.getByText('Total Tenants: 10')).toBeInTheDocument();
            // New label check
            expect(screen.getByText('Action Items: 2')).toBeInTheDocument();
        });
    });
});
