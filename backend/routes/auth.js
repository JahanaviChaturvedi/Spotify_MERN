const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const { getToken } = require("../utils/helpers");
const passport = require("passport");

// This POST route helps to register a user
router.post("/register", async (req, res) => {
  console.log("Register endpoint hit");
  console.log("Request body:", req.body);
  //  This code will run while the ./register api is called as a POST request
  const { email, password, firstName, lastName, username } = req.body;

  // Step 2: Does a user with this email already exist? If yes, we throw an error.
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res
        .status(403)
        .json({ error: "A user with this email already exists" });
    }

    // Step 3: Create a new user in the DB
    const hashedpassword = await bcrypt.hash(password, 10);
    const newUserData = {
      email,
      password: hashedpassword,
      firstName,
      lastName,
      username,
    };
    const newUser = await User.create(newUserData);
    console.log(newUserData);

    // Step 4: Create user token
    const token = await getToken(email, newUser);

    // Step 5: Return the result to user
    const userToReturn = { ...newUser.toJSON(), token };
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
  } catch (error) {
    console.log("Error During registration: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/login", async (req, res) => {
  // Step 1: Get email and password sent by user from req.body
  const { email, password } = req.body;
  try {
    // Step 2: Check if the user with the given email exixts
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      return res.status(403).json({ err: "Invalid credentials" });
    }
    console.log(existingUser);

    // Step 3: Check the password is correct
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password
    );
    if (!isPasswordValid) {
      return res.status(403).json({ err: "Invalid credentials" });
    }

    const token = await getToken(existingUser.email, existingUser);
    const userToReturn = { ...existingUser.toJSON(), token };
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
  } catch (error) {
    console.log("Error during Login: ", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// fetch user profile
router.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const userToReturn = { ...user.toJSON() };
      delete userToReturn.password;
      return res.status(200).json(userToReturn);
    } catch (error) {
      console.log("Error fetching user profile: ", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
