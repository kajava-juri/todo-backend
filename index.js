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
const { Prisma } = require('@prisma/client');

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
      UserId: userId
    }
  })
}

async function getTaskById(taskId){
  try{
    const task = await prisma.tasks.findUniqueOrThrow({
      where: {
        Id: taskId
      }
    })
    return task;
  } catch (e){
    return {error: "Task with id " + taskId + " was not found"};
  }

}

async function deleteTaskbyId(taskId){
  try{
    const task = await prisma.tasks.delete({
      where:{
        Id: taskId
      }
    })
    return task;
  } catch(e){
    if(e.code === "P2025"){
      return {error: "Task with id " + taskId + " does not exist"};
    }
    
  }

}

app.use("/api/todo", (req, res, next) => {
  if(req.session.user){
    next();
  } else {
    return res.status(401).send("Unauthorized");
  }
})

app.get("/", (req, res) => {
    return res.status(200).send();
})

//Get all
app.get('/api/todo', async (req, res) => {
  const userId = req.session.user.Id;
  const todos = await getTasks(userId);
  return res.send(todos);
})

//Get by id
app.get('/api/todo/:id', query('id'), async (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = req.session.user.Id;
  const todo = await getTaskById(taskId);
  if(todo.error){
    return res.status(500).send(todo.error);
  }
  if(todo.UserId !== userId){
    return res.status(403).send("Forbidden - you can only view your own tasks");
  }

  return res.send(todo);
})

//Create
app.post("/api/todo/", body('id').isEmpty(), async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {title, description} = req.body;

    const todo = await prisma.tasks.create({
      data: {
        Title: title,
        Description: description,
        UserId: req.session.user.Id
      }
    })

    res.send(todo);
})

//DELETE
app.delete("/api/todo/:id", async (req, res) => {
  const taskId = parseInt(req.params.id);
  const userId = req.session.user.Id;
  const todo = await getTaskById(taskId);
  if(todo.error){
    return res.status(500).send(todo.error);
  }
  if(todo.UserId !== userId){
    return res.status(403).send("Forbidden - you can only delete your own tasks");
  }

  const deleteTodo = await deleteTaskbyId(todoId);
  if(deleteTodo.error){
    return res.status(500).send(deleteTodo.error);
  }

  res.status(202).send(deleteTodo);
})

//UPDATE
app.put("/api/todo/:id", body("id").isEmpty(), async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = parseInt(req.params.id);

    try{
      const updateTask = await prisma.tasks.update({
        where: {
          Id: taskId
        },
        data:{
          Title: req.body.title || undefined,
          Description: req.body.description || undefined
        }
      })
      return res.status(201).send("task updated");

    } catch(e) {
      return res.status(500).send({error: "Task with id " + taskId + " was not found"});
    }

})

app.use("/api/users", usersRoute);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})