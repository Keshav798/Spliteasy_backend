const express=require('express');
const {
    getAllSplits,
    createSplit,
    getSplit,
    updateSplit,
    deleteSplit
}=require("../controllers/splitController");

const router=express.Router();

router.route("/").get(getAllSplits).post(createSplit);

router.route("/:splitId").get(getSplit).put(updateSplit).delete(deleteSplit);

module.exports=router;