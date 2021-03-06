//Models:
const User = require('../models/userModel');

//Utilities:
const handleAsync = require('../util/handleAsync');
const throwAppError = require('../util/throwAppError');

exports.getIsNewUserValue = handleAsync(async (req, res, next) => {
    const { _id, email } = req.user;

    let existingUser = await User.findOne({
        _id: _id,
        email: email,
    }).select('isNewUser');

    res.status(200).json({
        msg: 'isNewUser value has been successfully changed',
        isNewUserValue: existingUser.isNewUser,
    });
});

exports.setIsNewUserValue = handleAsync(async (req, res, next) => {
    const { _id, email } = req.user;
    const { booleanValue } = req.body;

    let existingUser = await User.findOne({
        _id: _id,
        email: email,
    });

    existingUser['isNewUser'] = booleanValue;

    await User.updateOne(
        { _id: _id, email: email },
        { isNewUser: existingUser.isNewUser },
        { bypassDocumentValidation: true },
        (err) => {
            if (err) console.log(err);
        }
    );

    const updatedUser = await User.findOne({ _id: _id, email: email });

    const { firstName, lastName, userName, isNewUser } = updatedUser;

    res.status(200).json({
        msg: 'isNewUser value has been successfully changed',
        user: {
            firstName,
            lastName,
            userName,
            isNewUser,
            email: updatedUser.email,
        },
    });
});
