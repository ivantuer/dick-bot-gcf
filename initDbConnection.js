const { MongoClient } = require("mongodb");
const { MONGO_URI } = process.env;

exports.initDb = async () => {
  const mongoClient = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const client = await mongoClient.connect();

  const db = client.db("test");
  return db;
};
