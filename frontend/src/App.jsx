import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AppProvider, useApp } from '@context/AppContext';
import Nav from '@components/Nav';
import Footer from '@components/Footer';
import Notifications from '@components/Notifications';
import FloatingChatButton from '@components/FloatingChatButton';

// Pages
import Home           from '@pages/Home';
import HowItWorks     from '@pages/HowItWorks';
import Investments    from '@pages/Investments';
import PropertyDetail from '@pages/PropertyDetail';
import About          from '@pages/About';
import Blog           from '@pages/Blog';
import FAQ            from '@pages/FAQ';
import Pricing        from '@pages/Pricing';
import Contact        from '@pages/Contact';
import Login          from '@pages/Login';
import Signup         from '@pages/Signup';
import Dashboard      from '@pages/Dashboard';
import AdminDashboard from '@pages/AdminDashboard';

const NO_FOOTER_ROUTES = ['/login', '/signup', '/dashboard', '/admin'];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function Layout() {
  const { pathname } = useLocation();
  const showFooter   = !NO_FOOTER_ROUTES.includes(pathname);

  return (
    <>
      <ScrollToTop />
      <Nav />
      <Notifications />
      <FloatingChatButton />

      <Routes>
        <Route path="/"              element={<Home />} />
        <Route path="/how-it-works"  element={<HowItWorks />} />
        <Route path="/investments"   element={<Investments />} />
        <Route path="/property/:id"  element={<PropertyDetail />} />
        <Route path="/about"         element={<About />} />
        <Route path="/blog"          element={<Blog />} />
        <Route path="/faq"           element={<FAQ />} />
        <Route path="/pricing"       element={<Pricing />} />
        <Route path="/contact"       element={<Contact />} />
        <Route path="/login"         element={<Login />} />
        <Route path="/signup"        element={<Signup />} />
        <Route path="/dashboard"     element={<Dashboard />} />
        <Route path="/admin"        element={<AdminDashboard />} />
        <Route path="*"              element={<NotFound />} />
      </Routes>

      {showFooter && <Footer />}
    </>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24, paddingTop: 'var(--nav-h)' }}>
      <h1 className="display display-lg" style={{ color: 'var(--black)' }}>404</h1>
      <p className="body-md" style={{ color: 'var(--gray)' }}>This page does not exist.</p>
      <a href="/" className="btn btn-dark">Go Home</a>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Layout />
    </AppProvider>
  );
}
