const express=require("express");
const dotenv=require("dotenv").config();
const errorHandler = require('./middlewares/errorHandler');

const app = express();

const port=process.env.PORT;

const userRouter=require("./routes/userRouter");
const splitRouter=require("./routes/splitRouter");
const shareRouter=require("./routes/shareRouter");

app.use(express.json());

app.use("/api/user",userRouter);
app.use("/api/split",splitRouter);
app.use("/api/share",shareRouter);

app.use(errorHandler);

app.listen(port,() => {
    console.log("Server running on port "+ port)
});