import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Calculator from '@/components/Calculator.vue';

describe('Calculator.vue', () => {
  // Helper function to access component methods
  const getCalculatorMethods = () => {
    const wrapper = mount(Calculator);
    return wrapper.vm;
  };

  describe('tokenizeExpression', () => {
    it('should tokenize numbers correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = calculator.tokenizeExpression('123 456 7.89');

      expect(tokens).toEqual([
        { type: 'number', value: 123 },
        { type: 'number', value: 456 },
        { type: 'number', value: 7.89 }
      ]);
    });

    it('should tokenize operators correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = calculator.tokenizeExpression('+ - * / ~ _');

      expect(tokens).toEqual([
        { type: 'operator', value: '+' },
        { type: 'operator', value: '-' },
        { type: 'operator', value: '*' },
        { type: 'operator', value: '/' },
        { type: 'operator', value: '~' },
        { type: 'operator', value: '_' }
      ]);
    });

    it('should tokenize a mixed expression correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = calculator.tokenizeExpression('123 + 456 * 7.89');

      expect(tokens).toEqual([
        { type: 'number', value: 123 },
        { type: 'operator', value: '+' },
        { type: 'number', value: 456 },
        { type: 'operator', value: '*' },
        { type: 'number', value: 7.89 }
      ]);
    });

    it('should handle distribution expressions correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = calculator.tokenizeExpression('4 ~ 6');

      expect(tokens).toEqual([
        { type: 'number', value: 4 },
        { type: 'operator', value: '~' },
        { type: 'number', value: 6 }
      ]);
    });

    it('should throw an error for unknown characters', () => {
      const calculator = getCalculatorMethods();

      expect(() => calculator.tokenizeExpression('123 $ 456')).toThrow('Unknown character: $');
    });
  });

  describe('evaluateTokens', () => {
    it('should evaluate normal distributions correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 4 },
        { type: 'operator', value: '~' },
        { type: 'number', value: 6 }
      ];

      const result = calculator.evaluateTokens(tokens);

      expect(result.type).toBe('distribution');
      expect(result.distributionType).toBe('normal');
      expect(result.mean).toBe(5); // (4 + 6) / 2
      expect(result.std).toBeCloseTo(0.51, 2); // (6 - 4) / (2 * 1.96)
    });

    it('should evaluate uniform distributions correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 4 },
        { type: 'operator', value: '_' },
        { type: 'number', value: 6 }
      ];

      const result = calculator.evaluateTokens(tokens);

      expect(result.type).toBe('distribution');
      expect(result.distributionType).toBe('uniform');
      expect(result.min).toBe(4);
      expect(result.max).toBe(6);
    });

    it('should evaluate mixed expressions with distributions and numbers', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 2 },
        { type: 'operator', value: '+' },
        { type: 'number', value: 4 },
        { type: 'operator', value: '~' },
        { type: 'number', value: 6 }
      ];

      const result = calculator.evaluateTokens(tokens);

      // The result should be a number (2) plus a normal distribution (mean 5, std 0.51)
      expect(result.type).toBe('distribution');
      expect(result.distributionType).toBe('normal');
      expect(result.mean).toBe(7); // 2 + 5
      expect(result.std).toBeCloseTo(0.51, 2); // std doesn't change when adding a constant
    });

    it('should evaluate expressions without distributions', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 2 },
        { type: 'operator', value: '+' },
        { type: 'number', value: 3 }
      ];

      const result = calculator.evaluateTokens(tokens);

      expect(result.type).toBe('number');
      expect(result.value).toBe(5); // 2 + 3
    });
  });

  describe('evaluateMathExpression', () => {
    it('should evaluate simple arithmetic expressions correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 2 },
        { type: 'operator', value: '+' },
        { type: 'number', value: 3 }
      ];

      const result = calculator.evaluateMathExpression(tokens);

      expect(result.type).toBe('number');
      expect(result.value).toBe(5);
    });

    it('should respect order of operations (multiplication before addition)', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 2 },
        { type: 'operator', value: '+' },
        { type: 'number', value: 3 },
        { type: 'operator', value: '*' },
        { type: 'number', value: 4 }
      ];

      const result = calculator.evaluateMathExpression(tokens);

      expect(result.type).toBe('number');
      expect(result.value).toBe(14); // 2 + (3 * 4) = 2 + 12 = 14
    });

    it('should handle division correctly', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 10 },
        { type: 'operator', value: '/' },
        { type: 'number', value: 2 }
      ];

      const result = calculator.evaluateMathExpression(tokens);

      expect(result.type).toBe('number');
      expect(result.value).toBe(5);
    });

    it('should return a single token unchanged', () => {
      const calculator = getCalculatorMethods();
      const tokens = [
        { type: 'number', value: 42 }
      ];

      const result = calculator.evaluateMathExpression(tokens);

      expect(result).toEqual({ type: 'number', value: 42 });
    });

    it('should return null for empty tokens', () => {
      const calculator = getCalculatorMethods();
      const tokens = [];

      const result = calculator.evaluateMathExpression(tokens);

      expect(result).toBeNull();
    });
  });

  describe('performOperation', () => {
    // Test operations between numbers
    describe('operations between numbers', () => {
      it('should add two numbers correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { type: 'number', value: 2 };
        const right = { type: 'number', value: 3 };

        const result = calculator.performOperation(left, '+', right);

        expect(result.type).toBe('number');
        expect(result.value).toBe(5);
      });

      it('should subtract two numbers correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { type: 'number', value: 5 };
        const right = { type: 'number', value: 3 };

        const result = calculator.performOperation(left, '-', right);

        expect(result.type).toBe('number');
        expect(result.value).toBe(2);
      });

      it('should multiply two numbers correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { type: 'number', value: 2 };
        const right = { type: 'number', value: 3 };

        const result = calculator.performOperation(left, '*', right);

        expect(result.type).toBe('number');
        expect(result.value).toBe(6);
      });

      it('should divide two numbers correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { type: 'number', value: 6 };
        const right = { type: 'number', value: 2 };

        const result = calculator.performOperation(left, '/', right);

        expect(result.type).toBe('number');
        expect(result.value).toBe(3);
      });

      it('should throw an error when dividing by zero', () => {
        const calculator = getCalculatorMethods();
        const left = { type: 'number', value: 6 };
        const right = { type: 'number', value: 0 };

        expect(() => calculator.performOperation(left, '/', right)).toThrow('Division by zero');
      });
    });

    // Test operations between normal distributions and numbers
    describe('operations between normal distributions and numbers', () => {
      it('should add a number to a normal distribution correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { 
          type: 'distribution', 
          distributionType: 'normal', 
          mean: 5, 
          std: 1 
        };
        const right = { type: 'number', value: 3 };

        const result = calculator.performOperation(left, '+', right);

        expect(result.type).toBe('distribution');
        expect(result.distributionType).toBe('normal');
        expect(result.mean).toBe(8); // 5 + 3
        expect(result.std).toBe(1); // std doesn't change when adding constants
      });

      it('should multiply a normal distribution by a number correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { 
          type: 'distribution', 
          distributionType: 'normal', 
          mean: 5, 
          std: 1 
        };
        const right = { type: 'number', value: 2 };

        const result = calculator.performOperation(left, '*', right);

        expect(result.type).toBe('distribution');
        expect(result.distributionType).toBe('normal');
        expect(result.mean).toBe(10); // 5 * 2
        expect(result.std).toBe(2); // 1 * 2
      });
    });

    // Test operations between uniform distributions and numbers
    describe('operations between uniform distributions and numbers', () => {
      it('should add a number to a uniform distribution correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { 
          type: 'distribution', 
          distributionType: 'uniform', 
          min: 4, 
          max: 6 
        };
        const right = { type: 'number', value: 3 };

        const result = calculator.performOperation(left, '+', right);

        expect(result.type).toBe('distribution');
        expect(result.distributionType).toBe('uniform');
        expect(result.min).toBe(7); // 4 + 3
        expect(result.max).toBe(9); // 6 + 3
      });

      it('should multiply a uniform distribution by a negative number correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { 
          type: 'distribution', 
          distributionType: 'uniform', 
          min: 4, 
          max: 6 
        };
        const right = { type: 'number', value: -2 };

        const result = calculator.performOperation(left, '*', right);

        expect(result.type).toBe('distribution');
        expect(result.distributionType).toBe('uniform');
        expect(result.min).toBe(-12); // 6 * -2 (flipped due to negative)
        expect(result.max).toBe(-8); // 4 * -2 (flipped due to negative)
      });
    });

    // Test operations between two distributions
    describe('operations between two distributions', () => {
      it('should add two normal distributions correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { 
          type: 'distribution', 
          distributionType: 'normal', 
          mean: 5, 
          std: 1 
        };
        const right = { 
          type: 'distribution', 
          distributionType: 'normal', 
          mean: 3, 
          std: 2 
        };

        const result = calculator.performOperation(left, '+', right);

        expect(result.type).toBe('distribution');
        expect(result.distributionType).toBe('normal');
        expect(result.mean).toBe(8); // 5 + 3
        expect(result.std).toBeCloseTo(2.236, 3); // sqrt(1^2 + 2^2)
      });

      it('should add a normal and uniform distribution correctly', () => {
        const calculator = getCalculatorMethods();
        const left = { 
          type: 'distribution', 
          distributionType: 'normal', 
          mean: 5, 
          std: 1 
        };
        const right = { 
          type: 'distribution', 
          distributionType: 'uniform', 
          min: 4, 
          max: 6 
        };

        const result = calculator.performOperation(left, '+', right);

        expect(result.type).toBe('distribution');
        expect(result.distributionType).toBe('normal');
        expect(result.mean).toBe(10); // 5 + (4+6)/2
        // std calculation is more complex, just check it's a reasonable value
        expect(result.std).toBeGreaterThan(1);
      });
    });
  });

  describe('formatResult', () => {
    it('should format a number result correctly', () => {
      const calculator = getCalculatorMethods();
      const result = { type: 'number', value: 42 };

      const formatted = calculator.formatResult(result);

      expect(formatted).toBe('42');
    });

    it('should format a normal distribution result correctly', () => {
      const calculator = getCalculatorMethods();
      const result = { 
        type: 'distribution', 
        distributionType: 'normal', 
        mean: 5, 
        std: 1 
      };

      const formatted = calculator.formatResult(result);

      expect(formatted).toContain('Normal distribution');
      expect(formatted).toContain('μ=5.00');
      expect(formatted).toContain('σ=1.00');
      expect(formatted).toContain('95% between');
      // Check for the confidence interval values (mean ± 1.96*std)
      expect(formatted).toContain('3.04');
      expect(formatted).toContain('6.96');
    });

    it('should format a uniform distribution result correctly', () => {
      const calculator = getCalculatorMethods();
      const result = { 
        type: 'distribution', 
        distributionType: 'uniform', 
        min: 4, 
        max: 6 
      };

      const formatted = calculator.formatResult(result);

      expect(formatted).toContain('Uniform distribution');
      expect(formatted).toContain('min=4.00');
      expect(formatted).toContain('max=6.00');
    });

    it('should format an error result correctly', () => {
      const calculator = getCalculatorMethods();
      const result = { error: 'Division by zero' };

      const formatted = calculator.formatResult(result);

      expect(formatted).toBe('Error: Division by zero');
    });

    it('should handle null result', () => {
      const calculator = getCalculatorMethods();
      const result = null;

      const formatted = calculator.formatResult(result);

      expect(formatted).toBe('');
    });

    it('should handle unknown result type', () => {
      const calculator = getCalculatorMethods();
      const result = { type: 'unknown' };

      const formatted = calculator.formatResult(result);

      expect(formatted).toBe('Unknown result type');
    });
  });
});
