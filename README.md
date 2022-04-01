This template is to be used when developing a Single Page Application connected to a REST Web API.This

There are two directories:

1. The **api** directory contains the code for the REST Web API.
2. The **spa** directory contains the front-end code.

Project settings: make sure **protect dynamic ports** is switched off.

# Getting Started

This template is designed to be installed inside a Codio box. To to this, open the terminal and run the following command:

```
$ curl -sL https://bit.ly/3ngLmVo | bash
```

This will configure the box ready for you to start development.

> The process can take up to 15 min. Make sure you don't close the browser tab _or let your computer go into sleep mode_.

To run the project:

```
$ deno task run
```

## Accounts

The system comes pre-configured with an account:

- username: `doej`
- password: `p455w0rd`

You can use the registration option to create more accounts.

The secure page allows you to upload files to the server, this will need to be replaced with the functionality required by your assigned topic.

## Testing

There are a number of tests configured and these can be run using the `deno task` command:

1. Use the `deno task integration` command to run integration tests.
2. Use the `deno task lint` command to run the linter.

## Linting

The Deno Lint tool only works for code written for Deno so in this assignment it should only be run on the contents of the `api/` directory.

The linter uses the settings from the `deno.json` config file:

```
$ deno lint
```

## The Database

This Codio box comes with MySQL installed and ready to use. In addition to the **root** account there is a low-privilege account called **websiteuser** that is used by the API.

- **root** password: `p455w0rd`
- **websiteuser** password: `websitepassword

You will need to log in to the **mysql-client** CLI tool using the **root** account which will allow you to modify the database schema.

## Frequently-Asked Questions

If you get stuck your first step should be to see if this is a problem that others have already encountered. There is a comprehensive FAQ document that gives solutions to the most common problems.

[Frequently-Asked Questions](https://docs.google.com/document/d/1b_lTA_ay0Yi46annuNnZ6fK1nIe_ddszmPua1Wwvfa0/edit?usp=sharing)