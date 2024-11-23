'use strict'
const User = require("../models/userModel");
const Document = require('../models/documentModel');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require('multer');
const path = require("path");
const fs = require('fs');

require('dotenv').config();


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save files
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Ensure unique filenames
    }
});
const upload = multer({ storage });


const MINIMUM_PASSWORD_REQUIREMENT = process.env.MINIMUM_PASSWORD_REQUIREMENT || 6;

/**
 * @api {post} /register Register
 * @apiName Register
 * @apiGroup User
 * @apiParam {String} username username
 * @apiParam {String} password password
 * @apiSuccess {String} message user registered
 * @apiError {String} message username and password are required
 * @apiError {String} message password must be at least ${MINIMUM_PASSWORD_REQUIREMENT} characters
 * @apiError {String} message user already exists
 */
exports.register = async (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    // field treatment, sample of treatment
    if (!username || !password) {
        return res.status(400).send("username and password are required");
    }
    if (!password || password.length < MINIMUM_PASSWORD_REQUIREMENT) {
        return res.status(400).send("password must be at least " + MINIMUM_PASSWORD_REQUIREMENT + " characters");
    }

    const salt = process.env.SALT;
    const passwordHash = await bcryptjs.hash(salt + password, 10); // 10 salt rounds
    console.log("password hash", passwordHash);

    try {
        // enable unique index
        await User.collection.createIndex({username: 1}, {unique: true});
        // create new user on mongoDB
        const response = await User.create({
            username,
            password: passwordHash,
            register_date: new Date(),
            last_sign_in: new Date(),
            active: true,
        });
        console.log("response", response);
    } catch (error) {
        console.log(error);
        if(error.code === 11000) {
            return res.status(400).send("user already exists");
        }
        throw error;
    }


    res.status(200).send("user registered");
}
/**
 * @api {post} /login Login
 * @apiName Login
 * @apiGroup User
 * @apiParam {String} username username
 * @apiParam {String} password password
 * @apiSuccess {String} token JSON Web Token that can be used to authenticate
 * @apiError {String} user/password not match
 * @apiError {String} user not found
 */
exports.login = async (req, res) => {
    const { username, password } = req.body;
    //console.log("username", username, password);
    const user = await User.findOne({username}).lean(); //return a simple document json
    if (!user) {
        //user not found
        return res.status(400).send("user not found");

    }
    const salt = process.env.SALT;

    if (await bcryptjs.compare(salt + password, user.password)) {
        //password match
        if(!user.active) {
            return res.status(400).send("User has been blocked");
        }
        
        const token = jwt.sign({username: user.username}, process.env.SECRET_KEY, {expiresIn: '1d'});
        return res.status(200).send({token: token});
    }else{
        //password not match
        return res.status(400).send("Invalid credentials");
    }
}
/**
 * @api {put} /change-password Change Password
 * @apiName ChangePassword
 * @apiGroup User
 * @apiHeader {String} token User's unique access token
 * @apiParam {String} oldPassword Current password of the user
 * @apiParam {String} newPassword New password to be set for the user
 * @apiSuccess {String} message Password changed successfully
 * @apiError {String} message Token, old password, or new password missing
 * @apiError {String} message Invalid token
 * @apiError {String} message User not found
 * @apiError {String} message Old password does not match
 */
exports.changePassword = async (req, res) => {
    const token = req.headers['token'];
    const { oldPassword, newPassword} = req.body;
    console.log("token", token, oldPassword);
    if (!token || !oldPassword || !newPassword) {
        return res.status(400).send("token, old password and new password are required");
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({username: decoded.username}).lean();
        if (!user) {
            return res.status(400).send("user not found");
        }

        const salt = process.env.SALT;
    
        if (await bcryptjs.compare(salt + password, user.password)) {
            const passwordHash = await bcryptjs.hash(newPassword, 10);
            await User.updateOne({username: user.username}, {password: passwordHash});
            return res.status(200).send("password changed");
        } else {
            return res.status(400).send("old password not match");
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send("invalid token");
    }
}
/**
 * @api {delete} /delete-user Delete User
 * @apiName DeleteUser
 * @apiGroup User
 * @apiHeader {String} token User's unique access token
 * @apiParam {String} password User's password for verification
 * @apiSuccess {String} message User deleted successfully
 * @apiError {String} message Token and password are required
 * @apiError {String} message Invalid token
 * @apiError {String} message User not found
 * @apiError {String} message Password not match
 */
exports.deleteUser = async (req, res) => {
    const token = req.headers['token'];
    const { password } = req.body;
    
    if (!token || !password) {
        return res.status(400).send("token and password are required");
    }
    
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({username: decoded.username});
        // const user = await User.findOne({username: decoded.username}).lean();
        
        if (!user) {
            return res.status(400).send("user not found");
        }
        
        const salt = process.env.SALT;
    
        if (await bcryptjs.compare(salt + password, user.password)) {
            await User.deleteOne({username: user.username});
            return res.status(200).send("user deleted");
        } else {
            return res.status(400).send("password not match");
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send("invalid token");
    }
}


/**
 * @api {put} /block-user Block User
 * @apiName BlockUser
 * @apiGroup User
 * @apiHeader {String} token User's unique access token
 * @apiParam {String} password User's password for verification
 * @apiSuccess {String} message User blocked successfully
 * @apiError {String} message Token and password are required
 * @apiError {String} message Invalid token
 * @apiError {String} message User not found
 * @apiError {String} message Password not match
 * @apiDescription This endpoint blocks a user by setting their 'active' status to false.
 * Note: The route requires admin permissions to be meaningful.
 */
exports.blockUser = async (req, res) => { // the route itselfdoesn't actually make much sense becouse it needed admin permissions
    const token = req.headers['token'];
    const { password } = req.body;

    if (!token || !password) {
        return res.status(400).send("token and password are required");
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ username: decoded.username });

        if (!user) {
            return res.status(400).send("user not found");
        }

        const salt = process.env.SALT;

        if (await bcryptjs.compare(salt + password, user.password)) {
            await User.updateOne({ username: user.username }, { active: false });
            return res.status(200).send("user blocked");
        } else {
            return res.status(400).send("password not match");
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send("invalid token");
    }
};

/**
 * @api {put} /unblock-user Unblock User
 * @apiName UnblockUser
 * @apiGroup User
 * @apiHeader {String} token User's unique access token
 * @apiParam {String} password User's password for verification
 * @apiSuccess {String} message User unblocked successfully
 * @apiError {String} message Token and password are required
 * @apiError {String} message Invalid token
 * @apiError {String} message User not found
 * @apiError {String} message Password not match
 * @apiDescription This endpoint unblocks a user by setting their 'active' status to true.
 * Note: The route requires admin permissions to be meaningful.
 */
exports.unblockUser = async (req, res) => { // the route itselfdoesn't actually make much sense becouse it needed admin permissions
    const token = req.headers['token'];
    const { password } = req.body;

    if (!token || !password) {
        return res.status(400).send("token and password are required");
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({ username: decoded.username });

        if (!user) {
            return res.status(400).send("user not found");
        }

        const salt = process.env.SALT;
 
        if (await bcryptjs.compare(salt + password, user.password)) {
            await User.updateOne({ username: user.username }, { active: true });
            return res.status(200).send("user unblocked");
        } else {
            return res.status(400).send("password not match");
        }
    } catch (error) {
        console.log(error);
        return res.status(400).send("invalid token");
    }
};


/**
 * @api {put} /edit Edit User
 * @apiName EditUser
 * @apiGroup User
 * @apiHeader {String} token User's unique access token
 * @apiDescription Endpoint to edit a user's profile. The user must be authenticated,
 * and the request must contain the user's new profile picture.
 * @apiparam {string} email - The user's new email address
 * @apiparam {string} first_name - The user's new first name
 * @apiparam {string} last_name - The user's new last name
 * @apiparam {string} birthdate - The user's new birth date in the format yyyy-mm-dd
 * @apiparam {string} profilePicture - The user's new profile picture (multipart/form-data)
 * @apiSuccess {String} message returns html response
 */
exports.editUser = [ upload.single('profilePicture'), // Middleware for file upload,
    async (req, res) => {
        const token = req.headers['token'];
        const {email, first_name, last_name, birthdate} = req.body;
        const profilePicture = req.file; // Needed file for picture

        if (!token) {
            return res.status(400).send("token is required");
        }

        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const user = await User.findOne({ username: decoded.username });

            if (!user) {
                return res.status(400).send("user not found");
            }

            const isValidEmail = (email) => { // Using regex expression to check if email is valid
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            };

            
            if (email && !isValidEmail(email)) {
                return res.status(400).send("invalid email format");
            }

            let birthDate = null;

            
            if (birthdate) {
                const birthDateRegex = /^(19|20)\d{2}[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12][0-9]|3[01])$/; // Regex pattern for yyyy/mm/dd or yyyy-mm-dd
                const isValidFormat = birthDateRegex.test(birthdate);
            
                if (!isValidFormat) {
                    return res.status(400).send("invalid birth date format, should be yyyy-mm-dd or yyyy/mm/dd");
                }
            
                // Parse the birth_date string
                const [year, month, day] = birthdate.split(/[-/]/).map(Number); // Split by "-" or "/" and convert to numbers
            
                // Validate the logical date
                const parsedDate = new Date(year, month - 1, day); // Months are 0-based in JS Date
            
                birthDate = parsedDate; // Assign the valid Date object
            }
            console.log("birth_date", birthDate);
            let documentName = null;

            if (profilePicture) {
                const allowedExtensions = [".jpeg", ".png"];
                if (!allowedExtensions.includes(path.extname(profilePicture.originalname).toLowerCase())) {
                    return res.status(400).send("only jpeg and png extensions are allowed");
                }

                // Create a new Document record for the uploaded file
                const newDocument = new Document({
                    hidden_name: profilePicture.filename, // Stored filename
                    real_name: profilePicture.originalname, // Original name of the file
                    insert_date: new Date().toISOString(),
                    extension: path.extname(profilePicture.originalname),
                    active: "true",
                });
    
                const savedDocument = await newDocument.save();
                documentName = savedDocument.hidden_name; // Use the saved document's filename
            }

            await User.updateOne({ username: user.username }, {
                email,
                first_name,
                last_name,
                document_name: documentName,
                last_sign_in: new Date(),
                birthdate: birthDate,
            });
            if (profilePicture) {
                const image = await Document.findOne({ hidden_name: documentName });
                if (image) {
                    try {
                        const imageBuffer = await fs.promises.readFile(
                            path.join(__dirname, `../uploads/${image.hidden_name}`)
                        );
            
                        // Encode the filename for safe use
                        const safeFileName = encodeURIComponent(image.real_name).replace(/['"]/g, '');
            
                        // Generate a Base64 string for embedding the image in HTML
                        const base64Image = imageBuffer.toString('base64');
                        const imageMimeType = `image/${image.extension}`;
            
                        // Send a pretty HTML response
                        const htmlResponse = `
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Image Preview</title>
                                <style>
                                    body {
                                        font-family: Arial, sans-serif;
                                        margin: 20px;
                                        padding: 0;
                                        background-color: #f4f4f9;
                                        color: #333;
                                    }
                                    .container {
                                        max-width: 600px;
                                        margin: 0 auto;
                                        text-align: center;
                                        background: #fff;
                                        padding: 20px;
                                        border-radius: 8px;
                                        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    }
                                    img {
                                        max-width: 100%;
                                        height: auto;
                                        border-radius: 8px;
                                        margin-top: 10px;
                                    }
                                    h1 {
                                        color: #555;
                                    }
                                </style>
                            </head>
                            <body>
                                <div class="container">
                                    <h1>Your uploaded profile picture</h1>
                                    <br>
                                    <img src="data:${imageMimeType};base64,${base64Image}" alt="${safeFileName}" />
                                </div>
                            </body>
                            </html>
                        `;
            
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(htmlResponse);
                    } catch (error) {
                        console.error("Error reading image file:", error);
                        return res.status(500).send("Error reading image file.");
                    }
                } else {
                    return res.status(404).send("image not found");
                }
            } else {
                return res.status(200).send("user edited");
            }

        } catch (error) {
            console.log(error);
            return res.status(400).send("invalid token");
        }
    }];
