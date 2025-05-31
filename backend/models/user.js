// How to create Modules
// Step 1 : require mongoose
const mongoose = require("mongoose");

// Step 2 : Create a mongoose schema(structure of user)
const user = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  password: {
    type: String,
    required: true,
    private: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  likedSongs: [
    { type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
      default:[],
     },
  ],
  likedPlaylists: [
    { type: mongoose.Schema.Types.ObjectId,
       ref: "Playlist",
     },
  ],
  subscribedArtists: [
    { type: mongoose.Schema.Types.ObjectId,
       ref: "User",
     },
  ],
});

const userModel = mongoose.model("User", user);
module.exports = userModel;
