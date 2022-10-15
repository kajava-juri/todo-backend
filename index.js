const express = require('express');
const { body, query, validationResult, check } = require('express-validator');
const app = express();
const port = 3000;
const usersRoute = require("./routes/userRoute");
app.use(express.json());
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
var mysql2 = require('mysql2/promise');
var MySQLStore = require('express-mysql-session')(sessions);
require('dotenv').config();

const prisma = require("./prisma");

var options = {
	host: 'localhost',
	port: 3306,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PASSWORD,
	database: 'todo1'
};

var connection = mysql2.createPool(options);
var sessionStore = new MySQLStore({}, connection);

const config = require('config');

const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "somesecretkey",
    saveUninitialized:true,
    store: sessionStore,
    cookie: { maxAge: oneDay },
    resave: false 
}));

// parsing the incoming data
app.use(express.json());

//parse html form data
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

// cookie parser middleware
app.use(cookieParser());



async function getTasks(userId){
  return await prisma.tasks.findMany({
    where: {
      UserId: 6
    }
  })
}

async function getTaskById(){
  
}


app.use("/api/todo", (req, res, next) => {
  if(req.session.user){
    next();
  } else {
    res.status(401).send("Unauthorized");
  }
})

app.get("/", (req, res) => {
    res.status(200).send();
})

//Get all
app.get('/api/todo', async (req, res) => {
  const userId = req.session.user.Id;
  const todos = await getTasks(userId);
  res.send(todos);
})

//Get by id
app.get('/api/todo/:id', query('id'), (req, res) => {
    res.send(todos[todoId]);
})

//Create
app.post("/api/todo/", body('id').isEmpty(), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const todo = {id: Math.ceil(Math.random()*100000), ...req.body}
    todos.push(todo)
    res.send(todo);
})

//DELETE
app.delete("/api/todo/:id", (req, res) => {
    let todoId = todos.map(t => t.id).indexOf(parseInt(req.params.id));
    todos.splice(todoId, 1);
    res.status(202).send();
})

//UPDATE
app.put("/api/todo/:id", body("id").isEmpty(), (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let todo = todos.find(t => t.id == req.params.id);
    let todoid = todos.map(t => t.id).indexOf(parseInt(req.params.id));
    let newTodo = req.body;
  
    Object.keys(newTodo).forEach(key => {
        todo[key] = newTodo[key];
    })
  
    todos[todoid] = todo;
  
    res.status(201).send({newTodo: {...todo}});
  
})

app.use("/api/users", usersRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})