require("dotenv").config();
const Discogs = require("disconnect").Client;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const port = process.env.PORT || 3001;
const cookieParser = require("cookie-parser");
// let cookieSession = require("cookie-session");

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin:
      process.env.CLIENT_URL
  })
);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});
app.enable('trust proxy')
app.set("trust proxy", 1); // trust first proxy

//WITH SESSION
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    proxy : true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      sameSite: false,
      path: "/",
      httpOnly: true,
    },
    maxAge: 24 * 60 * 60 * 1000 * 100, // 2400 hours
  })
);


//DB CONNECTION

mongoose.connect(process.env.DATABASE_URL, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});
const db = mongoose.connection;

// URL'S

const API_BASE_URL =
  process.env.API_URL;
const client_url = process.env.CLIENT_URL

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



app.get("/authorize", (req, res) => {
  let oAuth = new Discogs().oauth();
  console.log("api keys", '\n', process.env.DISCOGS_API_KEY, process.env.DISCOGS_API_SECRET, '\n'); 
  oAuth.getRequestToken(
    process.env.DISCOGS_API_KEY,
    process.env.DISCOGS_API_SECRET,
    `${API_BASE_URL}/callback`,
    function (err, requestData) {
      req.session.requestData = JSON.stringify(requestData);
      console.log('cookie created successfully');
      // res.status(200).json(`/authorize: ${req.session.requestData}`)
      res.redirect(requestData.authorizeUrl);
});
});

// // get access token

app.get("/callback", (req, res) => {
  console.log('ahhhh', req.session.accessData)
  let oAuth = new Discogs(req.session.requestData).oauth();
  // let oAuth = new Discogs(JSON.parse(req.session.requestData)).oauth();
  console.log("THE QUERY", req.query)
  oAuth.getAccessToken(req.query.oauth_verifier, function (err, accessData) {

    console.log(err.message, accessData)
    req.session.accessData = JSON.stringify(accessData);
    res.redirect(`${client_url}/authorizing`);
  });
});

// // make the OAuth call

app.get("/identity", function (req, res) {
  console.log("THESE IS THE SESSION", '\n', req.session)
      // res.status(200).json(`/identity accessData: ${req.session.accessData}`)
      // let dis = new Discogs(req.session.accessData);
      console.log(req.session.accessData);
      let dis = new Discogs(JSON.parse(req.session.accessData));
  dis.getIdentity(function (err, data) {
    console.log("AN ERROR HAS OCCURRED", err, data);
    res.send(data);
  });
});

//search for a new label
app.get("/search", function (req, res) {
  let dis = new Discogs(
    "Sonic Archtecturev1.0",
    tempArr[1]
    // JSON.parse(req.session.accessData)
  );
  dis.database().search(req.query.discogsAccessparams, function (err, data) {
    console.log(err, data);
    res.send(data);
  });
});
//search for entries in the users labels

app.get("/usersLabelsSearch", function (req, res) {
  let dis = new Discogs(
    "Sonic Archtecturev1.0",
    tempArr[1]
    // JSON.parse(req.session.accessData)
  );
  dis
    .database()
    .getLabelReleases(req.query.discogsAccessParams, function (err, data) {
      console.log(err);
      res.send(data);
    });
});

app.listen(port, () => console.log(`listening on port ${port}`));

