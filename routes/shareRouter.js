//share router
const express=require('express');
const {
    getAllShares,
    createShare,
    getShare,
    updateShare,
    deleteShare,
    clearShare
}=require("../controllers/shareController");
const validateToken = require('../middlewares/validateTokenHandler');

const router=express.Router();

router.route("/").get(getAllShares);

router.use(validateToken);

router.route("/").post(createShare);

router.route("/:shareId").get(getShare).put(updateShare).delete(deleteShare);

router.route("/clearShare/:shareId").put(clearShare);

module.exports=router;