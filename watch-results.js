
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URL);

async function showResults() {

  try {
    await client.connect();
    const database = client.db("demo");
    const collection = database.collection("buyWindowed");

    const timeoutMS = 60 * 1000
    const changeStream = collection.watch([], { timeoutMS });

    console.log(`Listening for changes (up to ${timeoutMS} MS)`);
    changeStream.on("change", (evt) => {
      const { documentKey, updateDescription, wallTime } = evt;
      console.log("// ⏰ 👀 📝  👇");
      console.log({ documentKey, updateDescription, wallTime });
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

showResults();
