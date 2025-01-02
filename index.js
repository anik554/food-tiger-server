const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

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
    const requestedFoodCollection = client.db("foodTiger").collection("requestFoods");

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

    app.get("/availableFoods", async (req, res) => {
      const cursor = addFoodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/availableFood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addFoodCollection.findOne(query);
      res.send(result);
    });

    app.patch("/availableFood/:id",async(req,res)=>{
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc = {
        $set:{
          status: data.status
        }
      }
      const result = await addFoodCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })

    app.put("/availableFood/:id",async(req,res)=>{
      const id = req.params.id;
      const data = req.body;
      const filter = {_id: new ObjectId(id)}
      const updatedDoc = {
        $set:{
          donarName: data.donarName,
          donarEmail: data.donarEmail,
          donarPhoto:data.donarPhoto,
          foodCreatedAt:data.foodCreatedAt,
          foodName:data.foodName,
          foodImageURL:data.foodImageURL,
          foodQuantity:data.foodQuantity,
          foodLocation:data.foodLocation,
          dateTime:data.dateTime,
          status:data.status,
          notes:data.notes
        }
      }
      const result = await addFoodCollection.updateOne(filter,updatedDoc)
      res.send(result)
    })


    app.post("/requestedFoods",async(req,res)=>{
      const newRequestedFood = req.body;
      const result = await requestedFoodCollection.insertOne(newRequestedFood)
      res.send(result)
    })

    app.get("/requestedFoods",async(req,res)=>{
      const cursor = requestedFoodCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

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
