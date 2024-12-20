const asyncHandler=require("express-async-handler");
const User = require('../models/userModel') 

const getAllUsers = asyncHandler(async (req,res) => {
    const users = await User.find({});
    res.json({message:"All users", users:users});
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

    res.status(201).json({ message: "Created User", user });
});

const getUser = asyncHandler(async (req,res) => {
    const userId=req.params.userId;
    const user = await User.findOne({userId:userId});
    res.json({message:"Users", user:user});
});

const updateUser = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Update user"});
});

const deleteUser = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Deleted user"});
});

module.exports={
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser
}