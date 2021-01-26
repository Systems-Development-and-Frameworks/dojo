# Systems Development and Frameworks - 2020/21 [![Build status](https://github.com/Systems-Development-and-Frameworks/dojo/workflows/Build%2C%20Test%2C%20Lint/badge.svg?branch=exercise2)](https://github.com/Systems-Development-and-Frameworks/dojo/actions?query=workflow%3A%22Build%2C+Test%2C+Lint%22+branch%3Aexercise5)

This is our homework solutions repository for the course `Systems Development and Frameworks`
at `Hochschule für Technik und Wirtschaft` in Berlin.

In [`./exercises`](exercises) you'll find the exercises, in [`./webapp`](webapp) you'll find a single webapp
incorporating the solutions.

## Setup and run the webapp

All commands assume you're located in the `webapp` directory.

### Project setup

```
$ (webapp) npm install
```

### Run unit tests

```
$ (webapp) npm run test
```

### Compiles and hot-reloads for development

```
$ (webapp) npm run dev
```

### Compiles and minifies for production (server build)

```
$ (webapp) npm run build
```

### Compiles and minifies for production (static build)

```
$ (webapp) npm run generate
```

### Serve in production

```
$ (webapp) npm run start
```

### Run linter

```
$ (webapp) npm run lint
```

## Setup and run the backend

All commands assume you're located in the `backend` directory.

The backend utilizes JSON Web Tokens for authentication. To cryptographically sign the tokens the backend application
requires an ECDSA key to be present. Such a key can be generated with OpenSSL as follows:

```
$ (backend) openssl ecparam -genkey -name prime256v1 -noout -out private.pem
```

The path to the private key to be used is assumed to be a file named `private.pem` in the current working directory. You
can specify another location by setting the `JWT_PRIVATE_KEY_LOCATION` environment variable (or setting it in a
`.env` file).

A running [neo4j](https://neo4j.com/) database is also needed to test and run the backend; the database is used to store
users, posts and their relations. At the moment only basic authentication is supported. You must at least provide a
username and password combination through either environment variables `NEO4J_USERNAME` and `NEO4J_PASSWORD`, or in
a `.env` file in scope. Other available settings (with their corresponding default values) are:

```dotenv
NEO4J_PROTOCOL = neo4j
NEO4J_HOST = localhost
NEO4J_PORT = 7687
NEO4J_DATABASE = neo4j
NEO4J_ENCRYPTED = ENCRYPTION_OFF
JWT_PRIVATE_KEY_LOCATION = private.pem
```

For testing and development purposes, running a neo4j Docker container is sufficient:

```
$ export NEO4J_USERNAME=neo4j NEO4J_PASSWORD=test
$ docker run -p 7474:7474 -p 7687:7687 --env=NEO4J_AUTH=NEO4J_USERNAME/$NEO4J_PASSWORD neo4j:4.2.1
```

### Reasoning about choice of storage backend

The backend utilizes [Neode](https://github.com/adam-cowley/neode) (a neo4js OGM) for mutations
and [neo4j-graphql-js](https://github.com/neo4j-graphql/neo4j-graphql-js/) for queries. It directly interfaces with
GraphQL, instead of e.g. an external GraphQL service, to store data mainly to for ease and speed of development and
usage. Furthermore, this allows the application to be more flexible in terms of (graph) database design. Also, the test
setup is simpler and instead of mocking another backend layer, an actual neo4j (test) database can be used.

### Project setup

```
$ (backend) npm install
```

### Compiles and hot-reloads for development

```
$ (backend) npm run dev
```

### Run tests

```
$ (backend) npm run test
```

### Run linter

```
$ (backend) npm run lint
```

<hr> 

<p>
  <img src=".github/img/CatView.gif" alt="homework" width="50%">
<p>

This ^ is you looking at our code? Have improvements? Raise issues and PRs!

Further questions? Reach out to us by texting either grabber@htw-berlin.de or donat.brzoska@student.htw-berlin.de
