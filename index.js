const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

app.use(
  cors({
    origin: ["http://localhost:5173","https://food-tiger-e5f40.web.app"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

//require('crypto').randomBytes(64).toString('hex')  -- create access token
// console.log("JWT Secret Key:", process.env.ACCESS_TOKEN);
const verifyToken = (req, res, next) => {
  const token = req.cookie?.token;
  // console.log("Cookies:", req.cookies.token);
  if (!token) {
    return res.status(401).send({ message: "Unauthorized access ggg" });
  }
  
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized access" });
    }
    req.user = decoded;
    next();
  });
  // console.log("token inside the verifyToken", token);
};

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
    // await client.connect();

    const featuredFoodCollection = client.db("foodTiger").collection("foods");

    const addFoodCollection = client.db("foodTiger").collection("addedFoods");
    const requestedFoodCollection = client
      .db("foodTiger")
      .collection("requestFoods");

    // auth related api
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "5h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.ACCESS_TOKEN === "production",
        })
        .send({ success: true });
    });

    app.post("/logout", async (req, res) => {
      res
        .clearCookie("token", {
          httpOnly: true,
          secure: true,
        })
        .send({ success: true });
    });

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

    app.get("/availableFoods", async (req, res) => {
      const name = req.query.name;
      let query = {};
      if (name) {
        query = { foodName: name };
      }
      const cursor = addFoodCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/availableFood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await addFoodCollection.findOne(query);
      res.send(result);
    });

    app.patch("/availableFood/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          status: data.status,
        },
      };
      const result = await addFoodCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.put("/availableFood/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          donarName: data.donarName,
          donarEmail: data.donarEmail,
          donarPhoto: data.donarPhoto,
          foodCreatedAt: data.foodCreatedAt,
          foodName: data.foodName,
          foodImageURL: data.foodImageURL,
          foodQuantity: data.foodQuantity,
          foodLocation: data.foodLocation,
          dateTime: data.dateTime,
          status: data.status,
          notes: data.notes,
        },
      };
      const result = await addFoodCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });

    app.delete("/availableFood/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = addFoodCollection.deleteOne(query);
      res.send(result);
    });

    app.post("/requestedFoods", async (req, res) => {
      const newRequestedFood = req.body;
      const result = await requestedFoodCollection.insertOne(newRequestedFood);
      res.send(result);
    });

    app.get("/requestedFoods", async (req, res) => {
      const cursor = requestedFoodCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
