import { Link } from 'react-router-dom';
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-luxury-900 text-white mt-16">
      {/* Newsletter */}
      <div className="border-b border-luxury-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold mb-1">Stay in the Loop</h3>
              <p className="text-luxury-400 text-sm">Get exclusive offers, new arrivals and style tips.</p>
            </div>
            <form className="flex gap-0 w-full md:w-auto max-w-md" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-luxury-800 border border-luxury-700 text-white placeholder-luxury-500 focus:outline-none focus:border-gold-500 text-sm"
              />
              <button type="submit" className="px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white text-sm font-medium transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4">
              <span className="font-display text-2xl font-bold tracking-[0.15em]">CHIC</span>
              <span className="font-display text-2xl font-light tracking-[0.15em] text-gold-500 ml-1">CLOTHING</span>
            </div>
            <p className="text-luxury-400 text-sm leading-relaxed mb-4">
              Premium branded T-shirts from the world's finest fashion labels. Curated style, delivered to you.
            </p>
            <div className="flex gap-3">
              {[FaInstagram, FaTwitter, FaFacebook, FaYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 border border-luxury-700 flex items-center justify-center text-luxury-400 hover:text-gold-500 hover:border-gold-500 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <h4 className="text-xs tracking-widest uppercase font-semibold text-luxury-400 mb-4">Top Brands</h4>
            <ul className="space-y-2">
              {['Nike', 'Adidas', 'Puma', 'Tommy Hilfiger', 'Calvin Klein', "Levi's"].map(brand => (
                <li key={brand}>
                  <Link to={`/products?brand=${encodeURIComponent(brand)}`} className="text-sm text-luxury-400 hover:text-gold-400 transition-colors">
                    {brand}
                  </Link>
                </li>
              ))}
            </ul>
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
              <p className="text-sm text-white font-medium">9943983458</p>
              <p className="text-xs text-luxury-500">Mon–Sat, 10am–7pm</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-luxury-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p className="text-xs text-luxury-500">© 2024 CHIC CLOTHING. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-luxury-500">Payment: Google Pay · PhonePe · Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
