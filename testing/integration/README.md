
# Integration Testing

This directory contains **integration tests** for the different modules (in the `api/modules/` directory).

Integration tests run tests on the specified module and check whether it works correctly **whilst importing other modules from the app**.

Each module has a separate test script and the name of the test script matches the name of the module.

The tests can be run using the following command:

```
$ deno task integrationTests
```

This is an alias for the following command:

```
$ deno test --allow-all testing/integration/
```
