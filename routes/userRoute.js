const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require('jsonwebtoken');
const { body, query, validationResult, check } = require('express-validator');
const router = express.Router();
const app = express();

const config = require('config');



var session;

router.get("/current", auth, async (req, res) => {
    //search database with decoded json for user
    const user = {
        ...req.user
    }
    res.send(user);
});

router.get("/login", async (req, res) => {
    let password = req.body["password"];
    let username = req.body["username"]; 
    const valid = await bcrypt.compare(password, "$2b$10$KNdltO.dH77.G2lLTGXVI.XZLEiLWb85fiB3Dv9KiwVEwaGNTxmwi");

    if(username !== "duck" || !valid){
        res.status(403).json({ message: "Incorrect password or username", ps: password });
    }

    session=req.session;
    session.userid=req.body.username;
    res.send({...req.session});

    //res.send(jwt.sign({ id: 1, username: "duck", password: "$2b$10$KNdltO.dH77.G2lLTGXVI.XZLEiLWb85fiB3Dv9KiwVEwaGNTxmwi" }, config.get('privatekey')));

    //Search the database for username and compare the passwords
    
    //get user data
    // const userData = await prisma.users.findUnique({
    //     where: {
    //         Username: username,
    //     },
    // })

    //compare the passwords
    // await bcrypt.compare(password, userData.Password);

    // if (!valid || !userData){
    //     res.status(403).json({ message: "Incorrect password or username" });
    // }

    //save token in localStorage?
    
})

router.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
})

router.post("/", check("username").isLength({min: 3}), check("password").isLength({min: 5}), async (req, res) => {
    //check if there is session
    session = req.session;
    if(!session.userid){
        res.status(401).send({error: "Unauthorized. "})
    }
    // validate the request body first
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    let password = req.body["password"];
    let username = req.body["username"];
  
    //find an existing user
    //...
  

    //Create user and save to database
    //...
    //then get the generated id to return to user
    //...
    password = await bcrypt.hash(password, 10);
    const user = {
        username: username,
        password: password
    }
  
    const token = jwt.sign({ id: 1, username: username, password: password }, config.get('privatekey'));
    res.header("x-auth-token", token).send({
      id: 1,
      username: user.username,
      password: user.password,

    });
});

module.exports = router;