# Troubleshooting Test Execution

If you encounter issues when running the tests, here are some common problems and solutions:

## Test Execution Timeout

If the test execution times out, it could be due to:

1. **Infinite Loops**: Check for infinite loops in the test code or the component code being tested.
2. **Async Operations**: Ensure all async operations are properly awaited and resolved.
3. **Resource Intensive Tests**: Some tests, especially those involving DOM manipulation or canvas rendering, might be resource-intensive. Try running tests individually or with a longer timeout.

To increase the timeout for Vitest, you can modify the `vitest.config.js` file:

```js
export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    timeout: 10000, // Increase timeout to 10 seconds
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
})
```

## DOM-Related Issues

For tests that interact with the DOM:

1. **JSDOM Limitations**: JSDOM doesn't support all browser features. Some canvas operations or advanced DOM features might not work as expected.
2. **Mock Browser APIs**: For unsupported features, consider mocking the relevant browser APIs.

## Component Mounting Issues

If components fail to mount properly:

1. **Missing Dependencies**: Ensure all required props are provided when mounting components.
2. **Global Components**: Register any global components that might be used by the components being tested.
3. **Stubs**: Consider stubbing complex child components to isolate the component being tested.

## Running Individual Tests

To run a specific test file or test case:

```bash
# Run a specific test file
npm test -- tests/unit/components/Calculator.spec.js

# Run tests matching a specific pattern
npm test -- -t "should tokenize numbers correctly"
```

## Debugging Tests

For detailed debugging:

1. **Console Logs**: Add console.log statements to your tests or components.
2. **Vitest UI**: Use the Vitest UI for a more interactive debugging experience:
   ```bash
   npx vitest --ui
   ```
3. **Inspect Mounted Components**: Use `console.log(wrapper.html())` to see the rendered HTML of mounted components.

## Canvas Testing

For tests involving the canvas:

1. **Mock Canvas Methods**: Consider mocking canvas methods like `getContext` and drawing operations.
2. **Skip Visual Tests**: You might want to skip tests that verify visual output and focus on testing the underlying logic.