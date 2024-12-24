const Split = require('../models/splitModel');
const User = require('../models/userModel'); 
const Share = require('../models/shareModel');

const revertAmounts = async (share) => {
    const { userPrimaryId, userSecondaryId, amount, split } = share;

    console.log('Received Share Object:', share);

    // Fetch primary and secondary users
    const primaryUser = await User.findOne({ userId: userPrimaryId });
    const secondaryUser = await User.findOne({ userId: userSecondaryId });

    if (!primaryUser) {
        console.error(`Primary user not found. User ID: ${userPrimaryId}`);
        throw new Error("Primary user not found");
    }
    if (!secondaryUser) {
        console.error(`Secondary user not found. User ID: ${userSecondaryId}`);
        throw new Error("Secondary user not found");
    }

    console.log('Fetched Primary User:', primaryUser);
    console.log('Fetched Secondary User:', secondaryUser);

    const splitId = split.splitId.toString(); // Ensure splitId is a string
    console.log('Split ID:', splitId);

    // Atomic updates for primary and secondary users' balances
    if (amount > 0) {
        // Fetch and calculate updated amount for primary user
        const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        console.log('Primary Split Entry:', primarySplitEntry);

        if (!primarySplitEntry) {
            console.error(`Primary split entry not found. User ID: ${userPrimaryId}, Split ID: ${splitId}`);
            throw new Error("Primary split entry not found");
        }

        const primaryUpdatedAmount = primarySplitEntry.amount - amount;

        await User.findOneAndUpdate(
            { userId: userPrimaryId, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": primaryUpdatedAmount },
                $inc: { totalLended: -amount }
            }
        );

        // Fetch and calculate updated amount for secondary user
        const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        console.log('Secondary Split Entry:', secondarySplitEntry);

        if (!secondarySplitEntry) {
            console.error(`Secondary split entry not found. User ID: ${userSecondaryId}, Split ID: ${splitId}`);
            throw new Error("Secondary split entry not found");
        }

        const secondaryUpdatedAmount = secondarySplitEntry.amount + amount;

        await User.findOneAndUpdate(
            { userId: userSecondaryId, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": secondaryUpdatedAmount },
                $inc: { totalOwed: +amount }
            }
        );
    } else {
        // Fetch and calculate updated amount for primary user
        const primarySplitEntry = primaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        console.log('Primary Split Entry:', primarySplitEntry);

        if (!primarySplitEntry) {
            console.error(`Primary split entry not found. User ID: ${userPrimaryId}, Split ID: ${splitId}`);
            throw new Error("Primary split entry not found");
        }

        const primaryUpdatedAmount = primarySplitEntry.amount - amount;

        await User.findOneAndUpdate(
            { userId: userPrimaryId, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": primaryUpdatedAmount },
                $inc: { totalOwed: -amount }
            }
        );

        // Fetch and calculate updated amount for secondary user
        const secondarySplitEntry = secondaryUser.splitList.find(entry => entry.splitId.toString() === splitId);
        console.log('Secondary Split Entry:', secondarySplitEntry);

        if (!secondarySplitEntry) {
            console.error(`Secondary split entry not found. User ID: ${userSecondaryId}, Split ID: ${splitId}`);
            throw new Error("Secondary split entry not found");
        }

        const secondaryUpdatedAmount = secondarySplitEntry.amount + amount;

        await User.findOneAndUpdate(
            { userId: userSecondaryId, "splitList.splitId": splitId },
            {
                $set: { "splitList.$.amount": secondaryUpdatedAmount },
                $inc: { totalLended: +amount }
            }
        );
    }

    // Update friend lists atomically if users are already friends
    const primaryFriendIndex = primaryUser.friendList.findIndex(f => f.userId.toString() === userSecondaryId.toString());
    console.log('Primary Friend Index:', primaryFriendIndex);

    if (primaryFriendIndex > -1) {
        await User.findOneAndUpdate(
            { userId: userPrimaryId, "friendList.userId": userSecondaryId },
            {
                $inc: { "friendList.$.amount": -amount }
            }
        );
    } else {
        console.warn(`Primary user (${userPrimaryId}) is not friends with secondary user (${userSecondaryId}).`);
    }

    const secondaryFriendIndex = secondaryUser.friendList.findIndex(f => f.userId.toString() === userPrimaryId.toString());
    console.log('Secondary Friend Index:', secondaryFriendIndex);

    if (secondaryFriendIndex > -1) {
        await User.findOneAndUpdate(
            { userId: userSecondaryId, "friendList.userId": userPrimaryId },
            {
                $inc: { "friendList.$.amount": amount }
            }
        );
    } else {
        console.warn(`Secondary user (${userSecondaryId}) is not friends with primary user (${userPrimaryId}).`);
    }
};

module.exports = revertAmounts;
