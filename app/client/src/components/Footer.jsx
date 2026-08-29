import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs space-y-1">
        <p className="font-serif tracking-wide text-slate-300">
          ANLOGA DISTRICT RHEMA FULL GOSPEL CHURCHES — Monthly Report Portal
        </p>
        <p className="text-amber-400 font-medium tracking-normal">
          Developed by <span className="font-semibold text-white">V. C. Gbetodeme</span> | Contact:{' '}
          <a href="tel:0243302919" className="underline hover:text-white font-semibold">
            0243302919
          </a>
        </p>
      </div>
    </footer>
  );
};
