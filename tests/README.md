# Testing Documentation for Uncertain Value Calculator

This document describes the testing approach and how to run the tests for the Uncertain Value Calculator project.

## Testing Framework

The project uses the following testing tools:

- **Vitest**: A Vite-native test framework that provides a fast and modern testing experience
- **Vue Test Utils**: The official testing utility library for Vue.js
- **jsdom**: A JavaScript implementation of the DOM for testing in Node.js
- **Testing Library**: Utilities for testing Vue components

## Test Structure

The tests are organized into the following directories:

- `tests/unit/components`: Unit tests for individual components
  - `Calculator.spec.js`: Tests for the Calculator component's methods
  - `ThemeToggle.spec.js`: Tests for the ThemeToggle component
- `tests/integration`: Integration tests for component interactions
  - `App.spec.js`: Tests for the interaction between App, Calculator, and ThemeToggle components
  - `Calculator.spec.js`: Tests for the end-to-end calculation flow

## Running Tests

To run the tests, use the following npm scripts:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage report
npm run test:coverage
```

## Test Coverage

The tests cover the following aspects of the application:

### Calculator Component

- **Core Calculation Logic**:
  - Tokenizing expressions
  - Evaluating tokens
  - Evaluating mathematical expressions
  - Performing operations between different types of operands
  - Formatting results

- **User Interactions**:
  - Button clicks
  - Keyboard input
  - Display updates
  - Result calculation and display

### ThemeToggle Component

- **Theme Switching**:
  - Toggling between light and dark themes
  - Emitting theme change events
  - Updating the DOM with theme classes

### App Component

- **Component Integration**:
  - Rendering child components
  - Passing props between components
  - Handling events from child components

## Adding New Tests

When adding new features to the application, follow these guidelines for adding tests:

1. **Unit Tests**: Add unit tests for new methods or components in the appropriate files in the `tests/unit` directory.
2. **Integration Tests**: Add integration tests for new component interactions in the `tests/integration` directory.
3. **Test Coverage**: Aim for high test coverage, especially for core functionality.
4. **Edge Cases**: Include tests for edge cases and error handling.

## Mocking

For tests that require DOM manipulation or browser APIs, use the mocking capabilities provided by Vitest. See examples in the existing tests for how to mock document methods, event handling, etc.