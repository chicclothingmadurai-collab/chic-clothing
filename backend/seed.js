require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Product = require('./models/Product');
const { Coupon } = require('./models/index');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chic-clothing';

const admins = [
  { name: 'Kishore G', email: 'kishoreg@student.tce.edu', password: 'Kishore@123', role: 'admin' },
  { name: 'Kalam', email: 'Kalamcricketer@gmail.com', password: 'Kalam@123', role: 'admin' },
  { name: 'Somu', email: 'SOMU24397@gmail.com', password: 'Somu@123', role: 'admin' },
  { name: 'Syed Shamil', email: 'Syedshamil3088@gmail.com', password: 'Shamil@123', role: 'admin' }
];

const colorMap = {
  'Black': '#1a1a1a',
  'White': '#FFFFFF',
  'Blue': '#1A56DB',
  'Red': '#E02424',
  'Green': '#057A55',
  'Grey': '#9CA3AF',
  'Navy Blue': '#1E3A5F',
  'Yellow': '#FACA15',
  'Brown': '#92400E',
  'Maroon': '#9B1C1C',
  'Olive Green': '#4D7C0F',
  'Sky Blue': '#7DD3FC'
};

const sampleProducts = [
  {
    name: 'Air Max Graphic Tee',
    brand: 'Nike',
    category: 'Printed',
    description: 'Classic Nike Air Max inspired graphic tee. Premium 100% cotton with bold print.',
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800', public_id: 'p1' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#FFFFFF' }],
    price: 2499, discount: 20, stock: 50, isFeatured: true, isBestSeller: true,
    tags: ['nike', 'graphic', 'printed', 'trending']
  },
  {
    name: 'Trefoil Essential Tee',
    brand: 'Adidas',
    category: 'Plain',
    description: 'The iconic Adidas Trefoil logo on premium jersey cotton. A wardrobe staple.',
    images: [
      { url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800', public_id: 'p2' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
    colors: [{ name: 'Navy Blue', hex: '#1E3A5F' }, { name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#FFFFFF' }],
    price: 1999, discount: 15, stock: 80, isFeatured: true,
    tags: ['adidas', 'classic', 'trefoil']
  },
  {
    name: 'Puma Evostripe Oversized',
    brand: 'Puma',
    category: 'Oversized',
    description: 'Oversized drop-shoulder fit with soft brushed interior. Perfect street style.',
    images: [
      { url: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?w=800', public_id: 'p3' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Grey', hex: '#9CA3AF' }, { name: 'Black', hex: '#1a1a1a' }],
    price: 2299, discount: 25, stock: 40, isNewArrival: true,
    tags: ['puma', 'oversized', 'streetwear']
  },
  {
    name: 'Tommy Flag Polo',
    brand: 'Tommy Hilfiger',
    category: 'Polo',
    description: 'Classic pique polo with embroidered Tommy Hilfiger flag. Premium quality.',
    images: [
      { url: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800', public_id: 'p4' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Navy Blue', hex: '#1E3A5F' }, { name: 'Red', hex: '#E02424' }],
    price: 3499, discount: 10, stock: 30, isFeatured: true, isBestSeller: true,
    tags: ['tommy', 'polo', 'premium', 'classic']
  },
  {
    name: 'Calvin Klein Monogram Tee',
    brand: 'Calvin Klein',
    category: 'Premium Cotton',
    description: 'Luxurious pima cotton tee with CK monogram chest print. Ultra-soft and breathable.',
    images: [
      { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800', public_id: 'p5' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Grey', hex: '#9CA3AF' }],
    price: 2999, discount: 0, stock: 25, isFeatured: true,
    tags: ['calvin klein', 'premium', 'luxury', 'cotton']
  },
  {
    name: "Levi's Vintage Logo Tee",
    brand: "Levi's",
    category: 'Casual',
    description: 'Authentic Levi vintage logo tee. Soft cotton jersey with relaxed fit.',
    images: [
      { url: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800', public_id: 'p6' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Blue', hex: '#1A56DB' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Maroon', hex: '#9B1C1C' }],
    price: 1799, discount: 30, stock: 65, isBestSeller: true,
    tags: ["levi's", 'vintage', 'casual', 'denim brand']
  },
  {
    name: 'Reebok Training Sport Tee',
    brand: 'Reebok',
    category: 'Sports',
    description: 'Performance moisture-wicking fabric. Engineered for intense workouts.',
    images: [
      { url: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=800', public_id: 'p7' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'Red', hex: '#E02424' }, { name: 'Blue', hex: '#1A56DB' }],
    price: 1999, discount: 20, stock: 55, isNewArrival: true,
    tags: ['reebok', 'sports', 'training', 'performance']
  },
  {
    name: 'H&M Basic Round Neck',
    brand: 'H&M',
    category: 'Round Neck',
    description: 'Versatile everyday round neck tee. Soft jersey cotton in many colors.',
    images: [
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800', public_id: 'p8' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Black', hex: '#1a1a1a' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Olive Green', hex: '#4D7C0F' }, { name: 'Sky Blue', hex: '#7DD3FC' }],
    price: 899, discount: 10, stock: 100, isNewArrival: true,
    tags: ['h&m', 'basic', 'round neck', 'everyday']
  },
  {
    name: 'Zara Minimal Print Tee',
    brand: 'Zara',
    category: 'Printed',
    description: 'Minimalist design with high fashion appeal. Soft premium fabric.',
    images: [
      { url: 'https://images.unsplash.com/photo-1512327536842-5aa37d1ba3e3?w=800', public_id: 'p9' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Black', hex: '#1a1a1a' }],
    price: 2199, discount: 0, stock: 35, isFeatured: true,
    tags: ['zara', 'minimal', 'fashion', 'trendy']
  },
  {
    name: 'US Polo Assn. Classic Polo',
    brand: 'US Polo Assn.',
    category: 'Polo',
    description: 'Timeless polo design with US Polo signature logo. Premium pique cotton.',
    images: [
      { url: 'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=800', public_id: 'p10' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Navy Blue', hex: '#1E3A5F' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Brown', hex: '#92400E' }],
    price: 1599, discount: 25, stock: 70, isBestSeller: true,
    tags: ['us polo', 'polo shirt', 'classic', 'premium']
  },
  {
    name: 'Jack & Jones Acid Wash Oversized',
    brand: 'Jack & Jones',
    category: 'Oversized',
    description: 'Trending acid wash oversized tee. Vintage-inspired streetwear aesthetic.',
    images: [
      { url: 'https://images.unsplash.com/photo-1504198322253-cfa87a0ff25f?w=800', public_id: 'p11' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Blue', hex: '#1A56DB' }, { name: 'Black', hex: '#1a1a1a' }],
    price: 1899, discount: 35, stock: 45, isNewArrival: true,
    tags: ['jack jones', 'oversized', 'acid wash', 'streetwear']
  },
  {
    name: 'Allen Solly Smart Casual Tee',
    brand: 'Allen Solly',
    category: 'Casual',
    description: 'Smart casual design for work-to-weekend transition. Premium cotton blend.',
    images: [
      { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', public_id: 'p12' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Sky Blue', hex: '#7DD3FC' }, { name: 'White', hex: '#FFFFFF' }, { name: 'Yellow', hex: '#FACA15' }],
    price: 1299, discount: 20, stock: 60,
    tags: ['allen solly', 'smart casual', 'office', 'cotton']
  },
  {
    name: 'Peter England Formal Round Neck',
    brand: 'Peter England',
    category: 'Round Neck',
    description: 'Sophisticated formal round neck in pure cotton. Office-ready style.',
    images: [
      { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800', public_id: 'p13' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Blue', hex: '#1A56DB' }],
    price: 1099, discount: 15, stock: 75,
    tags: ['peter england', 'formal', 'office', 'round neck']
  },
  {
    name: 'Van Heusen Flex Sport Polo',
    brand: 'Van Heusen',
    category: 'Polo',
    description: '4-way stretch performance polo. Goes from boardroom to courts seamlessly.',
    images: [
      { url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800', public_id: 'p14' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'Grey', hex: '#9CA3AF' }, { name: 'Navy Blue', hex: '#1E3A5F' }],
    price: 1799, discount: 10, stock: 40,
    tags: ['van heusen', 'polo', 'flex', 'sports']
  },
  {
    name: 'Louis Philippe Premium Cotton',
    brand: 'Louis Philippe',
    category: 'Premium Cotton',
    description: 'Supima cotton luxury tee. Exceptional softness and longevity.',
    images: [
      { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800', public_id: 'p15' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [{ name: 'White', hex: '#FFFFFF' }, { name: 'Maroon', hex: '#9B1C1C' }, { name: 'Black', hex: '#1a1a1a' }],
    price: 2799, discount: 5, stock: 20, isFeatured: true,
    tags: ['louis philippe', 'premium', 'supima cotton', 'luxury']
  }
];

const coupons = [
  {
    code: 'WELCOME20',
    description: '20% off on first order',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 999,
    maxDiscountAmount: 500,
    usageLimit: 1000,
    userLimit: 1,
    isActive: true,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  },
  {
    code: 'CHIC500',
    description: 'Flat ₹500 off on orders above ₹2499',
    discountType: 'fixed',
    discountValue: 500,
    minOrderAmount: 2499,
    usageLimit: 500,
    userLimit: 1,
    isActive: true,
    expiresAt: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  },
  {
    code: 'PREMIUM15',
    description: '15% off on premium brands',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 1999,
    maxDiscountAmount: 300,
    usageLimit: null,
    userLimit: 1,
    isActive: true,
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({ role: 'admin' });
    await Product.deleteMany({});
    await Coupon.deleteMany({});

    // Seed admins
    for (const admin of admins) {
      await User.create(admin);
      console.log(`✅ Admin created: ${admin.email}`);
    }

    // Seed products
    for (const product of sampleProducts) {
      const p = new Product(product);
      p.finalPrice = Math.round(p.price * (1 - p.discount / 100));
      p.ratings = (Math.random() * 2 + 3).toFixed(1);
      p.numReviews = Math.floor(Math.random() * 200 + 10);
      p.soldCount = Math.floor(Math.random() * 500 + 50);
      await p.save();
    }
    console.log(`✅ ${sampleProducts.length} products seeded`);

    // Seed coupons
    await Coupon.insertMany(coupons);
    console.log(`✅ ${coupons.length} coupons seeded`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nAdmin Credentials:');
    admins.forEach(a => console.log(`  ${a.email} → ${a.password}`));

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
