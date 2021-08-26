require("dotenv").config();
const Discogs = require("disconnect").Client;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const port = process.env.PORT || 3001;
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: "secret",
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

const discogsAccessData = [];

app.get("/authorize", (req, res) => {
  var oAuth = new Discogs().oauth();
  oAuth.getRequestToken(
    process.env.DISCOGS_API_KEY,
    process.env.DISCOGS_API_SECRET,
    "https://rlca-backend.herokuapp.com/callback",
    // "http://localhost:3001/callback",
    function (err, requestData) {
      discogsAccessData.push(requestData);
      res.redirect(requestData.authorizeUrl);
    }
  );
});

// get access token

app.get("/callback", (req, res) => {
  var oAuth = new Discogs(discogsAccessData[0]).oauth();
  oAuth.getAccessToken(req.query.oauth_verifier, function (err, accessData) {
    discogsAccessData.push(accessData);
    req.session.access = accessData;
    req.session.save();
    console.log(req.session);
    res.redirect("https://sonic-architecture-v1.netlify.app/dashboard");
    // res.redirect("http://localhost:3000/authorizing");
  });
});

// make the OAuth call

app.get("/identity", function (req, res) {
  var dis = new Discogs(discogsAccessData[1]);

  dis.getIdentity(function (err, data) {
    console.log(err);
    res.send(data);
  });
});

// discogs test call

app.get("/search", function (req, res) {
  console.log(req.params);
  var dis = new Discogs("Sonic Archtecturev1.0", discogsAccessData[1]);
  dis.database().search(req.query.discogsAccessparams, function (err, data) {
    console.log(err);
    res.send(data);
  });
});

app.listen(port, () => console.log(`listening on port ${port}`));
