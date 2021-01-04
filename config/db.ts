import dotenv from "dotenv";
import mongoose from "mongoose";
import "colorts/lib/string";

dotenv.config({ path: "../config/config.env" });

const connectDb = async () => {
  const connect = await mongoose.connect(process.env.MONGODB_URI!, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log(
    `MongoDB connected: ${(await connect).connection.host}`.cyan.underline.bold
  );
};

export default connectDb;
