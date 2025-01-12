const express=require("express");
const dotenv=require("dotenv").config();
const errorHandler = require('./middlewares/errorHandler');
const connectDb = require('./config/dbConnection');
const cors = require('cors');

connectDb();
const app = express();

const port=process.env.PORT;

const userRouter=require("./routes/userRouter");
const splitRouter=require("./routes/splitRouter");
const shareRouter=require("./routes/shareRouter");

app.use(cors({
  origin: '*',// Allows all origins. Replace '*' with your Flutter app's origin if needed.
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

app.use("/api/user",userRouter);
app.use("/api/split",splitRouter);
app.use("/api/share",shareRouter);

app.use(errorHandler);

app.listen(port,() => {
    console.log("Server running on port "+ port)
});