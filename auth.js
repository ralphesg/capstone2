// [SECTION] Dependencies and Modules
const jwt = require("jsonwebtoken");
require('dotenv').config();

// [SECTION] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or other parts of a server
- Information is kept secure through the use of the secret keyword
- Only the system that knows the secret code that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- If the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

// [SECTION] Token Creation
/*
Analogy:
	- Pack the gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {
	// The data will be received from the registration form
	// When the user logs in, a token will be created with the user's information
	console.log(user);
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	// Generate a JSON web token using the jwt's sign method
	// Generates the token using the form data and the secret code with no additonal options provided
	// JWT_SECRET_KEY is a User defined string data that will be used to create our JSON web tokens
	// Since this is a critical data, we will use .env to secure the secret key. Keeping your secrets a secret.
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
}

// [SECTION] Token Verification
/*
	Analogy:
		Receive the gift and open the lock to verify if the sender is legitimate and the gift was not tampered with
	- Verify will be used as a middleware in Express.js. Functions added as argument in an expressJS route are considered as middleware and is able to receive the request and response objects as well as the next() function.
*/
module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization);

	// "req.headers.authorization" contains sensitive data and especially our token
	let token = req.headers.authorization;

	// This if statement will first check if a token variable contains "undefined" or a proper jwt. We will check token's data type with "typeof", if it is "undefined" we will send a message to the client. Else if it is not, then we return the token
	if(typeof token === "undefined"){
		return res.send({auth: "Failed. No Token"});
	} else {
		console.log(token)
		token = token.slice(7, token.length);
		console.log(token);

		// [SECTION] Token decryption
		/*
			Analogy
				Open the gift and get the content
			- Validate the token using the "verify" method decrypting the token using the secret code
			- token - the jwt passed from the request headers authorization
			- JWT_SECRET_KEY = the secret word from earlier which validates our token
			- function(err,decodedToken) - err contains the error in verification, decodedToken contains the decoded data within the token after verification
		*/

		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken){
			if(err){
				return res.status(403).send({
					auth: "Failed",
					message: err.message
				});
			} else {
				console.log("result from verify method:");
				console.log(decodedToken);

				// Else, if our token is verified to be correct then we will update the request and add the user's decoded details
				req.user = decodedToken;

				// next() is an expressJS function which allows us to move to the next function in the route. It also passes details of the request and response to the next function/middleware
				next();
			}
		})
	}
}

// [SECTION] Admin Verification
// The "verifyAdmin" function will only be used to check if the user is an admin or not
// The "verify" method should be used before "verifyAdmin" because it is used to check the validity of the JWT. Only when the token has been validated/verified should we check if the user is admin or not.
module.exports.verifyAdmin = (req, res, next) => {
	// console.log("result from verifyAdmin method");
	// console.log(req.user)
	if(req.user.isAdmin){
		// If the user is admin, move to the next middleware/controller function using next() method.
		next();
	} else {
		// Else, end the request-response cycle by sending the appropriate response and status.
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}

// [SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {
	// Log error
	console.error(err);

	// If the error object contains a message property, we use it as the error message; otherwise, we default to 'Internal Server Error'
	// || -> it ensures that default values are used in such cases, providing a fallback mechanism for error handling
	const errorMessage = err.message || 'Internal Server Error';
	const statusCode = err.status || 500;

	// Send a standardized error message response
	// We construct a standardized erro response JSON object with the approriate error message, status code, error code and any addtional details provided in the error object
	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || 'SERVER_ERROR',
			details: err.details || null
		}
	})
}

// [SECTION] Middleware to check if the user is authenticated
module.exports.isLoggedIn = (req, res, next) => {
	if(req.user){
		next();
	} else {
		res.sendStatus(401);
	}
}