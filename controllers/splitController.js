//split controller
const asyncHandler = require("express-async-handler");
const Split = require('../models/splitModel');
const User = require('../models/userModel');

const getAllSplits = asyncHandler(async (req, res) => {
    const splits = await Split.find({});
    res.status(200).json({ message: "Success", splits: splits });
});

const createSplit = asyncHandler(async (req, res) => {
    const { title, createdBy, users } = req.body;

    if (!title || !createdBy || !users || !Array.isArray(users) || users.length === 0) {
        res.status(400);
        throw new Error("Please provide all required fields: title, createdBy, and a non-empty users array");
    }

    const creator = await User.findOne({ userId: createdBy.toString() });
    if (!creator) {
        res.status(404);
        throw new Error("Creator user not found");
    }

    const userIds = [...new Set(users.map(id => id.toString()))];
    if (!userIds.includes(createdBy.toString())) userIds.push(createdBy.toString());

    const existingUsers = await User.find({ userId: { $in: userIds } });
    if (existingUsers.length !== userIds.length) {
        res.status(404);
        throw new Error("One or more users in the split do not exist");
    }

    const usersWithNames = existingUsers.map(user => ({
        userId: user.userId,
        userName: user.name
    }));

    const split = new Split({
        title,
        createdBy,
        users: usersWithNames
    });

    const savedSplit = await split.save();

    for (const user of usersWithNames) {
        await User.findOneAndUpdate(
            { userId: user.userId },
            {
                $push: {
                    splitList: {
                        splitId: savedSplit.splitId,
                        splitTitle: savedSplit.title,
                        amount: 0
                    }
                }
            }
        );
    }

    res.status(201).json({
        message: "Split created successfully",
        split: savedSplit
    });
});

const getSplit = asyncHandler(async (req, res) => {
    const splitId = req.params.splitId.toString();
    const split = await Split.findOne({ splitId });
    if (!split) {
        res.status(404);
        throw new Error("Split not found");
    }
    res.status(200).json({ message: "Success", split: split });
});

const getStaticSplitData = asyncHandler(async (req, res) => {
    const splitId = req.params.splitId.toString();

    // Find the split document
    const split = await Split.findOne({ splitId });

    if (!split) {
        res.status(404);
        throw new Error("Split not found");
    }

    // Extract title
    const title = split.title;

    // Find the creator's name by matching createdBy with the users' userId
    const createdByUser = split.users.find(user => user.userId.toString() === split.createdBy.toString());
    const createdBy = {
        "name" : createdByUser ? createdByUser.userName : "Unknown",
        "userId" : createdByUser ? createdByUser.userId : "no_id"
    }

    const participants=[];
    for(var user in split.users) participants.push({
        "name":split.users[user].userName,
        "userId":split.users[user].userId
        });

    // Respond with the desired data
    res.status(200).json({
        message: "Success",
        split: {
            title: title,
            createdBy: createdBy,
            participants: participants
        }
    });
});


const updateSplit = asyncHandler(async (req, res) => {
    const id = "test_id_from_req_body";
    res.json({ message: "Update split" });
});

const deleteSplit = asyncHandler(async (req, res) => {
    const id = "test_id_from_req_body";
    res.json({ message: "Deleted split" });
});

const addUserToSplit = asyncHandler(async (req, res) => {
    const { userId, splitId } = req.body;

    const user = await User.findOne({ userId: userId.toString() });
    const split = await Split.findOne({ splitId: splitId.toString() });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (!split) {
        res.status(404);
        throw new Error("Split not found");
    }

    const isUserInSplit = split.users.some(u => u.userId.toString() === userId.toString());
    if (isUserInSplit) {
        res.status(403);
        throw new Error("User is already part of the split");
    }

    split.users.push({
        userId: user.userId,
        userName: user.name,
    });

    user.splitList.push({
        splitId: split.splitId,
        splitTitle: split.title,
        amount: 0,
    });

    await split.save();
    await user.save();

    res.status(200).json({
        message: "User successfully added to the split",
        split,
        user,
    });
});

module.exports = {
    getAllSplits,
    createSplit,
    getSplit,
    updateSplit,
    deleteSplit,
    addUserToSplit,
    getStaticSplitData
};



// const asyncHandler=require("express-async-handler");
// const Split = require('../models/splitModel');
// const User = require('../models/userModel');

// const getAllSplits = asyncHandler(async (req,res) => {
//     const splits = await Split.find({});
//     res.status(200).json({message:"Success", splits:splits});
// });

// const createSplit = asyncHandler(async (req, res) => {
//     const { title, createdBy, users } = req.body;

//     // Validate input
//     if (!title || !createdBy || !users || !Array.isArray(users) || users.length === 0) {
//         res.status(400);
//         throw new Error("Please provide all required fields: title, createdBy, and a non-empty users array");
//     }

//     // Ensure that `createdBy` is a valid user
//     const creator = await User.findOne({ userId: createdBy });
//     if (!creator) {
//         res.status(404);
//         throw new Error("Creator user not found");
//     }

//     // Ensure all provided users exist
//     const userIds = [...new Set(users)]; // Remove duplicates
//     if (!userIds.includes(createdBy)) userIds.push(createdBy); // Ensure creator is included

//     const existingUsers = await User.find({ userId: { $in: userIds } });
//     if (existingUsers.length !== userIds.length) {
//         res.status(404);
//         throw new Error("One or more users in the split do not exist");
//     }

//     // Map users with names from the database
//     const usersWithNames = existingUsers.map(user => ({
//         userId: user.userId,
//         userName: user.name
//     }));

//     // Create the split
//     const split = new Split({
//         title,
//         createdBy,
//         users: usersWithNames
//     });

//     // Save the split
//     const savedSplit = await split.save();

//     // Update each user's `splitList`
//     for (const user of usersWithNames) {
//         await User.findOneAndUpdate(
//             { userId: user.userId },
//             {
//                 $push: {
//                     splitList: {
//                         splitId: savedSplit.splitId,
//                         splitTitle: savedSplit.title,
//                         amount: 0 // Default amount to 0 when creating the split
//                     }
//                 }
//             }
//         );
//     }

//     res.status(201).json({
//         message: "Split created successfully",
//         split: savedSplit
//     });
// });



// const getSplit = asyncHandler(async (req,res) => {
//     const splitId=req.params.splitId;
//     const split = await Split.findOne({splitId:splitId});
//     if(split==null){
//         res.status(404);
//         throw new Error("Split not found");
//     }
//     res.status(200).json({message:"Success", split:split});
// });

// const updateSplit = asyncHandler(async (req,res) => {
//     const id="test_id_from_req_body";
//     res.json({message:"Update split"});
// });

// const deleteSplit = asyncHandler(async (req,res) => {
//     const id="test_id_from_req_body";
//     res.json({message:"Deleted split"});
// });


// const addUserToSplit = asyncHandler(async (req, res) => {
//     const { userId, splitId } = req.body;

//     // Find the user and split
//     const user = await User.findOne({ userId });
//     const split = await Split.findOne({ splitId });

//     if (!user) {
//         res.status(404);
//         throw new Error("User not found");
//     }

//     if (!split) {
//         res.status(404);
//         throw new Error("Split not found");
//     }

//     // Check if the user is already part of the split
//     const isUserInSplit = split.users.some(u => u.userId.toString() === userId);
//     if (isUserInSplit) {
//         res.status(403);
//         throw new Error("User is already part of the split");
//     }

//     // Add user to the split
//     split.users.push({
//         userId: user.userId,
//         userName: user.name,
//     });

//     // Update the user with the split
//     user.splitList.push({
//         splitId: split.splitId,
//         splitTitle: split.title,
//         amount: 0, // New users start with a balance of 0 in the split
//     });

//     // Save changes
//     await split.save();
//     await user.save();

//     res.status(200).json({
//         message: "User successfully added to the split",
//         split,
//         user,
//     });
// });

// module.exports={
//     getAllSplits,
//     createSplit,
//     getSplit,
//     updateSplit,
//     deleteSplit,
//     addUserToSplit
// }