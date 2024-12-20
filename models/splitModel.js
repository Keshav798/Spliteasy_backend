// Split.js
const mongoose = require('mongoose');

const SplitSchema = mongoose.Schema({
  splitId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  users: [
    {
      userName: {
        type: String,
        required: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      }
    }
  ],
  shares: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Share"
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("Split", SplitSchema);