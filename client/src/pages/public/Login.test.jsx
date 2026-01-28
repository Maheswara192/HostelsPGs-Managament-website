import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from './Login';
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

describe('Login Component', () => {
    const mockLogin = vi.fn();

    const renderLogin = (role = 'owner') => {
        render(
            <AuthContext.Provider value={{ login: mockLogin }}>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </AuthContext.Provider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders login form with default owner tab', () => {
        renderLogin();
        expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Sign In as Owner/i })).toBeInTheDocument();
    });

    it('validates input fields', () => {
        renderLogin();
        const emailInput = screen.getByLabelText(/Email address/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
    });

    it('handles login submission', async () => {
        mockLogin.mockResolvedValue({ success: true, role: 'owner' });
        renderLogin();

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In as Owner/i }));

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password');
            expect(mockNavigate).toHaveBeenCalledWith('/owner');
        });
    });

    it('displays error message on failed login', async () => {
        mockLogin.mockResolvedValue({ success: false, message: 'Invalid credentials' });
        renderLogin();

        fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /Sign In as Owner/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
