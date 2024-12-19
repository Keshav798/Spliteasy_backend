const asyncHandler=require("express-async-handler");

const getAllSplits = asyncHandler(async (req,res) => {
    res.json({message:"All splits"});
});

const createSplit = asyncHandler(async (req,res) => {
    res.json({message:"Created splits"});
});

const getSplit = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Split"});
});

const updateSplit = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Update split"});
});

const deleteSplit = asyncHandler(async (req,res) => {
    const id="test_id_from_req_body";
    res.json({message:"Deleted split"});
});

module.exports={
    getAllSplits,
    createSplit,
    getSplit,
    updateSplit,
    deleteSplit
}