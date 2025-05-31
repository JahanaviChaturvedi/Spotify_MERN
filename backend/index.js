// npm init : package.json --- This is a node project
// npm i express : expressJs package installed --- Express Project
// importing express

const express = require("express");
const mongoose = require("mongoose");
const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt;
const passport = require("passport");
const User = require("./models/user");
const authRoutes = require("./routes/auth");
const songRoutes = require("./routes/song");
const playlistRoutes = require("./routes/playlist");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = 3003;


app.use(cors());

// converts any body to json format
app.use(express.json());

// connect mongoDB to nodeJS
mongoose
  .connect(
    "mongodb+srv://JahanaviChaturvedi:" +
      process.env.MONGO_PASSWORD +
      "@cluster0.jzqi7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((x) => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error while conecting to MongoDB", err);
  });

// setup passport_jwt
let opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.SECRET_KEY;
passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      console.log("JWT Playload: ", jwt_payload);
      const user = await User.findOne({ _id: jwt_payload.identifier });
      if (user) {
        console.log("User found: ", user);
        return done(null, user);
      } else {
        console.log("User not found");
        return done(null, false);
      }
    } catch (err) {
      console.log("Error during token validation: ", err);
      return done(err, false);
    }
  })
);

// API : GET type : / : return text "Hello world"
app.get("/", (req, res) => {
  // req contains all data for the request and response
  res.send("Hello World");
});

app.use("/auth", authRoutes);
app.use("/song", songRoutes);
app.use("/playlist", playlistRoutes);

// Tell express to run our page on localhost:3003
app.listen(port, () => {
  console.log("App is runnign on port " + port);
});
