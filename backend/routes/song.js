const express = require("express");
const router = express.Router();
const passport = require("passport");
const Fuse = require("fuse.js");
const Song = require("../models/song");
const User = require("../models/user");

router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name, thumbnail, track } = req.body;
    if (!name || !thumbnail || !track) {
      return res
        .status(301)
        .json({ err: "Insufficient details to create song." });
    }
    const artist = req.user._id;
    const songDetails = { name, thumbnail, track, artist };
    const createdSong = await Song.create(songDetails);
    return res.status(200).json(createdSong);
  }
);

// Get route to get songs I have published
router.get(
  "/get/mysongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      // We need to get all songs where artist id == currentUser._id
      const songs = await Song.find({ artist: req.user._id }).populate(
        "artist"
      );
      return res.status(200).json({ data: songs });
    } catch (err) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get route to all songs by any artist
router.get(
  "/get/artist/:artistId",
  passport.authenticate("jwt", {session: false}),
  async (req, res) => {
      const {artistId} = req.params;
      // We can check if the artist does not exist
      const artist = await User.findOne({_id: artistId});
      // ![] = false
      // !null = true
      // !undefined = true
      if (!artist) {
          return res.status(301).json({err: "Artist does not exist"});
      }

      const songs = await Song.find({artist: artistId});
      return res.status(200).json({data: songs});
  }
);

// Get song by name
router.get(
  "/get/songname/:songName",
  passport.authenticate("jwt", {session: false}),
  async (req, res) => {
      const {songName} = req.params;

      // name:songName --> exact name matching. Vanilla, Vanila
      try{
        const allSongs = await Song.find().populate("artist");
        const fuse = new Fuse(allSongs, {keys: ["name"], threshold: 0.3});
        const result = fuse.search(songName);
        if(result.length === 0){
          return res.status(404).json({error: "Song not found"});
        }

        //returns the best match song
        // Pattern matching instead of direct name matching.
        return res.status(200).json({data: result[0].item});
      } catch(err){
        console.error("Error fetchingsong by name:", err);
        return res.status(500).json({error: "Internal Server Error"});
      }
  }
);

module.exports = router;
