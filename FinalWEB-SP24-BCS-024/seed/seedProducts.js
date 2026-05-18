// ============================================
// seed/seedProducts.js — Populates DB with 30 products
// Run with:  npm run seed
// ============================================

require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/uniworth';

const products = [
    // ─── Polo Shirts (5) ───
    { name: 'Classic Black Polo Shirt', price: 2499, category: 'Polo Shirts', rating: 4.5, stock: 25, image: '/asset/prod1.webp', description: 'Premium cotton polo perfect for casual wear.' },
    { name: 'Navy Blue Sport Polo', price: 2799, category: 'Polo Shirts', rating: 4.7, stock: 18, image: '/asset/prod2.webp', description: 'Breathable sport polo for active days.' },
    { name: 'White Pique Polo', price: 2299, category: 'Polo Shirts', rating: 4.3, stock: 30, image: '/asset/prod3.webp', description: 'Crisp white polo, a timeless classic.' },
    { name: 'Maroon Striped Polo', price: 2999, category: 'Polo Shirts', rating: 4.6, stock: 12, image: '/asset/prod4.webp', description: 'Subtle stripes in rich maroon.' },
    { name: 'Olive Green Polo', price: 2599, category: 'Polo Shirts', rating: 4.4, stock: 22, image: '/asset/prod5.webp', description: 'Earthy olive tone for a refined look.' ,  isOnSale: true},

    // ─── Casual Shirts (5) ───
    { name: 'Linen Casual Shirt', price: 3499, category: 'Casual Shirts', rating: 4.8, stock: 15, image: '/asset/prod1.webp', description: 'Lightweight linen shirt for summer.' },
    { name: 'Denim Button-Up Shirt', price: 3799, category: 'Casual Shirts', rating: 4.5, stock: 20, image: '/asset/prod2.webp', description: 'Classic denim shirt with modern fit.' },
    { name: 'Checked Flannel Shirt', price: 3299, category: 'Casual Shirts', rating: 4.6, stock: 17, image: '/asset/prod3.webp', description: 'Cozy flannel for cooler days.' },
    { name: 'Oxford White Shirt', price: 3199, category: 'Casual Shirts', rating: 4.7, stock: 28, image: '/asset/prod4.webp', description: 'Versatile Oxford shirt for any occasion.' },
    { name: 'Printed Hawaiian Shirt', price: 2899, category: 'Casual Shirts', rating: 4.2, stock: 10, image: '/asset/prod5.webp', description: 'Bold tropical print for vacations.' },

    // ─── Ethnic (5) ───
    { name: 'White Cotton Kurta', price: 4499, category: 'Ethnic', rating: 4.9, stock: 14, image: '/asset/prod1.webp', description: 'Traditional kurta with intricate detailing.' },
    { name: 'Embroidered Sherwani', price: 12999, category: 'Ethnic', rating: 4.9, stock: 6, image: '/asset/prod2.webp', description: 'Wedding-ready sherwani with gold embroidery.' },
    { name: 'Black Waistcoat Set', price: 5999, category: 'Ethnic', rating: 4.7, stock: 9, image: '/asset/prod3.webp', description: 'Classic black waistcoat for formal events.' },
    { name: 'Beige Pathani Suit', price: 4999, category: 'Ethnic', rating: 4.6, stock: 11, image: '/asset/prod4.webp', description: 'Comfortable Pathani in beige tone.' },
    { name: 'Maroon Festive Kurta', price: 5499, category: 'Ethnic', rating: 4.8, stock: 8, image: '/asset/prod5.webp', description: 'Rich maroon kurta for special occasions.' },

    // ─── Blazers (5) ───
    { name: 'Navy Wool Blazer', price: 8999, category: 'Blazers', rating: 4.8, stock: 7, image: '/asset/prod1.webp', description: 'Sharp navy blazer for business meetings.' },
    { name: 'Charcoal Grey Blazer', price: 9499, category: 'Blazers', rating: 4.7, stock: 10, image: '/asset/prod2.webp', description: 'Versatile charcoal blazer.' },
    { name: 'Black Tuxedo Jacket', price: 14999, category: 'Blazers', rating: 4.9, stock: 5, image: '/asset/prod3.webp', description: 'Formal tuxedo for black-tie events.' },
    { name: 'Beige Linen Blazer', price: 7999, category: 'Blazers', rating: 4.5, stock: 12, image: '/asset/prod4.webp', description: 'Summer-ready linen blazer.' },
    { name: 'Pinstripe Power Suit Jacket', price: 11499, category: 'Blazers', rating: 4.6, stock: 8, image: '/asset/prod5.webp', description: 'Classic pinstripe for confident style.' },

    // ─── Co-ord Sets (4) ───
    { name: 'Beige Linen Co-ord Set', price: 6499, category: 'Co-ord Sets', rating: 4.7, stock: 13, image: '/asset/prod1.webp', description: 'Matching linen shirt and pants.' },
    { name: 'Black Twin Set', price: 6999, category: 'Co-ord Sets', rating: 4.6, stock: 11, image: '/asset/prod2.webp', description: 'Sleek black co-ord for evenings.' },
    { name: 'Olive Resort Wear', price: 6299, category: 'Co-ord Sets', rating: 4.5, stock: 15, image: '/asset/prod3.webp', description: 'Holiday-ready olive set.' },
    { name: 'White Summer Co-ord', price: 5999, category: 'Co-ord Sets', rating: 4.4, stock: 18, image: '/asset/prod4.webp', description: 'Crisp white co-ord for summer.' },

    // ─── Gurkha Pants (3) ───
    { name: 'Classic Beige Gurkha Pants', price: 3999, category: 'Gurkha Pants', rating: 4.7, stock: 20, image: '/asset/prod5.webp', description: 'Iconic Gurkha pants in beige.' },
    { name: 'Black Pleated Gurkha Pants', price: 4299, category: 'Gurkha Pants', rating: 4.8, stock: 16, image: '/asset/prod1.webp', description: 'Pleated for elegance and comfort.' },
    { name: 'Olive Military Gurkha Pants', price: 4199, category: 'Gurkha Pants', rating: 4.6, stock: 14, image: '/asset/prod2.webp', description: 'Military-inspired Gurkha pants.' },

    // ─── Accessories (3) ───
    { name: 'Brown Leather Belt', price: 1499, category: 'Accessories', rating: 4.5, stock: 35, image: '/asset/prod3.webp', description: 'Genuine leather belt with metal buckle.' },
    { name: 'Silk Tie - Burgundy', price: 1299, category: 'Accessories', rating: 4.4, stock: 40, image: '/asset/prod4.webp', description: 'Pure silk tie in deep burgundy.' },
    { name: 'Pocket Square Set', price: 999, category: 'Accessories', rating: 4.3, stock: 50, image: '/asset/prod5.webp', description: 'Set of 3 elegant pocket squares.' }
];

async function seedDatabase() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('🗑️  Cleared existing products');

        // Insert new ones
        const inserted = await Product.insertMany(products);
        console.log(`🌱 Seeded ${inserted.length} products successfully!`);

        await mongoose.connection.close();
        console.log('🔌 Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seed error:', error);
        process.exit(1);
    }
}

seedDatabase();
