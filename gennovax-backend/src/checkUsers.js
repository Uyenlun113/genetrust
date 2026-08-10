import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('--- COLLECTIONS IN DATABASE ---');
  console.log(collections.map(c => c.name));
  
  for (const col of collections) {
    const count = await db.collection(col.name).countDocuments();
    console.log(`Collection: ${col.name} -> ${count} documents`);
    if (col.name.toLowerCase().includes('user')) {
      const sample = await db.collection(col.name).find({}).toArray();
      console.log(`Sample users in ${col.name}:`, sample);
    }
  }
  console.log('------------------------------');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
