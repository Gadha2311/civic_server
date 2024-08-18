import express,{Request,Response,NextFunction } from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import authRouter from"./routes/authroutes"
import adminroutes from "./routes/adminroutes"
import profileroutes from "./routes/profileroute";
import postroutes from "./routes/postroutes";



dotenv.config();
console.log("DB_URL:", process.env.DB_URL);
console.log("PORT:", process.env.PORT);
const app = express();

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

app.use(
  cors({
    origin: [
      "*",
      "http://localhost:5173",
      "http://localhost:5000",
    
    ],
  })
);
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/auth", adminroutes);
app.use("/api/auth", profileroutes);
app.use("/api/auth", postroutes);
// app.use("/api/auth",notificationroutes)


const DB_URL = process.env.DB_URL as string;
mongoose
  .connect(DB_URL)
  //, { useNewUrlParser: true, useUnifiedTopology: true, }
  .then(() => console.log("connected to mongoDB"))
  .catch((error) => console.error("Failed to connect to MongoDB", error));

app.use((err:any, req:Request, res:Response, next:NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

const PORT = process.env.PORT ;
app.listen(PORT, () => {
  console.log(`App is running on ${PORT}`);
});
