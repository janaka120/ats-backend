# ats-backend

## Description

A Node.js API built with Express.js that interacts with a MySQL database to provide functionalities related to 
- register create user
- student to specific teacher
- retrieve a list of students belong to given teachers
- suspend a specified student
- retrieve a list of students who can receive a given notification.

## Getting Started

### Clone the Repository
```bash
git clone git@github.com:janaka120/ats-backend.git
cd ats-backend
```

### Install Dependencies
```bash
npm install
```

### Prerequisites
- Node.js (version 16 or later recommended) and npm (or yarn) installed on your operating system.
- A MySQL database server running in your application.

### Environment Variables
Create a .env file in the project root directory and add the following environment variables, replacing the placeholders with your actual values

```
MYSQL_HOST=your_mysql_host
MYSQL_USER=your_mysql_username
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_mysql_database_name
```

#### Example:
```
MYSQL_HOST='localhost'
MYSQL_USER='root'
MYSQL_PASSWORD='12345678'
MYSQL_DATABASE='ats_db'
```

### Start the Server
```bash
npm start
```

This will start the server, typically listening on port 8080.\
**Make sure to run MYSQL server before run the server.**\
**First time run the server MOCK User data is created(config/db-setup.js).**

### API Specifications

#### BaseURL: http://localhost:8080/api

Request Headers require
```
"Content-Type: application/json"
"Authorization: bearer TEST_JWT_TOKEN"
```

JWT Token validation does not in the auth logic. Verify Authorization header includes in the request.

#### Post register one or more students to a specified teacher(POST /api/register)

```
curl -X POST "BaseURL/register" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN" \
     -d '{
           "teacher": "teacherken@gmail.com",
           "students": [
             "studentjon@gmail.com",
             "studenthon@gmail.com"
           ]
         }'
```

Response:
```
{
  "message": "Registered student under teacher successfully."
}
```

#### Post retrieve a list of students common to a given list of teachers(GET /api/commonstudents)

```
curl -X GET "BaseURL/commonstudents?teacher=teacherken@gmail.com" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN"
```

Response:
```
{
  "students": [
    "studentjon@gmail.com",
    "studenthon@gmail.com"
  ]
}
```

#### Post teacher suspend a specified student(POST /api/suspend)

```
curl -X POST "BaseURL/suspend" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN" \
     -d '{
           "student": "studentjon@gmail.com"
         }'
```

Response:
```
{
  "message": "Suspended student successfully."
}
```


#### Post teacher teacher want to retrieve a list of students who can receive a given notification(POST /api/retrievefornotifications)

```
curl -X POST "BaseURL/retrievefornotifications" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN" \
     -d '{
            "teacher": "teacherken@gmail.com",
            "notification": "Heollo @studentjon@gmail.com @studenthon@gmail.com"
         }'
```

Response:
```
{
  "recipients": [
    "studenthon@gmail.com"
  ]
}
```


#### Get all users (GET api/all?role(ROLE ==> student | teacher))

```
curl -X GET "BaseURL/all?role=ROLE" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN"
```

Response:
```
{
  "message": "Fetched users successfully.",
  "data": [
    {
      "id": 1,
      "email": "teacherken@gmail.com",
      "name": "Ken Teacher",
      "password": "mockpassword001",
      "suspended": 0,
      "role": "teacher",
      "created_at": "2024-06-30T23:33:56.000Z",
      "updated_at": "2024-06-30T23:33:56.000Z"
    },
    {
      "id": 2,
      "email": "teacherjoe@example.com",
      "name": "Joe Teacher",
      "password": "mockpassword002",
      "suspended": 0,
      "role": "teacher",
      "created_at": "2024-06-30T23:33:56.000Z",
      "updated_at": "2024-06-30T23:33:56.000Z"
    }
  ]
}
```


#### Post create user (POST api/create)
```
curl -X POST "BaseURL/create" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN" \
     -d '{
           "email": "teacherken@gmail.com",
           "name": "Ken Teacher",
           "password": "mockpassword001",
           "role": "teacher"
         }'
```

Response:
```
{
  "message": "Create user successfully.",
  "data": {
    "id": 1,
    "email": "teacherken@gmail.com",
    "name": "Ken Teacher",
    "password": "qazwsxedc123",
    "suspended": 0,
    "role": "teacher",
    "created_at": "2024-06-30T14:54:23.000Z",
    "updated_at": "2024-06-30T14:54:23.000Z"
  }
}
```

#### Error
```
curl -X POST "BaseURL/create" \
     -H "Content-Type: application/json" \
     -H "Authorization: bearer TEST_JWT_TOKEN" \
     -d '{
           "email": "teacherken@gmail.com",
           "name": "Ken Teacher",
           "password": "mockpassword001",
           "role": "teacher"
         }'
```

Response:
```
{
  "message":"Duplicate entry 'teacherken@gmail.com' for key 'users.email'"
}
```


Error with out Authorization header

```
curl -X POST "BaseURL/create" \
     -H "Content-Type: application/json" \
     -d '{
           "email": "teacherken@gmail.com",
           "name": "Ken Teacher",
           "password": "mockpassword001",
           "role": "teacher"
         }'
```

Response:
```
{
  "message":"Not authenticated."
}
```

### Run test
```bash
npm run test
```
