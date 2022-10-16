//import auth from "../middleware/auth.js";
const bcrypt = require("bcrypt");
const express = require ("express");
const jwt = require('jsonwebtoken');
const { body, query, validationResult, check } = require('express-validator');
const router = express.Router();
const app = express();

//import config from '../config/default.json';

const prisma = require("../prisma");

var session;

// router.get("/current", auth, async (req, res) => {
//     //search database with decoded json for user
//     const user = {
//         ...req.user
//     }
//     res.send(user);
// });

router.get("/current", (req, res) => {
    if(req.session.user){
        return res.send({session: req.session});
    } else{
        return res.status(401).send({error: "unauthorized - no user found"});
    }
});

router.post("/login", async (req, res) => {
    let password = req.body["password"];
    let username = req.body["username"]; 

    try{
        const user = await prisma.users.findUnique({
            where: {
                Username: username,
            }
        })

        const valid = await bcrypt.compare(password, user.Password);

        if (!valid || !user){
            return res.status(403).json({ message: "Incorrect password or username" });
        }

        const userDto = {
            Id: user.Id,
            Username: user.Username
        }

        req.session.user = userDto;
        //session.createdAt = Date.now().toString();

    }
    catch(e)
    {
        return res.send(JSON.stringify({"status": 500, "error": 'In user '+e, "response": null}));
    }

    return res.send({...req.session});
})

router.post("/logout", (req, res) => {
    req.sessionStore.destroy();
    req.session.destroy();
    res.send("session destroyed");
})

router.post("/register", check("username").isLength({min: 3}).withMessage('must be at least 3 characters long'), check("password").isLength({min: 5}).withMessage('must be at least 5 characters long'), async (req, res) => {

    if(req.session.user){
        return res.send("Already logged in");
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let password = req.body["password"];
    let username = req.body["username"];

    //check the database if user already exists
    try{
        const user = await prisma.users.findUnique({
            where: {
                Username: username,
            },
        })
    
        if(user)
        {
            return res.status(302).send({ message: "User already exists" });
        }

        //create user object with hashed password
        password = await bcrypt.hash(password, 10);
        const newUser = {
            Username: username,
            Password: password
        }

        //save user to database
        try
        {
            const createUser = await prisma.users.create({
                data: newUser
            })
            return res.send({"status": 200, "response": "User created with id " + createUser.Id});
        }
        catch(e)
        {
            return res.send({"status": 500, "error": 'In create user ' + e, "response": null});
        }

    }
    catch(e)
    {
        return res.send({"status": 500, "error": 'In user '+e, "response": null});
    }

})


module.exports = router;