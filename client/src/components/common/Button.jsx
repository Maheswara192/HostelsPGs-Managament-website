import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Reusable Button Component
 * Supports multiple variants, sizes, and loading states.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'accent' | 'danger' | 'ghost'} [props.variant='primary'] - Visual style variant
 * @param {'sm' | 'md' | 'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.isLoading=false] - Shows loading spinner and disables button if true
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {...Object} props.rest - Other standard button attributes (onClick, type, etc.)
 */
const Button = ({ children, variant = 'primary', size = 'md', isLoading, className = '', ...props }) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg';

    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-outline',
        accent: 'btn-accent',
        danger: 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow active:scale-95',
        ghost: 'bg-transparent hover:bg-slate-100 text-slate-600 active:scale-95',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
