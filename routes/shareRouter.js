const express=require('express');
const {
    getAllShares,
    createShare,
    getShare,
    updateShare,
    deleteShare
}=require("../controllers/shareController");

const router=express.Router();

router.route("/").get(getAllShares).post(createShare);

router.route("/:shareId").get(getShare).put(updateShare).delete(deleteShare);

module.exports=router;