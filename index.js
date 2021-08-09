require("dotenv").config();
const Discogs = require("disconnect").Client;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

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

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to the API",
  });
});

//get Request Token

const discogsAccessData = []

app.get("/authorize", (req, res) => {
  var oAuth = new Discogs().oauth();
  oAuth.getRequestToken(
    process.env.DISCOGS_API_KEY,
    process.env.DISCOGS_API_SECRET,
    "https://rlca-backend.herokuapp.com/callback",
    function (err, requestData) {
      discogsAccessData.push(requestData) 
      res.redirect(requestData.authorizeUrl);
    }
  );
});

// get access token

app.get("/callback", (req, res) => {
  var oAuth = new Discogs(discogsAccessData[0]).oauth();
  oAuth.getAccessToken(
    req.query.oauth_verifier,
    function (err, accessData) {
      discogsAccessData.push(accessData)
      res.redirect("http://localhost:3000/dashboard");
      

    }
  );
});

// make the OAuth call

app.get('/identity', function(req, res){
  console.log(discogsAccessData)
  var dis = new Discogs(discogsAccessData[1]);
	dis.getIdentity(function(err, data){
		res.send(data);
	});
});


// discogs test call





app.listen(port, () => console.log(`listening on port ${port}`));
