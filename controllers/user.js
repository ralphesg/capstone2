// [SECTION] Dependencies and Modules

const bcrypt = require('bcrypt');
const User = require("../models/User.js");
// Importing auth.js
const auth = require("../auth.js");
const { errorHandler } = auth;
const mongoose = require('mongoose');


module.exports.getProfile = (req, res) => {
	
	return User.findById(req.user.id)
	.then(user => {

		if(!user){
			return res.status(403).send({ message: 'invalid signature' })
		}else {
			user.password = "";
			return res.status(200).send({user: user});
		}  
	})
	.catch(error => errorHandler(error, req, res));
};

module.exports.updateUserToAdmin = (req, res) => {
    const userId = req.params.id;

    // Check if the requesting user is an admin
    if (!req.user.isAdmin) {
        return res.status(403).send({ message: "Access denied. Admins only." });
    }

    // Find the user by ID and update their isAdmin status
    User.findByIdAndUpdate(userId, { $set: { isAdmin: true } }, { new: true, runValidators: true })
    .then(updatedUser => {
        if (!updatedUser) {
            return res.status(404).send({ message: "User not found." });
        }
        res.status(200).send({ updatedUser: updatedUser });
    })
    .catch(err => errorHandler(err, req, res));
};

module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    // update the userId to id because our versiono of req.user does not have userId property but id property instead
    const { id } = req.user; // Extracting user ID from the authorization header (token)

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};