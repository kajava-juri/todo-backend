const express = require('express')
const app = express()
const port = 3000
app.use(express.json());

const todos = [
    {id: 1, title: "task1"},
    {id: 2, title: "task2"},
    {id: 3, title: "task3"},
    {id: 4, title: "task4"},
    {id: 5, title: "task5"},
    {id: 6, title: "task6"},
    {id: 7, title: "task7"},
];

//Get all
app.get('/api/todo', (req, res) => {
  res.send(todos);
})

//Get by id
app.get('/api/todo/:id', (req, res) => {
    let todoId = todos.map(t => t.id).indexOf(parseInt(req.params.id));
    res.send(todos[todoId]);
})

//Create
app.post("/api/todo/", (req, res) => {
    const todo = {id: Math.ceil(Math.random()*100000), ...req.body}
    //todos.push(todo)
    res.send(todo);
})

//DELETE
app.delete("/api/todo/:id", (req, res) => {
    let todoId = todos.map(t => t.id).indexOf(parseInt(req.params.id));
    todos.splice(todoId, 1);
    res.status(202).send();
})

//UPDATE
app.put("/api/todo/:id", (req, res) => {
    let todo = todos.find(t => t.id == req.params.id);
    let todoid = todos.map(t => t.id).indexOf(parseInt(req.params.id));
    let newTodo = req.body;
  
    Object.keys(newTodo).forEach(key => {
        todo[key] = newTodo[key];
    })
  
    todos[todoid] = todo;
  
    res.status(201).send({newTodo: {...todo}});
  
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})