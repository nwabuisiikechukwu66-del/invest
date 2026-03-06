import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Realty<span>Investors</span></div>
            <p className="footer-desc">
              The global platform for fractional real estate investing. Build wealth through
              property from anywhere in the world, starting from $100.
            </p>
            <div className="social-links">
              {['X', 'in', 'f', 'yt'].map((s, i) => (
                <div key={i} className="social-link">{s}</div>
              ))}
            </div>
          </div>

          <div>
            <div className="footer-col-title">Company</div>
            <Link to="/about"        className="footer-link">About</Link>
            <Link to="/how-it-works" className="footer-link">How It Works</Link>
            <Link to="/blog"         className="footer-link">Blog</Link>
            <Link to="/contact"      className="footer-link">Careers</Link>
          </div>

          <div>
            <div className="footer-col-title">Invest</div>
            <Link to="/investments"  className="footer-link">Browse Properties</Link>
            <Link to="/how-it-works" className="footer-link">How It Works</Link>
            <Link to="/pricing"      className="footer-link">Pricing</Link>
            <Link to="/faq"          className="footer-link">FAQ</Link>
          </div>

          <div>
            <div className="footer-col-title">Support</div>
            <Link to="/faq"     className="footer-link">FAQ</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/contact" className="footer-link">Help Center</Link>
          </div>

          <div>
            <div className="footer-col-title">Legal</div>
            <a className="footer-link">Terms of Service</a>
            <a className="footer-link">Privacy Policy</a>
            <a className="footer-link">Risk Disclosure</a>
            <a className="footer-link">Cookie Policy</a>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © 2026 RealtyInvestors Ltd. All rights reserved. Investing involves risk.
            Past performance is not indicative of future results.
          </p>
          <div className="footer-legal">
            <a>Terms</a>
            <a>Privacy</a>
            <a>Risk</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
