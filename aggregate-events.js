let sourceStream = {
  $source: {
    connectionName: "BuyEventIncoming",
    db: "demo",
    coll: "buy",
    config: {
      "fullDocument": "required",
    },
    tsFieldName: "timestamp"
  },
}


let calculate = {
  $tumblingWindow: {
    interval: { size: NumberInt(10), unit: "second" },
    pipeline: [
      {
        $group: {
          _id: "$fullDocument.sku",
          total: {
            $sum: "$fullDocument.price"
          },
          count: {
            $count: {}
          },
        }
      }]
  }
}

let finalOutput = {
  $merge: {
    into: {
      connectionName: "BuyEventOutgoing",
      db: "demo",
      coll: "buyWindowed"
    }
  }
}

let createInstance = () => sp.createStreamProcessor(
  "buyEventProcessor",
  [sourceStream, calculate, finalOutput]
);

generateDocs = () => {
  return [
    { sku: 'SKU-1', price: 1.2, timestamp: ISODate() },
    { sku: 'SKU-1', price: 1.2, timestamp: ISODate() },
    { sku: 'SKU-2', price: 2.3, timestamp: ISODate() },
    { sku: 'SKU-2', price: 2.3, timestamp: ISODate() },
    { sku: 'SKU-2', price: 2.3, timestamp: ISODate() },
    { sku: 'SKU-3', price: 3.4, timestamp: ISODate() },
    { sku: 'SKU-3', price: 3.4, timestamp: ISODate() },
    { sku: 'SKU-3', price: 3.4, timestamp: ISODate() },
    { sku: 'SKU-3', price: 3.4, timestamp: ISODate() }
  ]
}

print(`
// In mongosh, connected to the stream processing service and run:
p = createInstance();
p.start();

// To trigger the operation, enter some documents into the watched collection 
db.buy.insertMany(generateDocs());
`)