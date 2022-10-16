# todo-backend
To start you need to create a new user. After user is created you'll need to login with the same credentials. On login a session is created and its data is saved on the server while session id is saved and tampered in a cookie. Session will be expired after 24 hours. On logout session data is deleted as well as cookie. 

You can not change or read others' tasks.

API endpoint is localhost://3000/api by default if the port is not being used.

## Todo model

|Key |Value | Access
--- | --- | ---
Id | int (generated) | read-only
Title | string (optional) | read, write
Description | string (optional) | read, write

## User model

|Key |Value | Access
--- | --- | ---
Id| int (generated) | read-only
Username | string (required) | read-only
Password | string (required) | x

## List of API calls

### User
| | | 
|---|---|
|GET /users/current | returns cookie and user information|
|POST /users/login | log in with credentials |
|POST /users/logout | destroys the cookie and session data from the server |
|POST /users/register | creates a new user |

### Task
| | |
|---|---|
|GET /api/todo | returns all tasks |
|GET /api/todo/{id} | returns task with given id |
|POST /api/todo/ | creates a new task |
|DELETE /api/todo/{id} | deletes task |
|PUT /api/todo/{id} | updates task |

## Examples

### Register

POST /users/register
```
{
    "username": "duck",
    "password": "duck123"
}
```

#### Response
```
{
    "status": 200,
    "response": "User created with id 8"
}
```

### Log in
POST /users/login
```
{
    "username": "duck3",
    "password": "duck123"
}
```
#### Response
```
{
    "cookie": {
        "originalMaxAge": 86400000,
        "expires": "2022-10-17T08:37:27.991Z",
        "httpOnly": true,
        "path": "/"
    },
    "user": {
        "Id": 8,
        "Username": "duck3"
    }
}
```

### Add task
POST /todo
```
{
    "title" : "task1",
    "description": "desc1"
}
```
#### Response
```
{
    "Id": 4,
    "Title": "task1",
    "Description": "desc1",
    "UserId": 8
}
```
