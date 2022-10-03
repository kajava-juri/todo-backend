const auth = require("../middleware/auth");
const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require('jsonwebtoken');
const { body, query, validationResult, check } = require('express-validator');
const router = express.Router();

const config = require('config');

router.get("/current", auth, async (req, res) => {
    //search database with decoded json for user
    const user = {
        ...req.user
    }
    res.send(user);
});

router.post("/", check("username").isLength({min: 3}), check("password").isLength({min: 5}), async (req, res) => {
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
    //then get the generated id to return to user
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