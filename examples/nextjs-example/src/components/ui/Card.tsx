import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
      )}
      {children}
    </div>
  );
}
