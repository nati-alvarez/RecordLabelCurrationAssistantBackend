require("dotenv").config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors")
const server = express();
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

server.get("/", (req, res) => {
	res.json({
		message: "Welcome to the API",
	});
});



app.listen(port, () => console.log(`listening on port ${port}`))
