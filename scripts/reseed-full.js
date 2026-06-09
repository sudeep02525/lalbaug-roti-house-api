import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Category from '../src/models/Category.js';
import Product from '../src/models/Product.js';
import Variant from '../src/models/Variant.js';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Full Seeding');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const importData = async () => {
  try {
    await connectDB();

    await Category.deleteMany();
    await Product.deleteMany();
    await Variant.deleteMany();

    const categoriesData = [
      { name: 'Roti', desc: 'Freshly made rotis', img: '/images/Plain-Roti.jpeg' },
      { name: 'Bhakari', desc: 'Healthy Traditional Bhakari', img: '/images/Bajra-Bhakari.png' },
      { name: 'Sabji', desc: 'Fresh vegetables', img: '/images/dry-sabji.png' },
      { name: 'Dal', desc: 'Hot & delicious dals', img: '/images/dal.png' },
      { name: 'Rice', desc: 'Premium quality rice', img: '/images/plain-rise.png' },
      { name: 'Daily Combo', desc: 'Complete meals for the day', img: '/images/indian_roti_meal.png' },
      { name: 'Beverages', desc: 'Refreshing drinks', img: '/images/lemon-water.png' },
      { name: 'Dosa / Puri', desc: 'Special breakfast items', img: '/images/masala-puri.png' },
      { name: 'Regular Thali', desc: 'Traditional Thali', img: '/images/indian_roti_meal.png' }
    ];

    const catsMap = {};
    for (const c of categoriesData) {
      const created = await Category.create({ name: c.name, description: c.desc, active: true });
      catsMap[c.name] = created;
    }

    const addProduct = async (catName, name, img, sPrice, pPrice, pQty) => {
      const prod = await Product.create({
        categoryId: catsMap[catName]._id,
        name,
        description: `Authentic ${name}`,
        images: [img],
        active: true
      });
      await Variant.create({ productId: prod._id, name: 'Regular', price: sPrice, minQuantity: 1, active: true });
      if (pPrice && pQty) {
        await Variant.create({ productId: prod._id, name: `Pack of ${pQty}`, price: pPrice, minQuantity: pQty, active: true });
      }
    };

    // Rotis
    await addProduct('Roti', 'Plain Roti', '/images/Plain-Roti.jpeg', 12, 50, 5);
    await addProduct('Roti', 'Ghee Roti', '/images/Ghee-Roti.jpeg', 15, 70, 5);
    await addProduct('Roti', 'Fulka Roti', '/images/Fulka-Roti.jpeg', 10, 45, 5);
    await addProduct('Roti', 'Multigrain Roti', '/images/Multigrain-Roti.jpeg', 20, 90, 5);
    await addProduct('Roti', 'Paratha', '/images/Paratha.jpeg', 25, 110, 5);
    
    // Bhakari
    await addProduct('Bhakari', 'Bajra Bhakari', '/images/Bajra-Bhakari.png', 20);
    await addProduct('Bhakari', 'Jowar Bhakari', '/images/Jowar-Bhakari.png', 20);
    await addProduct('Bhakari', 'Rice Bhakari', '/images/Rice-Bhakari.png', 25);
    await addProduct('Bhakari', 'Ragi Bhakari', '/images/Ragi-Bhakari.png', 25);
    
    // Sabji
    await addProduct('Sabji', 'Dry Sabji', '/images/dry-sabji.png', 80);
    await addProduct('Sabji', 'Gravy Sabji', '/images/gravy-sabji.png', 90);
    await addProduct('Sabji', 'Pale Bhaji', '/images/pale-bhaji.png', 70);
    await addProduct('Sabji', 'Special Paneer Sabji', '/images/spl.paneer-sabji.png', 140);
    await addProduct('Sabji', 'Veg Usal', '/images/Veg-usal.png', 75);
    await addProduct('Sabji', 'Batata Bhaji', '/images/batata-bhaji.png', 60);

    // Dal
    await addProduct('Dal', 'Dal Fry', '/images/dal fry.png', 80);
    await addProduct('Dal', 'Masoor Dal', '/images/masoor-dal.png', 75);
    await addProduct('Dal', 'Palak Dal', '/images/palak-dal.png', 90);
    await addProduct('Dal', 'Katachi Aamti', '/images/katachi-aamti.png', 70);

    // Rice
    await addProduct('Rice', 'Plain Rice', '/images/plain-rise.png', 50);
    await addProduct('Rice', 'Jeera Rice', '/images/jeera-rice.png', 70);
    await addProduct('Rice', 'Masala Bhat', '/images/masala-bhat.png', 90);
    await addProduct('Rice', 'Veg Pulao', '/images/veg-pulao.png', 110);
    await addProduct('Rice', 'Veg Biryani', '/images/veg-biryani.png', 130);

    // Daily Combo
    await addProduct('Daily Combo', 'Mini Lunch Combo', '/images/indian_roti_meal.png', 120);
    await addProduct('Daily Combo', 'Deluxe Dinner Combo', '/images/indian_roti_meal.png', 180);
    await addProduct('Daily Combo', 'Family Pack Combo', '/images/indian_roti_meal.png', 350);

    // Beverages
    await addProduct('Beverages', 'Solkadhi', '/images/solkadhi.png', 40);
    await addProduct('Beverages', 'Kokam Juice', '/images/kokam-juice.png', 30);
    await addProduct('Beverages', 'Buttermilk', '/images/Buttermilk.png', 20);
    await addProduct('Beverages', 'Lemon Water', '/images/lemon-water.png', 15);

    // Dosa / Puri
    await addProduct('Dosa / Puri', 'Masala Puri', '/images/masala-puri.png', 45);
    await addProduct('Dosa / Puri', 'Plain Dosa', '/images/plain_dosa_item_1780581128158.png', 50);
    
    // Regular Thali
    await addProduct('Regular Thali', 'Traditional Thali', '/images/indian_roti_meal.png', 200);

    console.log('Database FULLY Re-seeded successfully!');
    process.exit();
  } catch (error) {
    console.error(error.stack);
    process.exit(1);
  }
};

importData();
