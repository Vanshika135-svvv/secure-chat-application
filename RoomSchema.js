// const mongoose = require("mongoose");
// var room_schema = new mongoose.Schema({
//   name: String,
//   secretKey: String,
// });

// var Room = mongoose.model("room", room_schema);

// module.exports = Room;

// // "cybersec12345"
// // "algo12345"
// // "ds12345"
// // "os12345"
// //"ai12345"
// // "se12345"
const mongoose = require("mongoose");

// Create schema for Chat Room
const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,     // No duplicate room name
    trim: true
  },

  secretKey: {
    type: String,
    required: true    // Stored as bcrypt-hash in DB
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Export model
module.exports = mongoose.model("Room", RoomSchema);
