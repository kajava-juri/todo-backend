# todo-backend
To start you need to create a new user. After user is created you'll need to login with the same credentials. On login a session is created and its data is saved on the server while session id is saved and tampered in a cookie. Session will be expired after 24 hours. On logout session data is deleted as well as cookie. 

You can not change or read others' tasks.

API endpoint is localhost://3000/api by default unless the port is already being used.

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
