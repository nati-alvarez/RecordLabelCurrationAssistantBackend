require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors")
const port = process.env.PORT || 3001;
app.use(
  cors({
    origin: "*",
  })
);

mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

app.use(express.json());

const userRouter = require("./routes/userRoutes");
app.use("/user", userRouter);

app.listen(port, () => console.log(`listening on port ${port}`))
