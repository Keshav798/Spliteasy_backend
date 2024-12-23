const asyncHandler=require("express-async-handler");
const Split = require('../models/splitModel');
const User = require('../models/userModel'); 
const Share = require('../models/shareModel');
 
const getAllShares = asyncHandler(async (req,res) => {
    const shares = await Share.find({});
    res.status(200).json({message:"Success", shares:shares});
});

const createShare = asyncHandler(async (req, res) => {
    const { title,userPrimary, userSecondary, amount, splitId } = req.body;

    // Validate input
    if (!title || !userPrimary || !userSecondary || !amount || !splitId) {
        res.status(400);
        throw new Error("Please provide all required fields: title, userPrimary, userSecondary, amount, and split information.");
    }

    if (amount === 0) {
        res.status(400);
        throw new Error("Amount must be non-zero");
    }

    // Fetch primary and secondary users
    const primaryUser = await User.findOne({ userId: userPrimary });
    const secondaryUser = await User.findOne({ userId: userSecondary });
    const splitRecord = await Split.findOne({ splitId: splitId });

    if (!primaryUser || !secondaryUser) {
        res.status(404);
        throw new Error("One or both users not found");
    }

    if (!splitRecord) {
        res.status(404);
        throw new Error("Split not found");
    }

    // Check if both users are part of the split
    const isPrimaryInSplit = splitRecord.users.some(user => user.userId.toString() === userPrimary);
    const isSecondaryInSplit = splitRecord.users.some(user => user.userId.toString() === userSecondary);

    if (!isPrimaryInSplit || !isSecondaryInSplit) {
        res.status(400);
        throw new Error("Both primary and secondary users must be part of the specified split.");
    }

    // Create the share
    const newShare = new Share({
        title,
        userPrimary,
        userSecondary,
        amount,
        split: {
            splitName: splitRecord.title,
            splitId: splitId
        }
    });

    const savedShare = await newShare.save();

    // Update split's shares list
    await Split.findOneAndUpdate(
        { splitId: splitId },
        { $push: { shares: savedShare.shareId } }
    );

    // Atomic updates for primary and secondary users' balances
    if (amount > 0) {
        // Fetch and calculate updated amount for primary user
        const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        const primaryUpdatedAmount = (primarySplitEntry ? primarySplitEntry.amount : 0) + amount;

        await User.findOneAndUpdate(
            { userId: userPrimary, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": primaryUpdatedAmount },
                $inc: { totalLended: amount }
            }
        );

        // Fetch and calculate updated amount for secondary user
        const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        const secondaryUpdatedAmount = (secondarySplitEntry ? secondarySplitEntry.amount : 0) - amount;

        await User.findOneAndUpdate(
            { userId: userSecondary, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": secondaryUpdatedAmount },
                $inc: { totalOwed: -amount }
            }
        );
    } else {
        // Fetch and calculate updated amount for primary user
        const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        const primaryUpdatedAmount = (primarySplitEntry ? primarySplitEntry.amount : 0) + amount;

        await User.findOneAndUpdate(
            { userId: userPrimary, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": primaryUpdatedAmount },
                $inc: { totalOwed: amount }
            }
        );

        // Fetch and calculate updated amount for secondary user
        const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        const secondaryUpdatedAmount = (secondarySplitEntry ? secondarySplitEntry.amount : 0) - amount;

        await User.findOneAndUpdate(
            { userId: userSecondary, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": secondaryUpdatedAmount },
                $inc: { totalLended: -amount }
            }
        );
    }

    // Update friend lists atomically if users are already friends
    const primaryFriendIndex = primaryUser.friendList.findIndex(f => f.userId.toString() === userSecondary);
    const secondaryFriendIndex = secondaryUser.friendList.findIndex(f => f.userId.toString() === userPrimary);

    if (primaryFriendIndex > -1) {
        await User.findOneAndUpdate(
            { userId: userPrimary, "friendList.userId": userSecondary },
            {
                $inc: { "friendList.$.amount": amount },
                $push: { "friendList.$.shareList": savedShare.shareId }
            }
        );
    }

    if (secondaryFriendIndex > -1) {
        await User.findOneAndUpdate(
            { userId: userSecondary, "friendList.userId": userPrimary },
            {
                $inc: { "friendList.$.amount": -amount },
                $push: { "friendList.$.shareList": savedShare.shareId }
            }
        );
    }

    res.status(201).json({
        message: "Share created successfully",
        share: savedShare
    });
});



const getShare = asyncHandler(async (req,res) => {
    const shareId=req.params.shareId;
    const share = await Share.findOne({shareId:shareId});
    if(share==null){
        res.status(404);
        throw new Error("Share not found");
    }
    res.status(200).json({message:"Success", share:share});
});

const updateShare = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Update share"});
});

const deleteShare = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Deleted share"});
});

module.exports={
    getAllShares,
    createShare,
    getShare,
    updateShare,
    deleteShare
}