// Share.js
const mongoose = require('mongoose');
 
const ShareSchema = mongoose.Schema({
  shareId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true
  },
  isCleared: {
    type: Boolean,
    default: false
  },
  userPrimary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userSecondary: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  splits : [
    {
      splitName: {
        type: String,
        required: true
      },
      splitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Split",
        required: true
      }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("Share", ShareSchema);
