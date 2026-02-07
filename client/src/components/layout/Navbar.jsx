import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../common/Button';

import logo from '../../assets/logo.svg';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img src={logo} alt="StayManager" className="h-10" />
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-slate-600 hover:text-primary transition-colors font-medium">Home</Link>
                        <Link to="/features" className="text-slate-600 hover:text-primary transition-colors font-medium">Features</Link>
                        <Link to="/pricing" className="text-slate-600 hover:text-primary transition-colors font-medium">Pricing</Link>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/login" className="text-slate-600 hover:text-primary font-medium">Login</Link>
                        <Button onClick={() => navigate('/register')}>Get Started</Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-600 hover:text-slate-900">
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-lg">
                    <Link to="/" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Home</Link>
                    <Link to="/features" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Features</Link>
                    <Link to="/pricing" className="block text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Pricing</Link>
                    <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
                        <Link to="/login" className="text-center text-slate-600 font-medium" onClick={() => setIsOpen(false)}>Login</Link>
                        <Button className="w-full" onClick={() => { setIsOpen(false); navigate('/register'); }}>Get Started</Button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
