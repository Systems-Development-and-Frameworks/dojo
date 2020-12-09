# Systems Development and Frameworks - 2020/21 [![Build status](https://github.com/Systems-Development-and-Frameworks/dojo/workflows/Build%2C%20Test%2C%20Lint/badge.svg?branch=exercise2)](https://github.com/Systems-Development-and-Frameworks/dojo/actions?query=workflow%3A%22Build%2C+Test%2C+Lint%22+branch%3Aexercise2)

This is our homework solutions repository for the course `Systems Development and Frameworks`
at `Hochschule für Technik und Wirtschaft` in Berlin.

In [`./exercises`](exercises) you'll find the exercises, in [`./webapp`](webapp) you'll find a single webapp incorporating the solutions.

## Setup and run the webapp

All commands assume you're located in the `webapp` directory.

### Project setup
```
$ (webapp) npm install
```

### Run unit tests
```
$ (webapp) npm run test:unit
```

### Compiles and hot-reloads for development
```
$ (webapp) npm run serve
```

### Compiles and minifies for production
```
$ (webapp) npm run build
```

### Run linter
```
$ (webapp) npm run lint
```

## Setup and run the backend

All commands assume you're located in the `backend` directory.

### Project setup
```
$ (backend) npm install
```

### Run tests
```
$ (backend) npm run test
```

### Compiles and hot-reloads for development

The backend utilizes JSON Web Tokens for authentication. To cryptographically sign the tokens the backend application
requires an ECDSA key to be present as a file named `private.pem` in the [`./backend`](./backend) directory.\
Such a key can be generated with OpenSSL as follows:
```
$ (backend) openssl ecparam -genkey -name prime256v1 -noout -out private.pem
```

You can then start the backend server with:

```
$ (backend) npm run dev
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
