//Models:
const User = require('../models/userModel');

//Utilities:
const handleAsync = require('../util/handleAsync');
const throwAppError = require('../util/throwAppError');

//Controller Functions:

//Get all existing Stats:

exports.getAllStoredStats = handleAsync(async (req, res, next) => {
    const { _id, email } = req.user;

    await User.findOne({
        _id: _id,
        email: email,
    }).then((user) => {
        res.status(200).json({
            message: 'Data grabbed successfully',
            userSavedStats: user.userSavedStats,
        });
    });
});

//Edit existing Stat:
exports.editExistingStat = handleAsync(async (req, res, next) => {
    const { exerciseId, newExerciseName } = req.body;
    const { _id, email } = req.user;

    let existingUser = await User.findOne({
        _id: _id,
        email: email,
    });

    const editIndex = existingUser.findExerciseIndex(
        exerciseId,
        existingUser.userSavedStats
    );

    existingUser.userSavedStats[editIndex].exerciseName = newExerciseName;

    //Update the user.

    await User.updateOne(
        { _id: _id, email: email },
        { userSavedStats: existingUser.userSavedStats },
        { bypassDocumentValidation: true },
        (err) => {
            if (err) console.log(err);
        }
    );

    const updatedUser = await User.findOne({ _id: _id, email: email }).select(
        'userSavedStats'
    );

    res.status(200).json({
        message: 'Update Successful',
        userSavedStats: updatedUser.userSavedStats,
    });
});

//Delete existing Stat:
exports.deleteExistingStat = handleAsync(async (req, res, next) => {
    const { exerciseId } = req.body;
    const { _id, email } = req.user;

    let existingUser = await User.findOne({
        _id: _id,
        email: email,
    });

    const delIndex = existingUser.findExerciseIndex(
        exerciseId,
        existingUser.userSavedStats
    );

    //spliced returns an array of the removed element. We will not use this return.
    existingUser.userSavedStats.splice(delIndex, 1);

    //Update the user.

    await User.updateOne(
        { _id: _id, email: email },
        { userSavedStats: existingUser.userSavedStats },
        { bypassDocumentValidation: true },
        (err) => {
            if (err) console.log(err);
        }
    );

    const updatedUser = await User.findOne({ _id: _id, email: email }).select(
        'userSavedStats'
    );

    res.status(200).json({
        message: 'Deletion Successful',
        userSavedStats: updatedUser.userSavedStats,
    });
});

//Add new Stat:

exports.addNewStat = handleAsync(async (req, res, next) => {
    //We'll be extracting details from req.body and req.user.

    const { exerciseName, tutorialStatId } = req.body;
    const { _id, email } = req.user;

    //Find the user's existing stats array based on matching userID and email.

    let userExistingSavedStats = await User.findOne({
        _id: _id,
        email: email,
    }).select('userSavedStats');

    //Push new object created with Schema methods. Check if tutorialStatId is present. We need a known tutorial stat id.

    if (tutorialStatId !== undefined && tutorialStatId !== null) {
        userExistingSavedStats.userSavedStats.push({
            exerciseName: exerciseName,
            dateUpdated: userExistingSavedStats.generateDateNow(),
            exerciseId: tutorialStatId,
            records: [],
        });
    } else {
        userExistingSavedStats.userSavedStats.push({
            exerciseName: exerciseName,
            dateUpdated: userExistingSavedStats.generateDateNow(),
            exerciseId: userExistingSavedStats.generateUuid(),
            records: [],
        });
    }

    //Update the user.

    await User.updateOne(
        { _id: _id, email: email },
        { userSavedStats: userExistingSavedStats.userSavedStats },
        { bypassDocumentValidation: true },
        (err) => {
            if (err) console.log(err);
        }
    );

    //Find and send the updated user.

    const updatedUser = await User.findOne({ _id: _id, email: email }).select(
        'userSavedStats'
    );

    res.status(200).json({
        message: 'Stat has successfully been added.',
        userSavedStats: updatedUser.userSavedStats,
    });
});
