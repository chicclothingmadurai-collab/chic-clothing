import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-luxury-900 text-white mt-16">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="font-display text-2xl font-bold tracking-[0.15em]">CHIC</span>
              <span className="font-display text-2xl font-light tracking-[0.15em] text-gold-500 ml-1">CLOTHING</span>
            </div>
            <p className="text-luxury-400 text-sm leading-relaxed mb-4">
              Premium branded T-shirts from the world's finest fashion labels. Curated style, delivered to you.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/chic_clothingg_?igsh=MWNoY2pwbWIwY3U1MQ=="
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 border border-luxury-700 flex items-center justify-center text-luxury-400 hover:text-gold-500 hover:border-gold-500 transition-colors"
              >
                <FaInstagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-semibold text-luxury-400 mb-4">Categories</h4>
            <ul className="space-y-2">
              {['Oversized T-Shirts', 'Polo T-Shirts', 'Round Neck', 'Printed T-Shirts', 'Sports T-Shirts', 'Premium Cotton'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${encodeURIComponent(cat.replace(' T-Shirts', ''))}`} className="text-sm text-luxury-400 hover:text-gold-400 transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-semibold text-luxury-400 mb-4">Support</h4>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', to: '/contact' },
                { label: 'My Orders', to: '/my-orders' },
                { label: 'My Profile', to: '/profile' },
                { label: 'FAQ', to: '/contact' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-sm text-luxury-400 hover:text-gold-400 transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-luxury-500">📞 Customer Support</p>
              <p className="text-sm text-white font-medium">8610485163</p>
              <p className="text-xs text-luxury-500">Mon–Sun</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-luxury-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-luxury-500">© 2026 CHIC CLOTHING. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-luxury-500">Payment: Google Pay · PhonePe </span>
          </div>
        </div>
      </div>
    </footer>
  );
}