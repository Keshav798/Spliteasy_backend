//user controller
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const User = require('../models/userModel');
const Share = require('../models/shareModel');
const jwt = require('jsonwebtoken');

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.status(200).json({ message: "Success", users: users });
});

const createUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are Mandatory(name, email, password)");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name: name,
        email: email,
        password: hashedPassword,
    });

    res.status(201).json({ message: "Success", user });
});

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error("All fields are Mandatory(email, password)");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error("User Not Registered!");
    }

    // Compare password with Hashed Password
    if (user && (await bcrypt.compare(password, user.password))) {
        const accessToken = jwt.sign({
            user: {
                name: user.name,
                email: user.email,
                userId: user.userId
            },
        },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30d" }
        )
        res.status(200).json({ message: "User Logged In Successfully!", accessToken, userId : user.userId });
    } else {
        res.status(401);
        throw new Error("Email or Password is not incorrect!")
    }
});

const getUser = asyncHandler(async (req, res) => {
    const userId = req.params.userId.toString();
    const user = await User.findOne({ userId });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json({ message: "Success", user: user });
});

const updateUser = asyncHandler(async (req, res) => {
    const id = "test_id_from_req_body";
    res.json({ message: "Update user" });
});

const deleteUser = asyncHandler(async (req, res) => {
    const id = "test_id_from_req_body";
    res.json({ message: "Deleted user" });
});

const addFriend = asyncHandler(async (req, res) => {
    const userId = req.params.userId.toString();
    const friendId = req.params.friendId.toString();

    const user = await User.findOne({ userId });
    const friend = await User.findOne({ userId: friendId });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }
    if (!friend) {
        res.status(404);
        throw new Error("Friend not found");
    }
    if (userId === friendId) {
        res.status(403);
        throw new Error("User and friend IDs are the same");
    }

    const userHasFriend = user.friendList.some(f => f.userId.toString() === friendId);
    const friendHasUser = friend.friendList.some(f => f.userId.toString() === userId);

    if (userHasFriend || friendHasUser) {
        res.status(403);
        throw new Error("Friend already exists in the friend list");
    }

    const shares = await Share.find({
        $or: [
            { "userPrimary.userId": userId, "userSecondary.userId": friendId },
            { "userPrimary.userId": friendId, "userSecondary.userId": userId }
        ]
    });

    let totalAmount = 0;
    const shareIds = [];

    shares.forEach(share => {
        shareIds.push(share.shareId);
        if (share.userPrimary.userId.toString() === userId) {
            totalAmount += share.amount;
        } else if (share.userPrimary.userId.toString() === friendId) {
            totalAmount -= share.amount;
        }
    });

    user.friendList.push({
        userId: friendId,
        name: friend.name,
        amount: totalAmount,
        shareList: shareIds
    });

    friend.friendList.push({
        userId: userId,
        name: user.name,
        amount: -totalAmount,
        shareList: shareIds
    });

    await user.save();
    await friend.save();

    res.status(200).json({
        message: "Success",
        user: {
            userId: user.userId,
            name: user.name,
            friendList: user.friendList
        },
        friend: {
            userId: friend.userId,
            name: friend.name,
            friendList: friend.friendList
        }
    });
});

module.exports = {
    getAllUsers,
    createUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser,
    addFriend
};



// const asyncHandler=require("express-async-handler");
// const bcrypt=require("bcrypt");
// const User = require('../models/userModel'); 
// const Share = require('../models/shareModel'); 

// const getAllUsers = asyncHandler(async (req,res) => {
//     const users = await User.find({});
//     res.status(200).json({message:"Success", users:users});
// });

// const createUser = asyncHandler(async (req,res) => {

//     const { name, email, password } = req.body;
//     if (!name || !email || !password) {
//         res.status(400);
//         throw new Error("All fields are Mandatory(name, email, password)")
//     }

//     const hashedPassword=await bcrypt.hash(password,10);

//     const user = await User.create({
//         name:name,
//         email:email,
//         password:hashedPassword,
//     })

//     res.status(201).json({ message: "Success", user });
// });

// const getUser = asyncHandler(async (req,res) => {
//     const userId=req.params.userId;
//     const user = await User.findOne({userId:userId});
//     if(user==null){
//         res.status(404);
//         throw new Error("User not found");
//     }
//     res.status(200).json({message:"Success", user:user});
// });

// const updateUser = asyncHandler(async (req,res) => {
//     const id="test_id_from_req_body";
//     res.json({message:"Update user"});
// });

// const deleteUser = asyncHandler(async (req,res) => {
//     const id="test_id_from_req_body";
//     res.json({message:"Deleted user"});
// });

// const addFriend = asyncHandler(async (req, res) => {
//     const userId = req.params.userId;
//     const friendId = req.params.friendId;

//     const user = await User.findOne({ userId: userId });
//     const friend = await User.findOne({ userId: friendId });

//     if (!user) {
//         res.status(404);
//         throw new Error("User not found");
//     }
//     if (!friend) {
//         res.status(404);
//         throw new Error("Friend not found");
//     }
//     if (userId === friendId) {
//         res.status(403);
//         throw new Error("User and friend IDs are the same");
//     }

//     // Check if the friend already exists in the user's friendList
//     const userHasFriend = user.friendList.some(f => f.userId.toString() === friendId);
//     const friendHasUser = friend.friendList.some(f => f.userId.toString() === userId);

//     if (userHasFriend || friendHasUser) {
//         res.status(403);
//         throw new Error("Friend already exists in the friend list");
//     }

//     // Find common shares between user and friend
//     const shares = await Share.find({
//         $or: [
//             { userPrimary: userId, userSecondary: friendId },
//             { userPrimary: friendId, userSecondary: userId }
//         ]
//     });

//     // Calculate the total owed/lended amount (default to 0 if no shares found)
//     let totalAmount = 0;
//     const shareIds = [];

//     shares.forEach(share => {
//         shareIds.push(share.shareId);
//         if (share.userPrimary.toString() === userId) {
//             totalAmount += share.amount; // Amount owed by user to friend
//         } else if (share.userPrimary.toString() === friendId) {
//             totalAmount -= share.amount; // Amount owed by friend to user
//         }
//     });

//     // Add each other to their friendLists
//     user.friendList.push({
//         userId: friendId,
//         name: friend.name,
//         amount: totalAmount,
//         shareList: shareIds
//     });

//     friend.friendList.push({
//         userId: userId,
//         name: user.name,
//         amount: -totalAmount, // Opposite for the friend
//         shareList: shareIds
//     });

//     // Save the updates
//     await user.save();
//     await friend.save();

//     res.status(200).json({
//         message: "Success",
//         user: {
//             userId: user.userId,
//             name:user.name,
//             friendList: user.friendList
//         },
//         friend: {
//             userId: friend.userId,
//             name:friend.name,
//             friendList: friend.friendList
//         }
//     });
// });


// module.exports={
//     getAllUsers,
//     createUser,
//     getUser,
//     updateUser,
//     deleteUser,
//     addFriend
// }