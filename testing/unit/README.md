
# Unit Testing

This directory contains **unit tests** for the different modules (in the `api/modules/` directory).

Unit tests run tests on the specified module and check whether it works correctly **without importing other modules from the app**.

In order to achieve this, every module imported needs to be replaced with a **test double** and these test doubles should be stored in the `mocks/` directory.

Each module has a separate test script and the name of the test script matches the name of the module.

The tests can be run using the following command:

```
$ deno task unitTests
```

This is an alias for the following command:

```
$ deno test --allow-all --import-map testing/unit/import_map.json testing/unit/
```
