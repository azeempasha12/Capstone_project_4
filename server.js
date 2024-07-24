const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config(); // Load environment variables from .env file

const app = express();
const Getsubscriber = express.Router();
const Getsubscriber1 = express.Router();

app.use(express.json());
app.use(cors());
app.use("/subscribers", Getsubscriber);
app.use("/subscribers1", Getsubscriber1);

// MongoDB configuration
const url = process.env.MONGODB_URI;
console.log("MongoDB URI:", url); // Debugging log
if (!url || !url.startsWith("mongodb")) {
    console.error("Invalid or missing MongoDB URI");
    process.exit(1);
}
const client = new MongoClient(url);
let db;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

// Endpoints
Getsubscriber.get("/", async (req, res) => {
    try {
        let data = await db.collection("subscriber").find({}).toArray();
        res.status(200).send(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

Getsubscriber.get('/:id', async (req, res) => {
    const id = new ObjectId(req.params.id);

    try {
        let data = await db.collection('subscriber').find({ _id: id }).toArray();
        if (data.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).send(data);
    } catch (err) {
        console.error('Error fetching subscriber:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

Getsubscriber1.get("/:name", async (req, res) => {
    try {
        const name = req.params.name;
        const data = await db.collection("subscriber").findOne({ name: name });

        if (!data) {
            return res.status(404).json({ error: "Subscriber not found" });
        }
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error" });
    }
});

async function connectToMongoAndStartServer() {
    try {
        await client.connect();
        db = client.db("database");
        console.log("Connected to MongoDB");
        app.listen(3000, () => {
            console.log("Server is listening on port 3000");
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
        process.exit(1);  // Exit the process with a failure code
    }
}

connectToMongoAndStartServer().then(() => console.log("Connected")).catch(console.error);
