// Temporarily load dotenv directly for debugging purposes,
// regardless of NODE_ENV. This helps ensure it runs and logs.
// In a final production setup, you'd typically rely on the hosting
// platform to inject env vars, or keep the conditional load if you
// manage .env files securely on the server.
require("dotenv").config();

const express = require("express");
const { connectToMongoDB } = require("./connect");
const carRoutes = require("./routes/carRoutes");
const cors = require("cors");
const userRoutes = require("./routes/UserLoginAndSignupRoute");
const bookingRoutes = require("./routes/bookingRoutes");
const PORT = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { handleWebhook } = require("./controller/paymentController");

const app = express();

// IMPORTANT: Define the webhook route FIRST.
// We are NO LONGER using express.raw() here. The raw body will be read manually inside handleWebhook.
app.post("/api/payment/webhook", handleWebhook);

// Now, apply express.json() globally for all other routes that expect JSON.
// This must come AFTER the specific webhook route definition.
app.use(express.json());
app.use(cookieParser());

// Configure CORS after express.json() if you need to access req.body in origin function
// but before other routes so it applies globally.
app.use(cors({
  origin: [process.env.LOCAL_FRONTEND_URL || "http://localhost:5173", process.env.FRONTEND_URL],
  credentials: true
}));


// Now, mount your other routes
// paymentRoutes still contains /create-checkout-session, but /webhook is now handled above.
app.use("/api/payment", paymentRoutes);
app.use('/api/cars', carRoutes);
app.use("/", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);


app.get("/test", (req, res) => {
  res.send("everything is fine");
});
app.get("again-test" , (req , res ) =>{
  res.send("everything is again fine");
})
connectToMongoDB(process.env.MONGO_URL)
  .then(() => {
    console.log("MONGO CONNECTED");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  // Move console.logs inside the listen callback to ensure they are captured
  // after the server process is fully initiated and logging is active.
  console.log(`Server is running at port ${PORT}`);
  console.log("--- Environment Variables (Debug) ---");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("LOCAL_FRONTEND_URL:", process.env.LOCAL_FRONTEND_URL);
  console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
  console.log("--- End Environment Variables (Debug) ---");
});
