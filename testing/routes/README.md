
# Testing The Routes

This directory contains **routing tests** for the different routes in the API.

Each collection has a separate test script which contains tests for the:

- collection.
- resources in that collection.

The tests can be run using the following command:

```
$ deno task testRoutes
```

This is an alias for the following command:

```
$ deno test --allow-all testing/routes/
```
