const asyncHandler=require("express-async-handler");
 
const getAllUsers = asyncHandler(async (req,res) => {
    res.json({message:"All users"});
});

const createUser = asyncHandler(async (req,res) => {
    res.json({message:"Created users"});
});

const getUser = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"User"});
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