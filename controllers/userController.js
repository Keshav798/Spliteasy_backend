const asyncHandler=require("express-async-handler");
const User = require('../models/userModel') 

const getAllUsers = asyncHandler(async (req,res) => {
    const users = await User.find({});
    res.status(200).json({message:"Succes", users:users});
});

const createUser = asyncHandler(async (req,res) => {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("All fields are Mandatory(name, email, password)")
    }

    const user = await User.create({
        name:name,
        email:email,
        password:password,
    })

    res.status(201).json({ message: "Success", user });
});

const getUser = asyncHandler(async (req,res) => {
    const userId=req.params.userId;
    const user = await User.findOne({userId:userId});
    if(user==null){
        res.status(404);
        throw new Error("User not found");
    }
    res.status(200).json({message:"Succes", user:user});
});

const updateUser = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Update user"});
});

const deleteUser = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Deleted user"});
});

const addFriend = asyncHandler(async (req,res) => {
    const userId=req.params.userId;
    const friendId=req.params.friendId;
    const user = await User.findOne({userId:userId});
    const friend = await User.findOne({userId:friendId});
    if(user==null){
        res.status(404);
        throw new Error("User not found");
    }
    if(friend==null){
        res.status(404);
        throw new Error("Friend not found");
    }
    if(userId==friendId){
        res.status(403);
        throw new Error("User and friend ids are same");
    }
     // Check if the friend already exists in the user's friendList
    const userHasFriend = user.friendList.some(f => f.userId.toString() === friendId);
    const friendHasUser = friend.friendList.some(f => f.userId.toString() === userId);

    if (userHasFriend || friendHasUser) {
        res.status(403);
        throw new Error("Friend already exists in the friend list");
    }

    user.friendList.push({
        userId:friendId,
        name:friend.name,
        amount:0,
        shareList:[]
    });

    friend.friendList.push({
        userId:userId,
        name:user.name,
        amount:0,
        shareList:[]
    });

    await User.findOneAndUpdate({userId:userId},user);
    await User.findOneAndUpdate({userId:friendId},friend);

    res.status(200).json({message:"Success",user:user,friend,friend});
});

module.exports={
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    addFriend
}