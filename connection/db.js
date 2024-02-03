import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB connected");
    } catch (err) {
        console.log("DB connection error", err);
    }
    }
export default connectDb;