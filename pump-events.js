import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URL;
const COLLECTION_NAME = "buy";

function fakeDocument() {
  const sku = `SKU-${Math.floor(Math.random() * 10).toString().padStart(1, "0")}`;
  const price = parseFloat((Math.random() * 100).toFixed(2));
  const timestamp = new Date();

  return { sku, price, timestamp: timestamp };
}

function delayMilli(minSec, maxSec) {
  return Math.floor(Math.random() * 1000 * (maxSec - minSec)) + minSec;
}

async function run() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  const db = client.db();
  const collection = db.collection(COLLECTION_NAME);

  console.log("Connected to MongoDB. Inserting documents...");

  while (true) {
    const doc = fakeDocument();
    await collection.insertOne(doc);

    console.log(new Date().toISOString(), ': ', doc);

    await new Promise((res) => setTimeout(res, delayMilli(1, 4)));
  }
}

run().catch(console.error);


