const express=require('express');
const {
    getAllUsers,
    createUser,
    loginUser,
    getUser,
    updateUser,
    deleteUser,
    addFriend,
    getUserShares
}=require("../controllers/userController");
const validateToken = require('../middlewares/validateTokenHandler');

const router=express.Router();

router.route("/").get(getAllUsers).post(createUser);

router.route("/login").post(loginUser);

router.use(validateToken);

router.route("/:userId").get(getUser).put(updateUser).delete(deleteUser);

router.route("/:userId/friends/:friendId").put(addFriend);

router.route("/:userId/shares").get(getUserShares);

module.exports=router;