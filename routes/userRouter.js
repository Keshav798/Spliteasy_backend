const express=require('express');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    addFriend
}=require("../controllers/userController");

const router=express.Router();

router.route("/").get(getAllUsers).post(createUser);

router.route("/:userId").get(getUser).put(updateUser).delete(deleteUser);

router.route("/:userId/friends/:friendId").put(addFriend);

module.exports=router;