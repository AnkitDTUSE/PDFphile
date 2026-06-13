import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const dataBase = await mongoose.connect(
      `${process.env.MONGO_URI}/${process.env.DB_NAME}`,
    );
    console.log("DB connected!!", dataBase.connection.host);
  } catch (err) {
    console.log("error", err);
    throw err;
  }
};

export default connectDb;
