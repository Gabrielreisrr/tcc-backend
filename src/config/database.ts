import mongoose from "mongoose";

const MONGO_URI = process.env.MONGO_URI || "";
if (!MONGO_URI) {
  console.error("MongoDB connection error: MONGO_URI is not defined");
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

const initDB = async () => {
  await connectDB();
};

export default initDB;
