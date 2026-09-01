import mongoose from "mongoose";
import "./models";

const MONGODB_URI = process.env.MONGODB_URI;

const globalForMongoose = globalThis as unknown as {
  mongoose?: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof mongoose> | null;
  };
};

export async function dbConnect() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local / Vercel env vars.",
    );
  }

  if (globalForMongoose.mongoose?.conn) {
    return globalForMongoose.mongoose.conn;
  }

  const cached = (globalForMongoose.mongoose ??= {
    conn: null,
    promise: null,
  });

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((m) => m);
  }

  const mongooseInstance = await cached.promise;
  cached.conn = mongooseInstance;
  return mongooseInstance;
}