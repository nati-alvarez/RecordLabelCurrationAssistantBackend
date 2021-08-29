require("dotenv").config();
const Discogs = require("disconnect").Client;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
// const session = require("express-session");
const port = process.env.PORT || 3001;
const cookieParser = require("cookie-parser");
let cookieSession = require("cookie-session");

app.use(cookieParser());

app.use(
  cors({
    credentials: true,
    origin:
      process.env.NODE_ENV === "production"
        ? "https://sonic-architecture-v1.netlify.app"
        : "http://localhost:3000",
  })
);

// app.use(function(req, res, next) {
// res.setHeader(
//  "Access-Control-Allow-Credentials", "true",
// )
// next()
// })
// app.use(
//   session({
//     secret: "keyboard cat",
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       secure: process.env.NODE_ENV === "production",
//       sameSite: false,
//       path: "/",
//       httpOnly: true,
//     },
//     maxAge: 24 * 60 * 60 * 1000 * 100, // 2400 hours
//   })
// );
app.set("trust proxy", 1); // trust first proxy
app.use(
  cookieSession({
    name: "session",
    secret: "secret",
    secure: process.env.NODE_ENV === "production",
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 * 100, // 2400 hours
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

const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://rlca-backend.herokuapp.com"
    : "http://localhost:3001";
const client_url =
  process.env.NODE_ENV === "production"
    ? "https://sonic-architecture-v1.netlify.app"
    : "http://localhost:3000";

const tempArr = [];
//get Request Token
app.get("/authorize", (req, res) => {
  let oAuth = new Discogs().oauth();
  oAuth.getRequestToken(
    process.env.DISCOGS_API_KEY,
    process.env.DISCOGS_API_SECRET,
    `${API_BASE_URL}/callback`,
    // "http://localhost:3001/callback",
    function (err, requestData) {
      req.session.requestData = JSON.stringify(requestData);
      tempArr.push(requestData);
      res.redirect(requestData.authorizeUrl);
    }
  );
});

// get access token

app.get("/callback", (req, res) => {
  let oAuth = new Discogs(tempArr[0]).oauth();
  // let oAuth = new Discogs(JSON.parse(req.session.requestData)).oauth();
  oAuth.getAccessToken(req.query.oauth_verifier, function (err, accessData) {
    req.session.accessData = JSON.stringify(accessData);
    tempArr.push(accessData);
    res.redirect(`${client_url}/authorizing`);
    // res.redirect("http://localhost:3000/authorizing");
  });
});

// make the OAuth call

app.get("/identity", function (req, res) {
  let dis = new Discogs(tempArr[1]);
  // let dis = new Discogs(JSON.parse(req.session.accessData));
  console.log(tempArr[1]);
  dis.getIdentity(function (err, data) {
    console.log(err, data);
    res.send(data);
  });
});

// discogs test call
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
