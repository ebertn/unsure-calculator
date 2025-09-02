<template>
  <article class="blog-post">
    <section class="post-content">
      <p class="post-intro">
        This calculator allows you to perform mathematical operations with uncertain values, represented as distributions.
        Enter your expression below and see the result visualized.
      </p>

      <div class="calculator-main">
        <div class="calculator-section">
          <div class="calculator-display">
            <div class="input-display">{{ displayExpression }}</div>
            <div class="result-display" v-if="result !== null">
              Result: {{ formatResult(result) }}
            </div>
          </div>

          <div class="calculator-keypad">
            <div class="number-pad">
              <button v-for="n in 9" :key="n" @click="appendToExpression(n)">{{ n }}</button>
              <button @click="appendToExpression(0)">0</button>
              <button @click="appendToExpression('.')">.</button>
              <button @click="clearExpression">C</button>
              <button @click="deleteLastCharacter">⌫</button>
            </div>

            <div class="operator-pad">
              <button @click="appendToExpression('+')">+</button>
              <button @click="appendToExpression('-')">-</button>
              <button @click="appendToExpression('*')">×</button>
              <button @click="appendToExpression('/')">/</button>
              <button @click="appendToExpression('~')">~</button>
              <button @click="appendToExpression('_')">_</button>
              <button class="equals-button" @click="calculateResult">=</button>
            </div>
          </div>
        </div>
      </div>

      <div class="visualization-container">
        <h3>Visualization</h3>
        <div class="visualization-section">
          <div class="distribution-visualization" v-if="result !== null && result.type === 'distribution'">
            <canvas ref="visualizationCanvas" width="1200" height="400"></canvas>
          </div>
          <div class="empty-visualization" v-else>
            <p>Distribution visualization will appear here</p>
          </div>
        </div>
      </div>
    </section>

    <section class="instructions">
      <h3>How to use this calculator</h3>
      <p><strong>Normal operations:</strong> Use +, -, *, / for basic math</p>
      <p><strong>Normal distribution:</strong> Use ~ operator (e.g., 4~6 represents a normal distribution with 95% of values between 4 and 6)</p>
      <p><strong>Uniform distribution:</strong> Use _ operator (e.g., 4_6 represents a uniform distribution with bounds at 4 and 6)</p>

      <h4>Examples:</h4>
      <ul>
        <li><strong>5 + 3</strong> - Simple addition</li>
        <li><strong>4~6 + 2</strong> - Add 2 to a normal distribution</li>
        <li><strong>4~6 * 2</strong> - Multiply a normal distribution by 2</li>
        <li><strong>4~6 + 1~3</strong> - Add two normal distributions</li>
        <li><strong>4_6 / 2</strong> - Divide a uniform distribution by 2</li>
        <li><strong>10 - 2_4</strong> - Subtract a uniform distribution from a number</li>
        <li><strong>4_6 + 1~3</strong> - Add uniform and normal distributions</li>
        <li><strong>100 * 4_6 * 1_2 * 1~2</strong> - Chain operations with mixed distributions</li>
      </ul>
    </section>
  </article>
</template>

<script>
export default {
  name: 'Calculator',
  props: {
    isLightTheme: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      expression: '',
      result: null
    }
  },
  mounted() {
    // Add keyboard event listener for calculator input
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeUnmount() {
    // Remove event listener when component is destroyed
    window.removeEventListener('keydown', this.handleKeydown);
  },
  computed: {
    displayExpression() {
      return this.expression || '0';
    }
  },
  watch: {
    result: {
      handler(newResult) {
        if (newResult && newResult.type === 'distribution') {
          this.$nextTick(() => {
            this.drawDistribution(newResult);
          });
        }
      },
      immediate: true
    },
    isLightTheme: {
      handler() {
        // Redraw the visualization when the theme changes
        if (this.result && this.result.type === 'distribution') {
          this.$nextTick(() => {
            this.drawDistribution(this.result);
          });
        }
      }
    }
  },
  methods: {
    handleKeydown(event) {
      // Prevent default behavior for calculator keys to avoid interfering with page scrolling, etc.
      const key = event.key;

      // Handle numeric keys and decimal point
      if (/^[0-9.]$/.test(key)) {
        this.appendToExpression(key);
        event.preventDefault();
      } 
      // Handle operators
      else if (['+', '-', '*', '/'].includes(key)) {
        this.appendToExpression(key);
        event.preventDefault();
      }
      // Handle special distribution operators
      else if (key === '~' || key === '_') {
        this.appendToExpression(key);
        event.preventDefault();
      }
      // Handle Enter key as equals
      else if (key === 'Enter') {
        this.calculateResult();
        event.preventDefault();
      }
      // Handle Backspace
      else if (key === 'Backspace') {
        this.deleteLastCharacter();
        event.preventDefault();
      }
      // Handle Escape as clear
      else if (key === 'Escape') {
        this.clearExpression();
        event.preventDefault();
      }
    },

    // Use the prop directly instead of checking the DOM
    getCurrentTheme() {
      return this.isLightTheme;
    },

    drawDistribution(distribution) {
      const canvas = this.$refs.visualizationCanvas;
      if (!canvas) return;

      // Get the device pixel ratio
      const dpr = window.devicePixelRatio || 1;

      // Get the canvas size from CSS
      const rect = canvas.getBoundingClientRect();

      // Set the canvas dimensions accounting for device pixel ratio
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;

      // Get the context and scale it
      const ctx = canvas.getContext('2d');
      // Check if context is available (it might not be in test environments)
      if (!ctx) return;

      ctx.scale(dpr, dpr);

      // Use CSS dimensions for calculations
      const width = rect.width;
      const height = rect.height;

      // Clear the canvas (using the scaled dimensions)
      ctx.clearRect(0, 0, width, height);

      // Set up styles based on current theme
      if (this.getCurrentTheme()) {
        // Light theme - black lines on white background
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      } else {
        // Dark theme - white lines on black background
        ctx.strokeStyle = 'white';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      }
      ctx.lineWidth = 2; // Increased line width for better visibility

      if (distribution.distributionType === 'normal') {
        this.drawNormalDistribution(ctx, width, height, distribution.mean, distribution.std);
      } else if (distribution.distributionType === 'uniform') {
        this.drawUniformDistribution(ctx, width, height, distribution.min, distribution.max);
      }

      // Draw axes
      this.drawAxes(ctx, width, height);
    },

    drawNormalDistribution(ctx, width, height, mean, std) {
      // Calculate range to display (mean ± 3*std)
      const range = Math.max(6 * std, 1);
      const min = mean - range/2;
      const max = mean + range/2;

      // Function to convert x value to canvas x coordinate
      const xToCanvas = (x) => ((x - min) / (max - min)) * width;

      // Function to calculate normal distribution PDF
      const normalPDF = (x) => {
        return (1 / (std * Math.sqrt(2 * Math.PI))) * 
               Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
      };

      // Find max PDF value for scaling
      let maxPDF = normalPDF(mean);

      // Begin path for the curve
      ctx.beginPath();

      // Move to the start point (bottom left)
      ctx.moveTo(0, height);

      // Draw the curve with higher resolution (2x more points)
      const numPoints = width * 2; // Double the number of points for smoother curve
      for (let i = 0; i <= numPoints; i++) {
        const x = min + (i / numPoints) * (max - min);
        const pdf = normalPDF(x);
        const y = height - (pdf / maxPDF) * (height * 0.9);
        const canvasX = (i / numPoints) * width; // Map to canvas coordinates

        if (i === 0) {
          ctx.moveTo(canvasX, y);
        } else {
          ctx.lineTo(canvasX, y);
        }
      }

      // Complete the path to form a closed shape
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();

      // Fill and stroke the path
      ctx.fill();
      ctx.stroke();

      // Draw mean line
      ctx.beginPath();
      ctx.strokeStyle = this.getCurrentTheme() ? 'black' : 'white';
      ctx.setLineDash([5, 5]);
      const meanX = xToCanvas(mean);
      ctx.moveTo(meanX, 0);
      ctx.lineTo(meanX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw 95% confidence interval
      const lowerBound = mean - 1.96 * std;
      const upperBound = mean + 1.96 * std;
      const lowerX = xToCanvas(lowerBound);
      const upperX = xToCanvas(upperBound);

      ctx.beginPath();
      ctx.strokeStyle = this.getCurrentTheme() ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
      ctx.setLineDash([2, 2]);
      ctx.moveTo(lowerX, 0);
      ctx.lineTo(lowerX, height);
      ctx.moveTo(upperX, 0);
      ctx.lineTo(upperX, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Add labels
      ctx.font = '14px "Lora", serif'; // Increased font size for better readability
      ctx.fillStyle = this.getCurrentTheme() ? 'black' : 'white';
      ctx.textAlign = 'center';

      // Distribution type label
      ctx.fillText('Normal Distribution', width / 2, 15);

      // Mean label
      ctx.fillText(`μ=${mean.toFixed(2)}`, meanX, 30);

      // Confidence interval labels
      ctx.fillText(`${lowerBound.toFixed(2)}`, lowerX, height - 5);
      ctx.fillText(`${upperBound.toFixed(2)}`, upperX, height - 5);

      // Standard deviation label
      ctx.fillText(`σ=${std.toFixed(2)}`, width / 2, height - 5);
    },

    drawUniformDistribution(ctx, width, height, min, max) {
      // Add padding to the range
      const range = max - min;
      const paddedMin = min - range * 0.1;
      const paddedMax = max + range * 0.1;

      // Function to convert x value to canvas x coordinate
      const xToCanvas = (x) => ((x - paddedMin) / (paddedMax - paddedMin)) * width;

      // Calculate rectangle coordinates
      const rectLeft = xToCanvas(min);
      const rectRight = xToCanvas(max);
      const rectTop = height * 0.1;
      const rectBottom = height * 0.9;
      const rectHeight = rectBottom - rectTop;
      const rectWidth = rectRight - rectLeft;

      // Draw the uniform distribution rectangle
      ctx.beginPath();
      ctx.rect(rectLeft, rectTop, rectWidth, rectHeight);
      ctx.fill();
      ctx.stroke();

      // Draw min and max lines
      ctx.beginPath();
      ctx.strokeStyle = this.getCurrentTheme() ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)';
      ctx.setLineDash([2, 2]);
      ctx.moveTo(rectLeft, 0);
      ctx.lineTo(rectLeft, height);
      ctx.moveTo(rectRight, 0);
      ctx.lineTo(rectRight, height);
      ctx.stroke();
      ctx.setLineDash([]);

      // Add labels
      ctx.font = '14px "Lora", serif'; // Increased font size for better readability
      ctx.fillStyle = this.getCurrentTheme() ? 'black' : 'white';
      ctx.textAlign = 'center';

      // Distribution type label
      ctx.fillText('Uniform Distribution', width / 2, 15);

      // Min and max labels
      ctx.fillText(`min=${min.toFixed(2)}`, rectLeft, height - 5);
      ctx.fillText(`max=${max.toFixed(2)}`, rectRight, height - 5);

      // Mean label
      const mean = (min + max) / 2;
      ctx.fillText(`mean=${mean.toFixed(2)}`, width / 2, height - 5);
    },

    drawAxes(ctx, width, height) {
      // Draw x-axis
      ctx.beginPath();
      ctx.strokeStyle = this.getCurrentTheme() ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, height);
      ctx.lineTo(width, height);
      ctx.stroke();
    },

    appendToExpression(value) {
      // Add space around operators for better readability
      if (['+', '-', '*', '/', '~', '_'].includes(value)) {
        // Don't add space if the expression is empty or ends with a space
        if (this.expression && !this.expression.endsWith(' ')) {
          this.expression += ' ';
        }
        this.expression += value;
        this.expression += ' ';
      } else {
        this.expression += value;
      }
    },
    clearExpression() {
      this.expression = '';
      this.result = null;
    },
    deleteLastCharacter() {
      // Handle spaces around operators
      if (this.expression.endsWith(' ')) {
        // If ends with space, remove the space
        this.expression = this.expression.slice(0, -1);

        // Check if the previous character is an operator
        const lastChar = this.expression.slice(-1);
        if (['+', '-', '*', '/', '~', '_'].includes(lastChar)) {
          // Remove the operator
          this.expression = this.expression.slice(0, -1);

          // Remove the space before the operator if it exists
          if (this.expression.endsWith(' ')) {
            this.expression = this.expression.slice(0, -1);
          }
        }
      } else {
        // Just remove the last character
        this.expression = this.expression.slice(0, -1);
      }
    },
    calculateResult() {
      try {
        this.result = this.evaluateExpression(this.expression);
      } catch (error) {
        this.result = { error: error.message };
      }
    },
    evaluateExpression(expr) {
      // Parse the expression and identify distributions
      const tokens = this.tokenizeExpression(expr);
      return this.evaluateTokens(tokens);
    },
    tokenizeExpression(expr) {
      // This is a simplified tokenizer that identifies numbers, operators, and distributions
      const tokens = [];
      let i = 0;

      while (i < expr.length) {
        const char = expr[i];

        // Handle numbers (including decimals)
        if (/[0-9.]/.test(char)) {
          let numStr = '';
          while (i < expr.length && /[0-9.]/.test(expr[i])) {
            numStr += expr[i];
            i++;
          }
          tokens.push({ type: 'number', value: parseFloat(numStr) });
          continue;
        }

        // Handle operators
        if (['+', '-', '*', '/', '~', '_'].includes(char)) {
          tokens.push({ type: 'operator', value: char });
          i++;
          continue;
        }

        // Skip whitespace
        if (/\s/.test(char)) {
          i++;
          continue;
        }

        // Unknown character
        throw new Error(`Unknown character: ${char}`);
      }

      return tokens;
    },
    evaluateTokens(tokens) {
      // First pass: identify distributions
      const processedTokens = [];
      let i = 0;

      while (i < tokens.length) {
        const token = tokens[i];

        // Check for distribution patterns (number ~ number or number _ number)
        if (i + 2 < tokens.length && 
            tokens[i].type === 'number' && 
            (tokens[i+1].value === '~' || tokens[i+1].value === '_') && 
            tokens[i+2].type === 'number') {

          const left = tokens[i].value;
          const operator = tokens[i+1].value;
          const right = tokens[i+2].value;

          if (operator === '~') {
            // Normal distribution
            processedTokens.push({
              type: 'distribution',
              distributionType: 'normal',
              mean: (left + right) / 2,
              std: (right - left) / (2 * 1.96) // 95% confidence interval
            });
          } else if (operator === '_') {
            // Uniform distribution
            processedTokens.push({
              type: 'distribution',
              distributionType: 'uniform',
              min: left,
              max: right
            });
          }

          i += 3; // Skip the three tokens we just processed
        } else {
          processedTokens.push(token);
          i++;
        }
      }

      // Second pass: evaluate the expression with distributions
      return this.evaluateMathExpression(processedTokens);
    },

    evaluateMathExpression(tokens) {
      if (tokens.length === 0) {
        return null;
      }

      // If there's only one token, return it
      if (tokens.length === 1) {
        return tokens[0];
      }

      // Handle operations in order of precedence: *, /, +, -

      // First, handle multiplication and division
      const afterMultDiv = this.applyOperations(tokens, ['*', '/']);

      // Then, handle addition and subtraction
      const result = this.applyOperations(afterMultDiv, ['+', '-']);

      // Return the final result (should be a single token)
      return result.length === 1 ? result[0] : { error: 'Invalid expression' };
    },

    applyOperations(tokens, operators) {
      if (tokens.length < 3) {
        return tokens;
      }

      const result = [tokens[0]];

      for (let i = 1; i < tokens.length; i += 2) {
        const operator = tokens[i];
        const rightOperand = tokens[i + 1];

        if (operator.type !== 'operator' || !operators.includes(operator.value)) {
          result.push(operator);
          if (rightOperand) {
            result.push(rightOperand);
          }
          continue;
        }

        const leftOperand = result.pop();

        if (!leftOperand || !rightOperand) {
          throw new Error('Invalid expression');
        }

        result.push(this.performOperation(leftOperand, operator.value, rightOperand));
      }

      return result;
    },

    performOperation(left, operator, right) {
      // Handle operations between numbers and distributions

      // If both operands are numbers, perform standard math
      if (left.type === 'number' && right.type === 'number') {
        let value;
        switch (operator) {
          case '+': value = left.value + right.value; break;
          case '-': value = left.value - right.value; break;
          case '*': value = left.value * right.value; break;
          case '/': 
            if (right.value === 0) throw new Error('Division by zero');
            value = left.value / right.value; 
            break;
          default: throw new Error(`Unknown operator: ${operator}`);
        }
        return { type: 'number', value };
      }

      // If one or both operands are distributions, handle accordingly

      // Normal distribution operations
      if (left.type === 'distribution' && left.distributionType === 'normal') {
        if (right.type === 'number') {
          // Operations between normal distribution and number
          switch (operator) {
            case '+': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean + right.value,
                std: left.std // std doesn't change when adding/subtracting constants
              };
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean - right.value,
                std: left.std
              };
            case '*': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean * right.value,
                std: Math.abs(left.std * right.value) // std scales with multiplication
              };
            case '/': 
              if (right.value === 0) throw new Error('Division by zero');
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean / right.value,
                std: Math.abs(left.std / right.value)
              };
          }
        } else if (right.type === 'distribution' && right.distributionType === 'normal') {
          // Operations between two normal distributions
          switch (operator) {
            case '+': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean + right.mean,
                std: Math.sqrt(left.std * left.std + right.std * right.std) // std adds in quadrature
              };
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean - right.mean,
                std: Math.sqrt(left.std * left.std + right.std * right.std)
              };
            // Multiplication and division of distributions is more complex
            // This is a simplified approximation
            case '*': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean * right.mean,
                std: Math.abs(left.mean * right.mean) * Math.sqrt(
                  (left.std / left.mean) ** 2 + (right.std / right.mean) ** 2
                )
              };
            case '/': 
              if (Math.abs(right.mean) < 0.0001) throw new Error('Division by distribution with mean near zero');
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean / right.mean,
                std: Math.abs(left.mean / right.mean) * Math.sqrt(
                  (left.std / left.mean) ** 2 + (right.std / right.mean) ** 2
                )
              };
          }
        } else if (right.type === 'distribution' && right.distributionType === 'uniform') {
          // Operations between normal and uniform distributions
          // Convert uniform to approximate normal for calculation
          const uniformMean = (right.min + right.max) / 2;
          const uniformStd = (right.max - right.min) / Math.sqrt(12); // Standard deviation of uniform distribution

          switch (operator) {
            case '+': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean + uniformMean,
                std: Math.sqrt(left.std * left.std + uniformStd * uniformStd)
              };
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean - uniformMean,
                std: Math.sqrt(left.std * left.std + uniformStd * uniformStd)
              };
            case '*': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean * uniformMean,
                std: Math.abs(left.mean * uniformMean) * Math.sqrt(
                  (left.std / left.mean) ** 2 + (uniformStd / uniformMean) ** 2
                )
              };
            case '/': 
              if (Math.abs(uniformMean) < 0.0001 || (right.min <= 0 && right.max >= 0)) 
                throw new Error('Division by distribution containing zero or with mean near zero');
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.mean / uniformMean,
                std: Math.abs(left.mean / uniformMean) * Math.sqrt(
                  (left.std / left.mean) ** 2 + (uniformStd / uniformMean) ** 2
                )
              };
          }
        }
      }

      // Uniform distribution operations
      if (left.type === 'distribution' && left.distributionType === 'uniform') {
        if (right.type === 'number') {
          // Operations between uniform distribution and number
          switch (operator) {
            case '+': 
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: left.min + right.value,
                max: left.max + right.value
              };
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: left.min - right.value,
                max: left.max - right.value
              };
            case '*': 
              // Multiplication can flip the bounds if multiplying by negative
              const products = [
                left.min * right.value,
                left.max * right.value
              ].sort((a, b) => a - b);
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: products[0],
                max: products[1]
              };
            case '/': 
              if (right.value === 0) throw new Error('Division by zero');
              // Division can flip the bounds if dividing by negative
              const quotients = [
                left.min / right.value,
                left.max / right.value
              ].sort((a, b) => a - b);
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: quotients[0],
                max: quotients[1]
              };
          }
        } else if (right.type === 'distribution' && right.distributionType === 'uniform') {
          // Operations between two uniform distributions
          switch (operator) {
            case '+': 
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: left.min + right.min,
                max: left.max + right.max
              };
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: left.min - right.max,
                max: left.max - right.min
              };
            case '*': 
              // Multiplication of two uniform distributions
              // Need to consider all possible combinations of min/max values
              const products = [
                left.min * right.min,
                left.min * right.max,
                left.max * right.min,
                left.max * right.max
              ].sort((a, b) => a - b);
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: products[0],
                max: products[products.length - 1]
              };
            case '/': 
              if (right.min <= 0 && right.max >= 0) throw new Error('Division by uniform distribution containing zero');
              // Division of two uniform distributions
              // Need to consider all possible combinations of min/max values
              const quotients = [
                left.min / right.min,
                left.min / right.max,
                left.max / right.min,
                left.max / right.max
              ].sort((a, b) => a - b);
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: quotients[0],
                max: quotients[quotients.length - 1]
              };
          }
        } else if (right.type === 'distribution' && right.distributionType === 'normal') {
          // Operations between uniform and normal distributions
          // Convert uniform to approximate normal for calculation
          const uniformMean = (left.min + left.max) / 2;
          const uniformStd = (left.max - left.min) / Math.sqrt(12); // Standard deviation of uniform distribution

          switch (operator) {
            case '+': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: uniformMean + right.mean,
                std: Math.sqrt(uniformStd * uniformStd + right.std * right.std)
              };
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: uniformMean - right.mean,
                std: Math.sqrt(uniformStd * uniformStd + right.std * right.std)
              };
            case '*': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: uniformMean * right.mean,
                std: Math.abs(uniformMean * right.mean) * Math.sqrt(
                  (uniformStd / uniformMean) ** 2 + (right.std / right.mean) ** 2
                )
              };
            case '/': 
              if (Math.abs(right.mean) < 0.0001) 
                throw new Error('Division by distribution with mean near zero');
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: uniformMean / right.mean,
                std: Math.abs(uniformMean / right.mean) * Math.sqrt(
                  (uniformStd / uniformMean) ** 2 + (right.std / right.mean) ** 2
                )
              };
          }
        }
      }

      // Handle number on the right and distribution on the left
      if (left.type === 'number' && right.type === 'distribution') {
        // For commutative operations, swap the operands
        if (operator === '+' || operator === '*') {
          return this.performOperation(right, operator, left);
        }

        // For non-commutative operations (- and /), handle specially
        if (right.distributionType === 'normal') {
          switch (operator) {
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.value - right.mean,
                std: right.std // std doesn't change when subtracting
              };
            case '/': 
              if (Math.abs(right.mean) < 0.0001) throw new Error('Division by distribution with mean near zero');
              // This is a simplified approximation
              return {
                type: 'distribution',
                distributionType: 'normal',
                mean: left.value / right.mean,
                std: Math.abs(left.value / right.mean) * (right.std / right.mean)
              };
          }
        } else if (right.distributionType === 'uniform') {
          switch (operator) {
            case '-': 
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: left.value - right.max,
                max: left.value - right.min
              };
            case '/': 
              if (right.min <= 0 && right.max >= 0) throw new Error('Division by uniform distribution containing zero');
              // Division can flip the bounds if dividing by negative range
              const quotients = [
                left.value / right.min,
                left.value / right.max
              ].sort((a, b) => a - b);
              return {
                type: 'distribution',
                distributionType: 'uniform',
                min: quotients[0],
                max: quotients[1]
              };
          }
        }
      }

      throw new Error('Unsupported operation between these types');
    },
    formatResult(result) {
      if (result === null) return '';

      if (result.error) {
        return `Error: ${result.error}`;
      }

      if (result.type === 'number') {
        return result.value.toString();
      }

      if (result.type === 'distribution') {
        if (result.distributionType === 'normal') {
          const lower = result.mean - 1.96 * result.std;
          const upper = result.mean + 1.96 * result.std;
          return `Normal distribution: μ=${result.mean.toFixed(2)}, σ=${result.std.toFixed(2)} (95% between ${lower.toFixed(2)} and ${upper.toFixed(2)})`;
        }

        if (result.distributionType === 'uniform') {
          return `Uniform distribution: min=${result.min.toFixed(2)}, max=${result.max.toFixed(2)}`;
        }
      }

      return 'Unknown result type';
    }
  }
}
</script>

<style scoped>
.blog-post {
  font-family: var(--font-body);
  line-height: 1.8;
  margin-bottom: 3rem;
}

.post-content {
  margin-bottom: 3rem;
}

.post-intro {
  font-size: 1.2rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  font-style: italic;
  border-left: 3px solid var(--color-text);
  padding-left: 1rem;
}

.calculator-main {
  margin-bottom: 3rem;
}

.calculator-section {
  width: 100%;
  margin-bottom: 2rem;
}

.calculator-display {
  background-color: var(--color-background);
  border: 1px solid var(--color-text);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  min-height: 80px;
  color: var(--color-text);
  font-family: var(--font-body);
}

.input-display {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  text-align: right;
  overflow-x: auto;
  white-space: nowrap;
  font-family: var(--font-body);
}

.result-display {
  font-size: 1rem;
  color: var(--color-text);
  text-align: right;
  border-top: 1px solid var(--divider);
  padding-top: 0.8rem;
  font-family: var(--font-body);
}

.visualization-container {
  margin-bottom: 3rem;
}

.visualization-container h3 {
  margin-bottom: 1rem;
  font-family: var(--font-heading);
  font-style: italic;
}

.visualization-section {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.distribution-visualization {
  padding: 1.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-text);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.distribution-visualization canvas {
  background-color: var(--color-background);
  border: 1px solid var(--divider);
  width: 100%;
  max-height: 350px; /* Increased height for better visualization */
}

.empty-visualization {
  padding: 3rem 1.5rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-text);
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 350px; /* Increased to match the canvas height */
  color: var(--divider);
  font-style: italic;
}

.calculator-keypad {
  display: flex;
  gap: 1.5rem;
  width: 100%;
}

.number-pad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  flex: 3;
}

.number-pad button:nth-child(13) {
  /* Position the backspace button */
  grid-column: span 2;
}

.operator-pad {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  flex: 2;
}

/* Increase size of operator buttons by 50%, except for division */
.operator-pad button:not(:nth-child(4)) {
  padding: 1.5rem;
  font-size: 1.8rem;
}

.operator-pad button:last-child {
  /* Make the equals button span 2 columns */
  grid-column: span 2;
}

button {
  padding: 1rem;
  font-size: 1.2rem;
  border: 1px solid var(--color-text);
  background-color: var(--color-background);
  color: var(--color-text);
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body);
}

button:hover {
  background-color: var(--color-text);
  color: var(--color-background);
}

button:active {
  transform: translateY(1px);
}

.equals-button {
  background-color: var(--color-text);
  color: var(--color-background);
  font-weight: bold;
}

.equals-button:hover {
  background-color: var(--color-border-hover);
}

button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.instructions {
  padding: 2rem;
  border: 1px solid var(--color-text);
  margin-top: 2rem;
  font-family: var(--font-body);
}

.instructions h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-family: var(--font-heading);
  font-style: italic;
}

.instructions h4 {
  margin: 1.5rem 0 1rem;
  font-family: var(--font-heading);
  font-style: italic;
}

.instructions ul {
  margin-left: 1.5rem;
  line-height: 1.8;
}

.instructions li {
  margin-bottom: 0.5rem;
}

/* Responsive layout for smaller screens */
@media (max-width: 768px) {
  .calculator-keypad {
    flex-direction: column;
  }

  .number-pad, 
  .operator-pad {
    width: 100%;
  }

  .number-pad button:nth-child(13) {
    /* Backspace button spans only 1 column on small screens */
    grid-column: span 1;
  }

  .operator-pad button:last-child {
    /* Equals button spans full width on small screens */
    grid-column: 1 / -1;
  }
}
</style>
