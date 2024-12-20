// User.js
const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."]
  },
  password: {
    type: String,
    required: true
  },
  totalOwed: {
    type: Number,
    default: 0
  },
  totalLended: {
    type: Number,
    default: 0
  },
  SplitList: [
    {
      splitId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Split",
        required: true
      },
      splitTitle: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        default: 0
      }
    }
  ],
  friendList: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      name: {
        type: String,
        required: true
      },
      amount: {
        type: Number,
        default: 0
      },
      ShareList: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Share"
        }
      ]
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model("User", UserSchema);