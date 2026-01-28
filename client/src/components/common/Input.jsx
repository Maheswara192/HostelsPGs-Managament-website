import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    const inputId = props.id || props.name;

    return (
        <div className={`w-full ${className}`}>
            {label && <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>}
            <input
                id={inputId}
                className={`input-field ${error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : ''} ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default Input;
