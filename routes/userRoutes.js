const express = require("express");

const router = express.Router();

const User = require("../models/user");

// Getting all
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch {
    res.status(500).json({message: err.message});
  }
});

// Getting One
router.get("/:id", getUserById, (req, res) => {
  res.json(res.user);
});

router.get("/:name", getUserByName, (req, res) => {
  res.json(res.user);
});

// Creating one
router.post("/", async (req, res) => {
  const user = new User({
    idNum: req.params.idNum,
    name: req.params.name
  });
  try {
    const newUser = await user.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({message: err.message});
  }
});

// Updating One
router.patch("/:id", getUserById, async (req, res) => {
  if (req.body.name != null) {
    res.user.name = req.body.name;
  }
  if (req.body.email != null) {
    res.user.email = req.body.email;
  }
  if (req.body.avatar != null) {
    res.user.avatar = req.body.avatar;
  }
  if (req.body.topTen != null) {
    if (res.user.topTen.length >= 10) {
      res.user.topTen.pop();
    }
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
router.delete("/:id", getUserById, async (req, res) => {
  try {
    await res.user.remove();
    res.json({message: "deleted user"});
  } catch {
    res.send(500).json({message: err.message});
  }
});

async function getUserById(req, res, next) {
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

async function getUserByName(req, res, next) {
  let user;
  try {
    user = await User.findOne(req.params.name);
    if (user == null) {
      return res.status(404).json({message: "Cannot find User"});
    }
  } catch {
    return res.status(500).json({message: err.message});
  }

  res.user = user;
  next();
}

// async function getUserByEmail(req, res, next) {
//   let user;
//   try {
//     user = await User.findOne({email:req.params.email})
//     if (user == null) {
//       return res.status(404).json({message: "Cannot find User"});
//     }
//   } catch {
//     return res.status(500).json({message: err.message});
//   }

//   res.user = user;
//   next();
// }

module.exports = router;
