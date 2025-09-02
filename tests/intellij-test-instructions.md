# Running Tests in IntelliJ IDEA

This document provides instructions on how to run the Vitest tests for the Uncertain Value Calculator project directly through IntelliJ IDEA.

## Prerequisites

- IntelliJ IDEA (Ultimate or Community Edition)
- Node.js and npm installed
- Project dependencies installed (`npm install`)

## Available Run Configurations

The following run configurations have been set up for running tests in IntelliJ:

1. **Vitest** - Runs all tests in watch mode
2. **Vitest Coverage** - Runs all tests with coverage reporting
3. **Vitest Current File** - Runs the currently open test file

## Running Tests

### Running All Tests

1. Open the Run/Debug Configurations dropdown in the top-right corner of IntelliJ
2. Select "Vitest" or "Vitest Coverage"
3. Click the Run button (green triangle)

### Running a Specific Test File

1. Open the test file you want to run
2. Right-click in the editor
3. Select "Run 'Vitest Current File'"

Alternatively:
1. Open the test file you want to run
2. Open the Run/Debug Configurations dropdown
3. Select "Vitest Current File"
4. Click the Run button

### Running a Specific Test

1. Open the test file containing the test you want to run
2. Click the green triangle next to the test description
3. Select "Run Test"

## Debugging Tests

To debug tests:

1. Set breakpoints in your code
2. Instead of clicking the Run button, click the Debug button (bug icon)
3. The test will run in debug mode, stopping at your breakpoints

## Viewing Test Results

Test results will be displayed in the Run tool window at the bottom of IntelliJ. You can:

- See which tests passed or failed
- View error messages for failed tests
- Navigate to the source of failures by clicking on the test name

## Coverage Results

When running tests with coverage:

1. The coverage results will be displayed in the Coverage tool window
2. You can see which lines of code are covered by tests
3. IntelliJ will highlight covered and uncovered code in the editor

## Troubleshooting

If you encounter issues running tests in IntelliJ:

1. **Missing Run Configurations**: If you don't see the run configurations, try restarting IntelliJ or manually creating them.
2. **Test Not Found**: Make sure your test files follow the naming convention (*.spec.js or *.test.js).
3. **Timeout Issues**: If tests time out, you may need to increase the timeout in vitest.config.js.
4. **Node.js Version**: Ensure you're using a compatible Node.js version.