require("dotenv").config();

const express = require("express");
const { connectToMongoDB } = require("./connect");
const carRoutes = require("./routes/carRoutes");
const cors = require("cors");
const userRoutes = require("./routes/UserLoginAndSignupRoute");
const bookingRoutes = require("./routes/bookingRoutes");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const { handleWebhook } = require("./controller/paymentController");

const PORT = process.env.PORT || 8000;
const app = express();

// ✅ CORS setup to allow both localhost and Netlify frontend
const allowedOrigins = [
  "http://localhost:5173",
  "https://car-rental-sys.netlify.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// ✅ Webhook route (must come before express.json)
app.post("/api/payment/webhook", handleWebhook);

// ✅ Body parsers
app.use(express.json());
app.use(cookieParser());

// ✅ Main routes
app.use("/api/payment", paymentRoutes);
app.use("/api/cars", carRoutes);
app.use("/", userRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Test route
app.get("/test", (req, res) => {
  res.send("everything is fine");
});

// ✅ MongoDB connection
connectToMongoDB(process.env.MONGO_URL)
  .then(() => {
    console.log("MONGO CONNECTED");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
