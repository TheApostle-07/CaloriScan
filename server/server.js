const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const axios = require("axios");
const winston = require("winston");
const rateLimit = require("express-rate-limit");
const useragent = require("express-useragent");
const { MongoClient } = require("mongodb"); // MongoDB driver

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// MongoDB setup
const DATABASE_NAME = "caloriscan";
const COLLECTION_NAME = "apiCallCounts";
let db, apiCallCollection;

const client = new MongoClient(process.env.MONGO_URI); // Replace with your MongoDB URI
client.connect().then(() => {
  db = client.db(DATABASE_NAME);
  apiCallCollection = db.collection(COLLECTION_NAME);

  // Ensure the collection has a document to track API calls
  apiCallCollection.updateOne(
    { key: "apiCallCount" },
    { $setOnInsert: { key: "apiCallCount", count: 0 } },
    { upsert: true }
  );

  console.log("Connected to MongoDB");
}).catch(err => {
  console.error("Error connecting to MongoDB:", err);
  process.exit(1); // Exit if the database connection fails
});

// Middleware
app.use(express.json({ limit: "10mb" })); // Limit request payload size
app.use(cors());
app.use(useragent.express()); // Detect user agents for bot protection

// Logger configuration
const logger = winston.createLogger({
  level: "error",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "errors.log" }),
    new winston.transports.Console(), // Logs errors to the console
  ],
});

// **Rate Limiting**
const API_CALL_LIMIT = 600;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Maximum 100 requests per 15 minutes per IP
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests. Please try again after 15 minutes.",
    });
  },
});

// Apply rate limiting middleware to `/api` routes
app.use("/api", limiter);

// **Bot Protection Middleware**
app.use((req, res, next) => {
  if (req.useragent.isBot || req.useragent.isCurl || req.useragent.isEmpty) {
    return res.status(403).json({ error: "Bots are not allowed." });
  }
  next();
});

// **Google Vision API Route**
app.post("/api/detect", async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Image is required." });
  }

  try {
    // Retrieve the current API call count from MongoDB
    const apiCallDoc = await apiCallCollection.findOne({ key: "apiCallCount" });

    if (!apiCallDoc || apiCallDoc.count >= API_CALL_LIMIT) {
      return res.status(429).json({ error: "API call limit reached. Please try again tomorrow." });
    }

    // Increment the API call count
    await apiCallCollection.updateOne(
      { key: "apiCallCount" },
      { $inc: { count: 1 } }
    );

    // Send image to Google Vision API
    const visionResponse = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_API_KEY}`,
      {
        requests: [
          {
            image: { content: image },
            features: [{ type: "OBJECT_LOCALIZATION", maxResults: 10 }],
          },
        ],
      }
    );

    // Extract detected objects
    const objects = visionResponse.data.responses[0]?.localizedObjectAnnotations?.map(
      (obj) => obj.name
    );

    if (!objects || objects.length === 0) {
      return res.status(404).json({ message: "No objects detected in the image." });
    }

    // Prepare prompt for OpenAI API
    const prompt = `
The following objects were detected in an image: ${objects.join(", ")}.

Identify if any of these objects represent a food dish. If there are multiple food-related objects, return details only for the most specific or parent-level food dish. Ignore subcategories or generic classifications. 

For the identified parent food dish, provide the details in JSON format as follows:
{
  "object": "<name of the food dish>",
  "ingredients": [
    {
      "name": "<ingredient name>",
      "calories": "<calories per 100g or serving>"
    }
  ],
  "calorieMeter": "<Low | Medium | High>",
  "notRecommendedForDiseases": [
    "Disease 1",
    "Disease 2",
    "Disease 3",
    "Disease 4",
    "Disease 5"
  ],
  "commonUses": "<Common uses or purposes>",
  "nutritionalValue": "<Brief description of the nutritional value>"
}

If no food dishes are detected, return the following response:
{
  "response": "Food Item Not Found"
}

Ensure the output is valid JSON and fits within 500 tokens.
`;

    // Send the prompt to OpenAI
    const openaiResponse = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are an expert in food and nutrition." },
          { role: "user", content: prompt },
        ],
        max_tokens: 500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const aiResponseContent = openaiResponse.data.choices[0]?.message?.content;

    // Send response to the frontend
    return res.json({
      detectedObjects: objects,
      aiResponse: aiResponseContent,
      remainingTokens: 600 - (apiCallDoc.count + 1), // Update frontend with remaining calls
    });
  } catch (error) {
    // Log detailed error information
    logger.error({
      message: "Error occurred during detection",
      error: error.message,
      responseData: error.response?.data || null,
    });

    return res.status(500).json({
      error: "An error occurred during detection.",
      details: error.response?.data || error.message,
    });
  }
});

// **Remaining Token Endpoint**
app.get("/api/token-status", async (req, res) => {
  const apiCallDoc = await apiCallCollection.findOne({ key: "apiCallCount" });
  res.json({ remainingTokens: 600 - (apiCallDoc?.count || 0) });
});

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the CaloriScan Backend!");
});

// **Global Error Handling Middleware**
app.use((err, req, res, next) => {
  logger.error({
    message: "Unhandled error",
    error: err.message,
    stack: err.stack,
  });

  res.status(500).json({
    error: "An unexpected error occurred.",
    details: err.message,
  });
});

// **Start the Server**
const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});