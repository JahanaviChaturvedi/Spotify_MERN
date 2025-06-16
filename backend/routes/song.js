const express = require("express");
const router = express.Router();
const passport = require("passport");
const Fuse = require("fuse.js");
const Song = require("../models/song");
const User = require("../models/user");

// Create songs✅
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name, thumbnail, track } = req.body;
    if (!name || !thumbnail || !track) {
      return res
        .status(400)
        .json({ err: "Insufficient details to create song." });
    }
    const artist = req.user._id;
    const songDetails = { name, thumbnail, track, artist };
    const createdSong = await Song.create(songDetails);
    return res.status(200).json(createdSong);
  }
);

// Get songs I have published✅
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
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { artistId } = req.params;
    // We can check if the artist does not exist
    const artist = await User.findOne({ _id: artistId });
    // ![] = false
    // !null = true
    // !undefined = true
    if (!artist) {
      return res.status(404).json({ err: "Artist does not exist" });
    }

    const songs = await Song.find({ artist: artistId });
    return res.status(200).json({ data: songs });
  }
);

// Get search artist songs by artist name✅
router.get(
  "/search/artist/:artistName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { artistName } = req.params;

    try {
      const artists = await User.find({
        firstName: { $regex: artistName, $options: "i" },
      });

      if (!artists || artists.length === 0) {
        return res
          .status(404)
          .json({ message: "No artist found with the given name." });
      }
      const artistIds = artists.map((artist) => artist._id);
      const songs = await Song.find({ artist: { $in: artistIds } }).populate(
        "artist"
      );
      return res.status(200).json({ success: true, data: songs });
    } catch (error) {
      console.error("Error searching songs by artist name:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// Get song by name ✅
router.get(
  "/get/songname/:songName",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { songName } = req.params;

    try {
      const filteredSongs = await Song.find({
        name: { $regex: songName, $options: "i" },
      })
        .select("name track thumbnail artist")
        .populate("artist");
      const fuse = new Fuse(filteredSongs, { keys: ["name"], threshold: 0.3 });
      const result = fuse.search(songName);
      const results = result.map((res) => res.item);
      if (results.length === 0) {
        return res.status(404).json({ success: false, error: "Song not found" });
      }

      return res.status(200).json({ success: true, data: results });
    } catch (err) {
      console.error("Error fetching song by name:", err);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  }
);

// Get top songs✅
router.get(
  "/top",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user_id;
      const topSongs = await Song.find({ listeners: userId })
        .sort({ playCount: -1 })
        .limit(10);
      console.log("top songs", topSongs);
      res.status(200).json({ success: true, data: topSongs });
    } catch (err) {
      console.error("Error fetching top songs:", err);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch top songs." });
    }
  }
);

// Get recently added songs✅
router.get(
  "/recently-added",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userId = req.user._id;
      const recentSongs = await Song.find({ artist: userId })
        .sort({ addedAt: -1 })
        .limit(10);
      return res.status(200).json({ data: recentSongs });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
