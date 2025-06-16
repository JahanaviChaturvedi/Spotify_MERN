// Step 1 : require mongoose
const mongoose = require("mongoose");

// Step 2 : Create a mongoose schema(structure of user)
const playlist = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    songs: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Song",
      },
    ],
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      require: true,
    },
    collaborators: [
      {
        type: mongoose.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const playlistModel = mongoose.model("Playlist", playlist);
module.exports = playlistModel;
