import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log(" MongoDB connected");
    } catch (err: any) {
        console.error(" MongoDB connection failed:", err.message, err);
        process.exit(1);        
    }
};
