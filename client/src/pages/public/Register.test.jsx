import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Register from './Register';
import { AuthContext } from '../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('Register Component', () => {
    const mockRegisterOwner = vi.fn();

    const renderRegister = () => {
        render(
            <AuthContext.Provider value={{ registerOwner: mockRegisterOwner }}>
                <BrowserRouter>
                    <Register />
                </BrowserRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders registration form', () => {
        renderRegister();
        expect(screen.getByText(/Register your PG/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Register as Owner/i })).toBeInTheDocument();
    });

    it('validates input fields', () => {
        renderRegister();
        expect(screen.getByLabelText(/Full Name/i)).toBeRequired();
        expect(screen.getByLabelText(/PG \/ Hostel Name/i)).toBeRequired();
        expect(screen.getByLabelText(/Email address/i)).toBeRequired();
        expect(screen.getByLabelText(/Password/i)).toBeRequired();
    });

    it('handles registration submission', async () => {
        mockRegisterOwner.mockResolvedValue({ success: true });
        renderRegister();

        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'New Owner' } });
        fireEvent.change(screen.getByLabelText(/PG \/ Hostel Name/i), { target: { value: 'Luxury PG' } });
        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'owner@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Register as Owner/i }));

        await waitFor(() => {
            expect(mockRegisterOwner).toHaveBeenCalledWith('New Owner', 'owner@test.com', 'password123', 'Luxury PG');
            expect(mockNavigate).toHaveBeenCalledWith('/owner');
        });
    });

    it('displays error message on failed registration', async () => {
        mockRegisterOwner.mockResolvedValue({ success: false, message: 'Registration failed' });
        renderRegister();

        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'New Owner' } });
        fireEvent.change(screen.getByLabelText(/PG \/ Hostel Name/i), { target: { value: 'Luxury PG' } });
        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'owner@test.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /Register as Owner/i }));

        await waitFor(() => {
            expect(screen.getByText('Registration failed')).toBeInTheDocument();
        });
    });
});
