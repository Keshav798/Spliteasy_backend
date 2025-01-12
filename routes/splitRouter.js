const express=require('express');
const {
    getAllSplits,
    createSplit,
    getSplit,
    updateSplit,
    deleteSplit,
    addUserToSplit,
    getStaticSplitData
}=require("../controllers/splitController");
const validateToken = require('../middlewares/validateTokenHandler');

const router=express.Router();

router.route("/").get(getAllSplits);

router.use(validateToken);

router.route("/").post(createSplit);

router.route("/addUser").post(addUserToSplit);

router.route("/:splitId").get(getSplit).put(updateSplit).delete(deleteSplit);

router.route("/:splitId/static").get(getStaticSplitData);

module.exports=router;