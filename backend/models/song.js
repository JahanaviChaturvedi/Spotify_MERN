// How to create Modules
// Step 1 : require mongoose
const mongoose = require("mongoose");

// Step 2 : Create a mongoose schema(structure of user)
const song = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    thumbnail:{
        type: String,
        required: true,
    },
    track:{
        type: String,
        required: true,
    },
    artist:{
        type: mongoose.Types.ObjectId,
        ref: "User",
    },
});

const songModel = mongoose.model("Song", song);
module.exports = songModel;