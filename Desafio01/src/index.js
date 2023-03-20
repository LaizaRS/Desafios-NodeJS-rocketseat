const express = require('express');
const cors = require('cors');
const{ v4: uuidv4 } = require("uuid");
const { request, response } = require('express');

const app = express();

app.use(express.json());

const users = []

function checksExistsUserAccount(request, response, next) {
    const { username } = request.headers

    const user = users.find(user => user.username === username)

    if(!user) {
        return response.status(400).json({error:'User does not exists'})
    }

    request.user = user;
    
    return next();

  }


app.post("/users", (request, response) => {
    const { name, username} = request.body;

    const userAlreadyExists = users.some(
        (user) => user.username === username
    );

    if(userAlreadyExists){
        return response.status(400).json({error: "user already exists!"})
    }

    users.push({
        id: uuidv4(), 
        name, 
        username, 
        todos: []
    });
    
    return response.status(200).send(users);
})

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const { user } = request

    return response.json(user.todos);

})


app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body
    const { user } = request
     const newTodos = {
        id: uuidv4(),
        title,
        done: false,
        deadline: new Date(deadline),
        createdAt: new Date()
    }

    user.todos.push(newTodos) 

    return response.status(201).send(newTodos);
})


app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request
    const { title, deadline } = request.body
    const { id } = request.params

    const todo = user.todos.find(todo => todo.id === id)

    todo.title = title;
    todo.deadline = new Date(deadline);


    return response.status(201).send();
})


app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
    const { user } = request
    const { id } = request.params

    const todo = user.todos.find(todo => todo.id === id)

    todo.done = true

    return response.status(201).send(todo)
})



app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
    const { user } = request
    const { id } = request.params

    const todo = user.todos.find(todo => todo.id === id)

    user.todos.splice(todo, 1);

    return response.status(200).json(users);

})

app.listen(3333)