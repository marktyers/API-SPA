This template is to be used when developing a Single Page Application connected to a REST Web API.This

There are two directories:

1. The **api** directory contains the code for the REST Web API.
2. The **spa** directory contains the front-end code.

Project settings: make sure **protect dynamic ports** is switched off.

To run the project:

```
$ deno run --allow-all --unstable index.js
```

## Accounts

The system comes pre-configured with an account:

- username: `doej`
- password: `p455w0rd`

You can use the registration option to create more accounts.

The secure page allows you to upload files to the server, this will need to be replaced with the functionality required by your assigned topic.

## Linting

The Deno Lint tool only works for code written for Deno so in this assignment it should only be run on the contents of the `api/` directory.

When checking for code quality the following command will be run:

```
$ deno lint --unstable api
```
