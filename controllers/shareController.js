const asyncHandler=require("express-async-handler");
 
const getAllShares = asyncHandler(async (req,res) => {
    res.json({message:"All shares"});
});

const createShare = asyncHandler(async (req,res) => {
    res.json({message:"Created shares"});
});

const getShare = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Share"});
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