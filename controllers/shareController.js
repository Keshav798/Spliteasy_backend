//share controller
const asyncHandler = require("express-async-handler");
const Split = require("../models/splitModel");
const User = require("../models/userModel");
const Share = require("../models/shareModel");
const revertAmounts = require("../utils/revertAmounts");

const getAllShares = asyncHandler(async (req, res) => {
    const shares = await Share.find({});
    res.status(200).json({ message: "Success", shares: shares });
});

const createShare = asyncHandler(async (req, res) => {
    const { title, userPrimaryId, userSecondaryId, amount, splitId } = req.body;

    if (!title || !userPrimaryId || !userSecondaryId || !amount || !splitId) {
        res.status(400);
        throw new Error("Please provide all required fields: title, userPrimaryId, userSecondaryId, amount, and split information.");
    }

    if (amount === 0) {
        res.status(400);
        throw new Error("Amount must be non-zero");
    }

    const primaryUser = await User.findOne({ userId: userPrimaryId });
    const secondaryUser = await User.findOne({ userId: userSecondaryId });
    const splitRecord = await Split.findOne({ splitId: splitId });

    if (!primaryUser || !secondaryUser) {
        res.status(404);
        throw new Error("One or both users not found");
    }

    if (!splitRecord) {
        res.status(404);
        throw new Error("Split not found");
    }

    const isPrimaryInSplit = splitRecord.users.some(user => user.userId.toString() === userPrimaryId.toString());
    const isSecondaryInSplit = splitRecord.users.some(user => user.userId.toString() === userSecondaryId.toString());

    if (!isPrimaryInSplit || !isSecondaryInSplit) {
        res.status(400);
        throw new Error("Both primary and secondary users must be part of the specified split.");
    }

    const newShare = new Share({
        title,
        userPrimary: {
            userId: userPrimaryId,
            userName: primaryUser.name
        },
        userSecondary: {
            userId: userSecondaryId,
            userName: secondaryUser.name
        },
        amount,
        split: {
            splitName: splitRecord.title,
            splitId: splitId
        }
    });

    const savedShare = await newShare.save();

    await Split.findOneAndUpdate(
        { splitId: splitId },
        { $push: { shares: savedShare.shareId } }
    );

    const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId.toString());
    const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId.toString());

    const primaryUpdatedAmount = (primarySplitEntry ? primarySplitEntry.amount : 0) + amount;
    const secondaryUpdatedAmount = (secondarySplitEntry ? secondarySplitEntry.amount : 0) - amount;

    await User.findOneAndUpdate(
        { userId: userPrimaryId, "splitList.splitId": splitId },
        {
            $set: { "splitList.$.amount": primaryUpdatedAmount },
            $inc: amount > 0 ? { totalLended: amount } : { totalOwed: amount }
        }
    );

    await User.findOneAndUpdate(
        { userId: userSecondaryId, "splitList.splitId": splitId },
        {
            $set: { "splitList.$.amount": secondaryUpdatedAmount },
            $inc: amount > 0 ? { totalOwed: -amount } : { totalLended: -amount }
        }
    );

    const primaryFriendIndex = primaryUser.friendList.findIndex(f => f.userId.toString() === userSecondaryId.toString());
    const secondaryFriendIndex = secondaryUser.friendList.findIndex(f => f.userId.toString() === userPrimaryId.toString());

    if (primaryFriendIndex > -1) {
        await User.findOneAndUpdate(
            { userId: userPrimaryId, "friendList.userId": userSecondaryId },
            {
                $inc: { "friendList.$.amount": amount },
                $push: { "friendList.$.shareList": savedShare.shareId }
            }
        );
    }

    if (secondaryFriendIndex > -1) {
        await User.findOneAndUpdate(
            { userId: userSecondaryId, "friendList.userId": userPrimaryId },
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

const getShare = asyncHandler(async (req, res) => {
    const shareId = req.params.shareId;
    const share = await Share.findOne({ shareId: shareId });
    if (!share) {
        res.status(404);
        throw new Error("Share not found");
    }
    res.status(200).json({ message: "Success", share: share });
});

const updateShare = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Update share"});
});

const clearShare = asyncHandler(async (req, res) => {
    const { shareId } = req.params;
    const share = await Share.findOne({ shareId });

    if (!share) {
        res.status(404);
        throw new Error("Share not found");
    }

    if (share.isCleared) {
        res.status(403);
        throw new Error("Share already cleared");
    }

    await revertAmounts({
        userPrimaryId: share.userPrimary.userId,
        userSecondaryId: share.userSecondary.userId,
        amount: share.amount,
        split: share.split
    });

    await Share.findOneAndUpdate(
        { shareId },
        { $set: { isCleared: true } }
    );

    res.status(200).json({ message: "Share cleared successfully" });
});

const deleteShare = asyncHandler(async (req, res) => {
    const { shareId } = req.params;
    const share = await Share.findOne({ shareId });

    if (!share) {
        res.status(404);
        throw new Error("Share not found");
    }

    if (!share.isCleared) {
        await revertAmounts({
            userPrimaryId: share.userPrimary.userId,
            userSecondaryId: share.userSecondary.userId,
            amount: share.amount,
            split: share.split
        });
    }

    await Split.findOneAndUpdate(
        { splitId: share.split.splitId },
        { $pull: { shares: shareId } }
    );

    await User.updateMany(
        { "friendList.shareList": shareId },
        { $pull: { "friendList.$.shareList": shareId } }
    );

    await Share.deleteOne({ shareId });

    res.status(200).json({ message: "Share deleted successfully" });
});

module.exports = {
    getAllShares,
    createShare,
    getShare,
    updateShare,
    clearShare,
    deleteShare
};


// const asyncHandler=require("express-async-handler");
// const Split = require('../models/splitModel');
// const User = require('../models/userModel'); 
// const Share = require('../models/shareModel');
// const revertAmounts = require("../utils/revertAmounts");
 
// const getAllShares = asyncHandler(async (req,res) => {
//     const shares = await Share.find({});
//     res.status(200).json({message:"Success", shares:shares});
// });

// const createShare = asyncHandler(async (req, res) => {
//     const { title,userPrimaryId, userSecondaryId, amount, splitId } = req.body;

//     // Validate input
//     if (!title || !userPrimaryId || !userSecondaryId || !amount || !splitId) {
//         res.status(400);
//         throw new Error("Please provide all required fields: title, userPrimaryId, userSecondaryId, amount, and split information.");
//     }

//     if (amount === 0) {
//         res.status(400);
//         throw new Error("Amount must be non-zero");
//     }

//     // Fetch primary and secondary users
//     const primaryUser = await User.findOne({ userId: userPrimaryId });
//     const secondaryUser = await User.findOne({ userId: userSecondaryId });
//     const splitRecord = await Split.findOne({ splitId: splitId });

//     if (!primaryUser || !secondaryUser) {
//         res.status(404);
//         throw new Error("One or both users not found");
//     }

//     if (!splitRecord) {
//         res.status(404);
//         throw new Error("Split not found");
//     }

//     // Check if both users are part of the split
//     const isPrimaryInSplit = splitRecord.users.some(user => user.userId.toString() === userPrimaryId);
//     const isSecondaryInSplit = splitRecord.users.some(user => user.userId.toString() === userSecondaryId);

//     if (!isPrimaryInSplit || !isSecondaryInSplit) {
//         res.status(400);
//         throw new Error("Both primary and secondary users must be part of the specified split.");
//     }

//     // Create the share
//     const newShare = new Share({
//         title,
//         userPrimary : {
//             userId : userPrimaryId,
//             userName:primaryUser.name
//         },
//         userSecondary : {
//             userId : userSecondaryId,
//             userName:secondaryUser.name
//         },
//         amount,
//         split: {
//             splitName: splitRecord.title,
//             splitId: splitId
//         }
//     });

//     const savedShare = await newShare.save();

//     // Update split's shares list
//     await Split.findOneAndUpdate(
//         { splitId: splitId },
//         { $push: { shares: savedShare.shareId } }
//     );

//     // Atomic updates for primary and secondary users' balances
//     if (amount > 0) {
//         // Fetch and calculate updated amount for primary user
//         const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
//         const primaryUpdatedAmount = (primarySplitEntry ? primarySplitEntry.amount : 0) + amount;

//         await User.findOneAndUpdate(
//             { userId: userPrimaryId, "splitList.splitId": splitId },
//             {
//                 $set: { "splitList.$.amount": primaryUpdatedAmount },
//                 $inc: { totalLended: amount }
//             }
//         );

//         // Fetch and calculate updated amount for secondary user
//         const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
//         const secondaryUpdatedAmount = (secondarySplitEntry ? secondarySplitEntry.amount : 0) - amount;

//         await User.findOneAndUpdate(
//             { userId: userSecondaryId, "splitList.splitId": splitId },
//             {
//                 $set: { "splitList.$.amount": secondaryUpdatedAmount },
//                 $inc: { totalOwed: -amount }
//             }
//         );
//     } else {
//         // Fetch and calculate updated amount for primary user
//         const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
//         const primaryUpdatedAmount = (primarySplitEntry ? primarySplitEntry.amount : 0) + amount;

//         await User.findOneAndUpdate(
//             { userId: userPrimaryId, "splitList.splitId": splitId },
//             {
//                 $set: { "splitList.$.amount": primaryUpdatedAmount },
//                 $inc: { totalOwed: amount }
//             }
//         );

//         // Fetch and calculate updated amount for secondary user
//         const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
//         const secondaryUpdatedAmount = (secondarySplitEntry ? secondarySplitEntry.amount : 0) - amount;

//         await User.findOneAndUpdate(
//             { userId: userSecondaryId, "splitList.splitId": splitId },
//             {
//                 $set: { "splitList.$.amount": secondaryUpdatedAmount },
//                 $inc: { totalLended: -amount }
//             }
//         );
//     }

//     // Update friend lists atomically if users are already friends
//     const primaryFriendIndex = primaryUser.friendList.findIndex(f => f.userId.toString() === userSecondaryId);
//     const secondaryFriendIndex = secondaryUser.friendList.findIndex(f => f.userId.toString() === userPrimaryId);

//     if (primaryFriendIndex > -1) {
//         await User.findOneAndUpdate(
//             { userId: userPrimaryId, "friendList.userId": userSecondaryId },
//             {
//                 $inc: { "friendList.$.amount": amount },
//                 $push: { "friendList.$.shareList": savedShare.shareId }
//             }
//         );
//     }

//     if (secondaryFriendIndex > -1) {
//         await User.findOneAndUpdate(
//             { userId: userSecondaryId, "friendList.userId": userPrimaryId },
//             {
//                 $inc: { "friendList.$.amount": -amount },
//                 $push: { "friendList.$.shareList": savedShare.shareId }
//             }
//         );
//     }

//     res.status(201).json({
//         message: "Share created successfully",
//         share: savedShare
//     });
// });



// const getShare = asyncHandler(async (req,res) => {
//     const shareId=req.params.shareId;
//     const share = await Share.findOne({shareId:shareId});
//     if(share==null){
//         res.status(404);
//         throw new Error("Share not found");
//     }
//     res.status(200).json({message:"Success", share:share});
// });

// const updateShare = asyncHandler(async (req,res) => {
//     const id="test_id_from_req_body";
//     res.json({message:"Update share"});
// });

// const clearShare = asyncHandler(async (req, res) => {
//     const { shareId } = req.params;

//     // Find the share
//     const share = await Share.findOne({ shareId });
//     if (!share) {
//         res.status(404);
//         throw new Error("Share not found");
//     }

//     if(share.isCleared){
//         res.status(403);
//         throw new Error("Share already cleared");
//     }

//     // Revert amounts
//     await revertAmounts({ userPrimaryId:share.userPrimary.userId, userSecondaryId:share.userSecondary.userId, amount:share.amount, split:share.split });
//     // await revertAmounts(share);

//     // Mark share as cleared
//     await Share.findOneAndUpdate(
//         { shareId },
//         { $set: { isCleared: true } }
//     );

//     res.status(200).json({ message: "Share cleared successfully" });
// });


// const deleteShare = asyncHandler(async (req, res) => {
//     const { shareId } = req.params;

//     // Find the share
//     const share = await Share.findOne({ shareId });
//     if (!share) {
//         res.status(404);
//         throw new Error("Share not found");
//     }

//     // Revert amounts
//     if(!share.isCleared) await revertAmounts({ userPrimaryId:share.userPrimary.userId, userSecondaryId:share.userSecondary.userId, amount:share.amount, split:share.split });

//     // Remove share from split's share list
//     await Split.findOneAndUpdate(
//         { splitId: share.split.splitId },
//         { $pull: { shares: shareId } }
//     );

//     // Remove share from users' friend lists if they are friends
//     await User.updateMany(
//         { "friendList.shareList": shareId },
//         { $pull: { "friendList.$.shareList": shareId } }
//     );

//     // Delete the share
//     await Share.deleteOne({ shareId });

//     res.status(200).json({ message: "Share deleted successfully" });
// });


// module.exports={
//     getAllShares,
//     createShare,
//     getShare,
//     updateShare,
//     deleteShare,
//     clearShare
// }