import mongoose from "mongoose";
import * as dotenv from "dotenv";

dotenv.config();

export const mongoCLient = async () => {
  const MONGO_URI = process.env.MONGO_URI || "";
  if (!MONGO_URI) {
    throw new Error("MONGO_URI is not defined!");
  }
  const client = mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Database connected");
    })
    .catch(() => {
      console.log("Error while connecting in database!");
    });
};
