import React from 'react';

export function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-hidden="true"
    >
      <rect width="40" height="40" rx="12" fill="url(#lumiere_grad)" />
      <path
        d="M20 9C21.8 14.2 24.8 17.2 30 19C24.8 20.8 21.8 23.8 20 29C18.2 23.8 15.2 20.8 10 19C15.2 17.2 18.2 14.2 20 9Z"
        stroke="#FAF7F5"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="19" r="2.2" fill="#FAF7F5" />
      <path
        d="M13 28.5C15.2 27.2 17.5 26.6 20 26.6C22.5 26.6 24.8 27.2 27 28.5"
        stroke="#FAF7F5"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.75"
      />
      <defs>
        <linearGradient id="lumiere_grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B87D64" />
          <stop offset="1" stopColor="#7D4C3A" />
        </linearGradient>
      </defs>
    </svg>
  );
}
