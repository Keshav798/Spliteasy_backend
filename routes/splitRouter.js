const express=require('express');
const {
    getAllSplits,
    createSplit,
    getSplit,
    updateSplit,
    deleteSplit,
    addUserToSplit
}=require("../controllers/splitController");

const router=express.Router();

router.route("/").get(getAllSplits).post(createSplit);

router.route("/addUser").post(addUserToSplit);

router.route("/:splitId").get(getSplit).put(updateSplit).delete(deleteSplit);

module.exports=router;