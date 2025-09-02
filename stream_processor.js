
import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_STREAM_URI);

const hoppingWindow = {
  $hoppingWindow:
  {
    "interval": { "size": 1, "unit": "hour" },
    "hopSize": { "size": 10, "unit": "minute" },
    "pipeline": [
      {
        $group: {
          _id: "$movie",
          walkIns: { $sum: "$ticketCount" }
        }
      }
    ]
  }
}
export const pipeline = [
  {
    $source: {
      connectionName: process.env.MONGO_STREAM_URI,
      db: "stream-demo",
      collection: "bought"
    }
  },
  {
    $tumblingWindow: {
      interval: { size: 3, unit: "seconds" },
      pipeline: [
        {
          $group: {
            _id: "$sku",
            totalPrice: { $sum: "$price" }
          }
        }
      ]
    }
  }
];

async function runStreamProcessing() {

  try {
    await client.connect();
    const database = client.db("your_database_name");
    const collection = database.collection("stream-demo");

    const pipeline = [
      {
        $window: {
          documents: ["unbounded", "current"],
          sortBy: { timestamp: 1 },
          output: {
            totalPrice: {
              $sum: "$price",
              window: {
                range: [3, "second"],
                unit: "time",
                behavior: "tumbling"
              }
            }
          },
          partitionBy: "$sku"
        }
      }
    ];

    const changeStream = collection.watch(pipeline);

    console.log("Listening for changes...");
    changeStream.on("change", (next) => {
      console.log("Change detected:", JSON.stringify(next, null, 2));
    });

  } catch (err) {
    console.error("Error:", err);
  }
}

runStreamProcessing();
