import mongoose from 'mongoose';

const deliverySlabSchema = new mongoose.Schema({
  maxKm: { type: Number, required: true },
  charge: { type: Number, required: true },
  isFree: { type: Boolean, default: false }
}, { _id: false });

const specialItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number },
  packPrice: { type: Number },
  packSize: { type: Number },
  image: { type: String },
  description: { type: String },
  isVeg: { type: Boolean, default: true },
  inStock: { type: Boolean, default: true }
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  restaurantName: { type: String, default: 'Lalbaug Roti House' },
  restaurantPhone: { type: String, default: '9324688099' },
  restaurantLat: { type: Number, default: 18.9950 },
  restaurantLng: { type: Number, default: 72.8396 },
  minOrderQty: { type: Number, default: 5 },
  maxRadiusKm: { type: Number, default: 20 },
  isAcceptingOrders: { type: Boolean, default: true },
  serviceStartTime: { type: String, default: '09:00' },
  serviceEndTime: { type: String, default: '22:00' },
  deliverySlabs: {
    type: [deliverySlabSchema],
    default: [
      { maxKm: 3, charge: 20 },
      { maxKm: 5, charge: 30 },
      { maxKm: 8, charge: 50 },
      { maxKm: 12, charge: 70 },
      { maxKm: 20, charge: 100 }
    ]
  },
  heroTitle1: { type: String, default: 'Har Roti,' },
  heroTitle2: { type: String, default: 'Dil Se!' },
  heroSubtitle: { type: String, default: 'Fresh Handmade Roti, Bhakari,\nThepla & Delicious Food' },
  heroImage: { type: String, default: '/images/hero-platter.png' },
  craftTitle: { type: String, default: 'The Art of \nPerfect Dough' },
  craftDescription: { type: String, default: 'We believe that good food starts with pure ingredients. Every morning, our dough is freshly kneaded using premium wheat flour without any preservatives or artificial additives.\n\nRolled with care and cooked to perfection, our rotis offer the genuine taste of home, delivering warmth and comfort straight to your table.' },
  craftImage: { type: String, default: '/images/craft-baker.jpg' },
  craftImages: [{ type: String, default: [] }],
  aboutHeroTitle: { type: String, default: 'The Story Behind' },
  aboutHeroSubtitle: { type: String, default: 'Har Roti, Dil Se' },
  aboutHeroDescription: { type: String, default: 'At Lalbaug Roti House, we believe that nothing beats the taste of a warm, handmade roti. Born out of a passion for genuine traditional food, our journey started with a simple goal: to bring the comfort of home-cooked meals to every dining table in Mumbai.' },
  missionDescription: { type: String, default: 'To provide fresh, hygienic, and traditional handmade breads and meals daily. We strive to be the reliable kitchen for busy professionals, families, and events by never compromising on the quality of ingredients or the traditional methods of cooking.' },
  visionDescription: { type: String, default: 'To become the most trusted food brand in Mumbai for traditional staples. We envision a future where our name resonates with every customer, symbolizing our unwavering commitment to health, taste, and premium service.' },
  restaurantAddress: { type: String, default: 'Shop No 17/45, HY, Ganesh Nagar, Lal Baug, Mumbai - 400012' },
  restaurantEmail: { type: String, default: 'lalbaugrotihouse@gmail.com' },
  whatsappNumber: { type: String, default: '919920688099' },
  footerDescription: { type: String, default: 'Fresh handmade rotis, bhakari, thepla and traditional food delivered daily in Mumbai with love and care.' },
  facebookUrl: { type: String, default: '#' },
  instagramUrl: { type: String, default: '#' },
  mumbaiSpecials: {
    type: [specialItemSchema],
    default: [
      { id: 'm1', name: 'Genuine Puranpoli', price: 80, image: '/images/puranpoli.png', description: 'Sweet flatbread stuffed with lentil and jaggery', isVeg: true },
      { id: 'm2', name: 'Ukadiche Modak', packPrice: 120, packSize: 4, image: '/images/modak.png', description: 'Steamed sweet dumplings', isVeg: true },
      { id: 'm3', name: 'Mumbai Pav Bhaji', price: 150, image: '/images/pavbhaji.png', description: 'Spicy mashed vegetable curry with buttery buns', isVeg: true },
      { id: 'm4', name: 'Konkani Ghavane', price: 60, image: '/images/ghavane.png', description: 'Soft rice flour pancakes', isVeg: true },
      { id: 'm5', name: 'Crispy Bhajni Vade', packPrice: 90, packSize: 5, image: '/images/vade.png', description: 'Traditional multi-grain fritters', isVeg: true }
    ]
  }
}, { timestamps: true });

export default mongoose.model('Settings', settingsSchema);
