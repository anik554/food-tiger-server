const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Job is falling from the sky");
});
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@movies.yat9m.mongodb.net/?retryWrites=true&w=majority&appName=Movies`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const featuredFoodCollection = client.db("foodTiger").collection("foods");

    const addFoodCollection = client.db("foodTiger").collection("addedFoods");

    app.get("/featuredFood", async (req, res) => {
      const cursor = featuredFoodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/addFood", async (req, res) => {
      const newFood = req.body;
      const result = await addFoodCollection.insertOne(newFood);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
