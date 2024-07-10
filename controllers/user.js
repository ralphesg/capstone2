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

module.exports.registerUser = (req,res) => {
	if (!req.body.email.includes("@")){
		return res.status(400).send({error: "Email invalid"});
	}
    // Checks if the mobile number has the correct number of characters
	else if (req.body.mobileNo.length !== 11){
		return res.status(400).send({error: "Mobile number invalid"});
	}
    // Checks if the password has atleast 8 characters
	else if (req.body.password.length < 8) {
		return res.status(400).send({error: "Password must be atleast 8 characters"});
    // If all needed requirements are achieved
	} else {
		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		})

		return newUser.save()
		.then((result) => res.status(201).send({
			message: "Registered Successfully"
					}))
		.catch(error => errorHandler(error, req, res));
	}
};


module.exports.checkEmailExists = (req, res) => {
	if(req.body.email.includes("@")){
		return User.find({ email : req.body.email })
		.then(result => {
			if (result.length > 0) {
	        	// 409 is the http status code for duplicate record which is used when there is another resource with the same data in the request
				return res.status(409).send({message: "Duplicate email found"});
	        // else, there is no duplicate email, send false with the status code back to the client
			} else {
	        	// 404 http status code refers to documents or resources that are not found
				return res.status(404).send({error: "No Email Found"});
			};
		})
		.catch(error => errorHandler(error, req, res));
	}else{
		res.status(400).send({error: "Invalid Email"})
	}
};

module.exports.loginUser = (req, res) => {
	return User.findOne({ email: req.body.email })
	.then(result => {
		if(result == null){
			return res.status(404).send({ success: false, message: 'No Email Found' });
		} else {
			const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
			
			if(isPasswordCorrect){
				 return res.status(200).send({ access: auth.createAccessToken(result) });
			} else {
				return res.status(401).send({ success: false, error: 'Email and password do not match' });
			}
		}
	})
	.catch(err => errorHandler(error, req, res))
}