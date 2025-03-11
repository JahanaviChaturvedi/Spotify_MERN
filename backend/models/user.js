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
    password:{
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
    likedSongs: {
        // We will change this to array later
        type:String,
        default:"",
    },
    likedPlaylists: {
        // We will change this to array later
        type:String,
        default:"",
    },
    subscribedArtists: {
        // We will change this to array later
        type:String,
        default:"",
    },
});

const userModel = mongoose.model("User", user);
module.exports = userModel;