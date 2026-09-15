import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmergencyBanner from '../components/EmergencyBanner';
import { motion } from 'motion/react';
import React from 'react';
import { getStoredUser } from '../utils/api';

export default function MainLayout() {
  const location = useLocation();
  const user = getStoredUser();
  const isStaffSession = ['admin', 'doctor', 'nurse', 'reception'].includes(user?.role);

  React.useEffect(() => {
    const elements = document.querySelectorAll('main section, main article, main form, main .rounded-3xl');
    elements.forEach((element) => element.classList.add('scroll-fly-in'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('scroll-fly-in-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative">
      <Navbar />
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </main>
      {!isStaffSession && <Footer />}
      <EmergencyBanner />
    </div>
  );
}
