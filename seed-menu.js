import mongoose from 'mongoose';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import Variant from './src/models/Variant.js';

const FOOD_IMG = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80";

const menuData = {
  "Roti": [
    { id: "r1", name: "Plain Roti", price: 12, packPrice: 50, packQty: 5, image: "/images/Plain-Roti.jpeg", desc: "Soft, hot, and freshly made whole wheat roti. Perfect with any gravy or sabji." },
    { id: "r2", name: "Ghee Roti", price: 15, packPrice: 65, packQty: 5, image: "/images/Ghee-Roti.jpeg", desc: "Fresh whole wheat roti brushed with pure, aromatic cow ghee for that rich, authentic taste." },
    { id: "r3", name: "Phulka Roti", price: 10, packPrice: 40, packQty: 5, image: "/images/Fulka-Roti.jpeg", desc: "Light, puffed up wheat phulkas roasted on an open flame. Melts in your mouth!" },
    { id: "r4", name: "Plain Paratha", price: 20, packPrice: 90, packQty: 5, image: "/images/Paratha.jpeg", desc: "Crispy, flaky, and golden-brown multi-layered paratha. A hearty companion to any meal." },
    { id: "r5", name: "Multigrain Roti", price: 25, packPrice: 115, packQty: 5, image: "/images/Multigrain-Roti.jpeg", desc: "Healthy and nutritious roti made from a special blend of wholesome grains." },
  ],
  "Bhakari": [
    { id: "b1", name: "Jowar Bhakari", price: 25, packPrice: 115, packQty: 5, image: "/images/Jowar-Bhakari.png", desc: "Authentic, gluten-free flatbread made from premium sorghum flour. Best enjoyed hot!" },
    { id: "b2", name: "Ragi Bhakari", price: 25, packPrice: 115, packQty: 5, image: "/images/Ragi-Bhakari.png", desc: "Extremely healthy, calcium-rich finger millet flatbread. Earthy flavors in every bite." },
    { id: "b3", name: "Rice Bhakari", price: 20, packPrice: 90, packQty: 5, image: "/images/Rice-Bhakari.png", desc: "Soft, white, and delicate flatbread made from premium rice flour. A Konkani specialty." },
    { id: "b4", name: "Bajra Bhakari", price: 25, packPrice: 115, packQty: 5, image: "/images/Bajra-Bhakari.png", desc: "Winter-favorite pearl millet flatbread, rich in iron and packed with traditional flavors." },
    { id: "b5", name: "Multigrain Bhakari", price: 30, packPrice: 140, packQty: 5, image: "/images/multigrain_bhakari_1780580321967.png", desc: "A power-packed flatbread combining the goodness of multiple millets and grains." },
  ],
  "Special Roti": [
    { id: "sr1", name: "Methi Thepla", price: 20, packPrice: 180, packQty: 10, image: "/images/Methi-Thepla.png", desc: "Flavorful Gujarati-style flatbread infused with fresh fenugreek leaves and traditional spices." },
    { id: "sr2", name: "Aalu Paratha", price: 30, packPrice: 140, packQty: 5, image: "/images/Aalu-Paratha.png", desc: "North Indian classic stuffed with a spicy, perfectly seasoned mashed potato filling." },
    { id: "sr3", name: "Cheese Paratha", price: 35, packPrice: 165, packQty: 5, image: "/images/Cheese-Paratha.png", desc: "Gooey, melted cheese stuffed inside a crispy, golden paratha. A favorite for all ages!" },
    { id: "sr4", name: "Tikha Paratha", price: 25, packPrice: 115, packQty: 5, image: "/images/thika-paratha.png", desc: "Spicy, layered flatbread seasoned with red chili and aromatic spices for a fiery kick." },
    { id: "sr5", name: "Puranpoli", price: 30, packPrice: 140, packQty: 5, image: "/images/Puranpoli.png", desc: "Traditional sweet flatbread stuffed with a rich filling of chana dal and jaggery." },
  ],
  "Dosa & Puri": [
    { id: "dp1", name: "Plain Puri", price: null, packPrice: 90, packQty: 10, image: "/images/plain_puri_item_1780581044907.png", desc: "Crispy, deep-fried golden puffed bread. The ultimate comfort food!" },
    { id: "dp2", name: "Bhajni Wade", price: null, packPrice: 110, packQty: 10, image: "/images/bhajni_wade_item_1780581059885.png", desc: "Spiced, deep-fried savory rings made from a special blend of roasted grains and lentils." },
    { id: "dp3", name: "Masala Puri", price: 20, packPrice: 90, packQty: 5, image: "/images/masala-puri.png", desc: "Crispy fried puris flavored with turmeric, chili, and aromatic spices." },
    { id: "dp4", name: "Upwas Puri Bhaji", price: 130, packPrice: null, packQty: null, image: "/images/upwas_puri_bhaji_item_1780581087398.png", desc: "A fasting-friendly combo of crispy Rajgira/Singhada puris served with special Farali potato bhaji." },
    { id: "dp5", name: "Upwas S. Khichdi", price: 60, packPrice: null, packQty: null, image: "/images/upwas_khichdi_item_1780581098951.png", desc: "Delicious Sabudana Khichdi made with tapioca pearls, crushed peanuts, and mild spices." },
    { id: "dp6", name: "Ghavane", price: 30, packPrice: 140, packQty: 5, image: "/images/ghavane_item_1780581114957.png", desc: "Soft, lacy traditional rice pancakes from the Konkan region. Light and healthy!" },
    { id: "dp7", name: "Plain Dosa", price: 25, packPrice: 115, packQty: 5, image: "/images/plain_dosa_item_1780581128158.png", desc: "Classic, thin and crispy crepe made from fermented rice and lentil batter." },
  ],
  "Daily Combo": [
    { id: "dc1", name: "Batata Wada & Bhaji", price: 100, packPrice: null, packQty: null, image: "/images/batata_wada_bhaji_item_1780581141998.png", desc: "Mumbai's favorite spicy potato fritters served alongside a comforting vegetable bhaji." },
    { id: "dc2", name: "Kothimbir Wadi & Patra", price: 100, packPrice: null, packQty: null, image: "/images/kothimbir_wadi_patra_item_1780581154672.png", desc: "A classic snack combo of crispy coriander fritters and spiced taro leaves." },
    { id: "dc3", name: "Dal Rice", price: 120, packPrice: null, packQty: null, image: "/images/Dal-Rice.png", desc: "The ultimate Indian comfort meal. Steaming hot rice served with flavorful yellow dal." },
    { id: "dc4", name: "Sabji Roti", price: 100, packPrice: null, packQty: null, image: "/images/Sabji-Roti.png", desc: "A wholesome daily meal featuring fresh, seasonal vegetable sabji and soft, hot rotis." },
    { id: "dc5", name: "Pithal Bhakari", price: 100, packPrice: null, packQty: null, image: "/images/Pithal-Bhakari.png", desc: "Traditional village-style spicy gram flour curry served with rustic, earthy bhakari." },
  ],
  "Beverage": [
    { id: "bv1", name: "Curd", price: 20, packPrice: null, packQty: null, image: "/images/Curd.png", desc: "Fresh, thick, and creamy dahi. Cooling and great for digestion." },
    { id: "bv2", name: "Buttermilk", price: 20, packPrice: null, packQty: null, image: "/images/Buttermilk.png", desc: "Refreshing traditional chaas spiced with roasted cumin and fresh coriander." },
    { id: "bv3", name: "Lemon Water", price: 20, packPrice: null, packQty: null, image: "/images/lemon-water.png", desc: "Freshly squeezed nimbu pani to hydrate and refresh your day." },
    { id: "bv4", name: "Solkadhi", price: 30, packPrice: null, packQty: null, image: "/images/solkadhi.png", desc: "A soothing, vibrant pink Konkani drink made from kokum and rich coconut milk." },
    { id: "bv5", name: "Kokam Juice", price: 20, packPrice: null, packQty: null, image: "/images/kokam-juice.png", desc: "Sweet, tangy, and cooling kokum sharbat. A perfect summer thirst quencher!" },
  ],
  "Sabji": [
    { id: "sb1", name: "Veg Usal", price: 60, packPrice: null, packQty: null, image: "/images/Veg-usal.png", desc: "A highly nutritious and spicy curry made from sprouted mixed beans." },
    { id: "sb2", name: "Gravy Sabji", price: 70, packPrice: null, packQty: null, image: "/images/gravy-sabji.png", desc: "Seasonal vegetables simmered in a rich, flavorful tomato and onion-based gravy." },
    { id: "sb3", name: "Spl. Paneer Sabji", price: 80, packPrice: null, packQty: null, image: "/images/spl.paneer-sabji.png", desc: "Soft cubes of fresh paneer cooked in a luscious, mildly spiced premium gravy." },
    { id: "sb4", name: "Pale Bhaji", price: 65, packPrice: null, packQty: null, image: "/images/pale-bhaji.png", desc: "Healthy, iron-rich leafy greens cooked homestyle with garlic and mild spices." },
    { id: "sb5", name: "Dry Sabji", price: 65, packPrice: null, packQty: null, image: "/images/dry-sabji.png", desc: "Homestyle dry vegetable preparation, perfect to pair with dal or just soft rotis." },
    { id: "sb6", name: "Batata Bhaji", price: 55, packPrice: null, packQty: null, image: "/images/batata-bhaji.png", desc: "Classic dry potato sabji tempered with mustard seeds and turmeric." },
    { id: "sb7", name: "Butter Pav Bhaji Special", price: 90, packPrice: null, packQty: null, image: "/images/butter-pav-bhaji-special.png", desc: "Spicy, mashed mixed vegetable curry loaded with butter, served hot." },
    { id: "sb8", name: "Pithal Only", price: 50, packPrice: null, packQty: null, image: "/images/pithal-only.png", desc: "Spicy and thick gram flour curry (Zunka), a staple comfort food from Maharashtra." },
  ],
  "Rice": [
    { id: "rc1", name: "Plain Rice", price: 60, packPrice: null, packQty: null, image: "/images/plain-rise.png", desc: "Steaming hot, fluffy, and perfectly cooked premium white rice." },
    { id: "rc2", name: "Veg Pulao", price: 120, packPrice: null, packQty: null, image: "/images/veg-pulao.png", desc: "Fragrant basmati rice cooked with fresh mixed vegetables and mild aromatic spices." },
    { id: "rc3", name: "Masale Bhat", price: 80, packPrice: null, packQty: null, image: "/images/masala-bhat.png", desc: "Traditional spiced rice cooked with veggies and a special goda masala." },
    { id: "rc4", name: "Veg. Biryani", price: 150, packPrice: null, packQty: null, image: "/images/veg-biryani.png", desc: "Rich, aromatic, and flavorful layered rice dish cooked with marinated vegetables and exotic spices." },
    { id: "rc5", name: "Jeera Rice", price: 70, packPrice: null, packQty: null, image: "/images/jeera-rice.png", desc: "Fluffy rice tempered with roasted cumin seeds and a touch of ghee." },
    { id: "rc6", name: "Tawa Pulao", price: 70, packPrice: null, packQty: null, image: "/images/tawa-pulao.png", desc: "Spicy Mumbai street-style rice tossed with pav bhaji masala and fresh veggies on a flat griddle." },
  ],
  "Dal": [
    { id: "dl1", name: "Dal", price: 70, packPrice: null, packQty: null, image: "/images/dal.png", desc: "Simple, homestyle yellow lentils cooked to perfection. Comfort in a bowl." },
    { id: "dl2", name: "Dal Fry", price: 80, packPrice: null, packQty: null, image: "/images/dal fry.png", desc: "Yellow lentils tempered with a spicy mix of garlic, cumin, and red chilies." },
    { id: "dl3", name: "Masoor Dal", price: 70, packPrice: null, packQty: null, image: "/images/masoor-dal.png", desc: "Earthy and protein-rich whole brown lentils cooked in a spiced homestyle gravy." },
    { id: "dl4", name: "Dahi Kadhi", price: 70, packPrice: null, packQty: null, image: "/images/dahi-kadhi.png", desc: "A mildly spiced, sweet and tangy yogurt-based curry. Perfect with hot rice!" },
    { id: "dl5", name: "Tomato Saar", price: 70, packPrice: null, packQty: null, image: "/images/tomato-saar.png", desc: "A tangy, thin, and spicy tomato soup tempered with mustard and curry leaves." },
    { id: "dl6", name: "Palak Dal", price: 75, packPrice: null, packQty: null, image: "/images/palak-dal.png", desc: "A highly nutritious blend of yellow lentils cooked with fresh spinach and garlic." },
    { id: "dl7", name: "Katachi Aamti", price: 75, packPrice: null, packQty: null, image: "/images/katachi-aamti.png", desc: "A traditional sweet, spicy, and tangy thin dal made from the strained water of boiled chana dal." },
  ],
  "Regular Thali": [
    { id: "rt1", name: "Regular Thali", price: 200, packPrice: null, packQty: null, image: "/images/regular_thali_cat_1780580307017.png", desc: "A complete wholesome meal! Includes: 3 Rotis / 2 Bhakari's, 2 Sabji, Dal, Rice, Salad, Papad, Pickle, Chutney, and Sweet." },
  ]
};

async function seed() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/lalbaug-roti-house');
    console.log("Connected to MongoDB");

    await Category.deleteMany({});
    await Product.deleteMany({});
    await Variant.deleteMany({});

    for (const [categoryName, products] of Object.entries(menuData)) {
      const category = await Category.create({ name: categoryName });

      for (const item of products) {
        const product = await Product.create({
          categoryId: category._id,
          name: item.name,
          images: [item.image || FOOD_IMG],
          description: item.desc || '',
          active: true
        });

        if (item.price) {
          await Variant.create({
            productId: product._id,
            name: 'Single',
            price: item.price,
            minQuantity: 1
          });
        }

        if (item.packPrice && item.packQty) {
          await Variant.create({
            productId: product._id,
            name: `Pack of ${item.packQty}`,
            price: item.packPrice,
            minQuantity: item.packQty
          });
        }
      }
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed", err);
    process.exit(1);
  }
}

seed();
