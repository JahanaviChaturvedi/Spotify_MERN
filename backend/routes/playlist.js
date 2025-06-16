const express = require("express");
const passport = require("passport");
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Song = require("../models/song");

const router = express.Router();

// Create a playlis✅
router.post(
  "/create",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const currentUser = req.user;
    const { name, thumbnail, songs } = req.body;
    if (!name || !thumbnail || !songs) {
      return res.status(400).json({ err: "Insufficient data" });
    }
    const playlistData = {
      name,
      thumbnail,
      songs,
      owner: currentUser._id,
      collaborators: [],
    };
    const playlist = await Playlist.create(playlistData);
    return res.status(200).json(playlist);
  }
);

// Get a playlist by ID✅
router.get(
  "/get/playlist/:playlistId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    // req.params
    const playlistId = req.params.playlistId;
    const playlist = await Playlist.findOne({ _id: playlistId }).populate({
      path: "songs",
      populate: {
        path: "artist",
      },
    });
    if (!playlist) {
      return res.status(404).json({ err: "Invalid Id" });
    }
    return res.status(200).json({success: true, data: playlist});
  }
);

// Get playlist made by me✅
router.get(
  "/get/me",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const artistId = req.user._id;
    const playlists = await Playlist.find({ owner: artistId }).populate(
      "owner"
    );
    return res.status(200).json({ data: playlists });
  }
);

// Get all playlist made by an artist
// router.get(
//   "/get/artist/:artistId",
//   passport.authenticate("jwt", { session: false }),
//   async (req, res) => {
//     const artistId = req.params.artistId;
//     try {
//       const artist = await User.findById(artistId);
//       if (!artist) {
//         return res.status(404).json({
//           success: false,
//           message: "Artist not found. Invalid artist ID.",
//         });
//       }
//       const playlists = await Playlist.find({ owner: artistId });
//       return res.status(200).json({
//         success: true,
//         data: playlists,
//       });
//     } catch (err) {
//       console.error("Error fetching artist's playlists:", err);
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch artist's playlists. Please try again later.",
//       });
//     }
//   }
// );

// Add a song to playlist✅

router.post(
  "/add/song",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const { playlistId, songId } = req.body;
      const currentUser = req.user;

      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return res.status(404).json({ err: "Playlist does not exist" });
      }
      if (
        !playlist.owner.equals(currentUser._id) &&
        !playlist.collaborators.includes(currentUser._id)
      ) {
        return res.status(403).json({ err: "Permission denied" });
      }
      const song = await Song.findById(songId);
      if (!song) {
        return res.status(404).json({ err: "Song does not exist" });
      }
      playlist.songs.push(songId);
      await playlist.save();
      return res.status(200).json(playlist);
    } catch (err) {
      console.error("Error adding song to playlist:", err);
      res.status(500).json({ err: "Internal server error" });
    }
  }
);

// Get playlist by artistName
router.get(
  "/search/artist/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name } = req.params;
    try {
      const artists = await User.find({
        $or: [
          { firstName: { $regex: name, $options: "i" } },
          { lastName: { $regex: name, $options: "i" } },
        ],
      });
      if (!artists.length) {
        return res
          .status(404)
          .json({ success: false, message: "No artists found." });
      }
      const artistIds = artists.map((artist) => artist._id);
      const songs = await Song.find({ artist: { $in: artistIds } });
      const playlists = await Playlist.find({ owner: { $in: artistIds } });
      res.status(200).json({
        success: true,
        data: { songs, playlists },
      });
    } catch (error) {
      console.error("Error searching by artist name:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
);

router.get(
  "/search/playlist/:name",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { name } = req.params;
    try {
      const playlists = await Playlist.find({
        name: { $regex: name, $options: "i" },
      });
      if (!playlists.length) {
        return res
          .status(404)
          .json({ success: false, message: "No playlists found." });
      }
      res.status(200).json({ success: true, data: playlists });
    } catch (error) {
      console.error("Error searching playlists:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
);

//Get liked songs ✅
router.get(
  "/liked",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate("likedSongs");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      res.status(200).json({ songs: user.likedSongs });
    } catch (error) {
      console.error("Error in /liked route:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
);

// Add song to liked songs
router.post(
  "/likedSongs",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { songId } = req.body;

    if (!songId || !mongoose.Types.ObjectId.isValid(songId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid songId." });
    }
    try {
      const user = await User.findById(req.user._id);
      const song = await Song.findById(songId);
      if (!user || !song) {
        return res
          .status(404)
          .json({ success: false, message: "User or song not found." });
      }
      if (!user.likedSongs.includes(songId)) {
        user.likedSongs.push(songId);
        await user.save();
      }
      res
        .status(200)
        .json({ success: true, message: "Song added to liked songs." });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  }
);

module.exports = router;
