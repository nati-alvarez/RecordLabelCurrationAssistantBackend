const express = require("express");

const router = express.Router();

const User = require("../models/user");
const Redis = require("redis");

const RedisClient = Redis.createClient();

RedisClient.on("error", (err) => {
  console.log("Error " + err);
});

// Getting all
router.get("/", async (req, res) => {
  const users = await getOrSetCache("users", async () => {
    try {
      const users = await User.find();
      res.json(users);
      RedisClient.set("users", JSON.stringify(users));
    } catch {
      res.status(500).json({message: err.message});
    }
  });
  return users;
});

// Getting One
router.get("/:id", getUser, async (req, res) => {
  const user = await getOrSetCache(`users:${req.params.id}`, async () => {
    res.json(res.user);
  });
  res.json(user);
});

// Creating one
router.post("/", async (req, res) => {
  const user = new User({
    name: req.body.name,
    avatar: req.body.avatar,
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

// Updating One
router.patch("/:id", getUser, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.avatar != null) {
    res.user.avatar = req.body.avatar;
  }
  if (req.body.topTen != null) {
    res.user.topTen.push(req.body.topTen);
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

// Deleting One
router.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({message: "deleted user"});
  } catch {
    res.send(500).json({message: err.message});
  }
});

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({message: "Cannot find User"});
    }
  } catch {
    return res.status(500).json({message: err.message});
  }

  res.user = user;
  next();
}

function getOrSetCache(key, cb) {
  return new Promise((resolve, reject) => {
    RedisClient.get(key, async (error, data) => {
      if (error) return reject(error);
      if (data != null) return resolve(JSON.parse(data));
      const freshData = await cb();
      RedisClient.set(key, JSON.stringify(freshData));
      resolve(freshData);
    });
  });
}

module.exports = router;
