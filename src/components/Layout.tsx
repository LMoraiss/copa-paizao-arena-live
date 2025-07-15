
import React from 'react';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="bg-marista-dark-blue text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Copa Paizão 2024</h3>
            <p className="text-marista-light-blue">
              Colégio Marista - Promovendo o esporte e a união
            </p>
            <div className="mt-4 text-sm text-gray-300">
              Desenvolvido com ❤️ para a comunidade Marista
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
