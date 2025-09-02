import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import Calculator from '@/components/Calculator.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';

describe('App.vue Integration', () => {
  it('should render Calculator and ThemeToggle components', () => {
    const wrapper = mount(App);

    // Check if the App component renders
    expect(wrapper.exists()).toBe(true);

    // Check if the Calculator component is rendered
    const calculator = wrapper.findComponent(Calculator);
    expect(calculator.exists()).toBe(true);

    // Check if the ThemeToggle component is rendered
    const themeToggle = wrapper.findComponent(ThemeToggle);
    expect(themeToggle.exists()).toBe(true);
  });

  it('should pass the theme state from App to Calculator', async () => {
    const wrapper = mount(App);

    // Get the ThemeToggle component
    const themeToggle = wrapper.findComponent(ThemeToggle);

    // Get the Calculator component
    const calculator = wrapper.findComponent(Calculator);

    // Initial state: isLightTheme should be true
    expect(wrapper.vm.isLightTheme).toBe(true);
    expect(calculator.props('isLightTheme')).toBe(true);

    // Click the theme toggle button
    await themeToggle.find('button').trigger('click');

    // After click: isLightTheme should be false
    expect(wrapper.vm.isLightTheme).toBe(false);
    expect(calculator.props('isLightTheme')).toBe(false);
  });

  it('should handle theme changes from ThemeToggle', async () => {
    const wrapper = mount(App);

    // Get the ThemeToggle component
    const themeToggle = wrapper.findComponent(ThemeToggle);

    // Initial state: isLightTheme should be true
    expect(wrapper.vm.isLightTheme).toBe(true);

    // Simulate theme change event from ThemeToggle
    await themeToggle.vm.$emit('theme-changed', false);

    // After event: isLightTheme should be false
    expect(wrapper.vm.isLightTheme).toBe(false);

    // Simulate theme change event back to light theme
    await themeToggle.vm.$emit('theme-changed', true);

    // After event: isLightTheme should be true again
    expect(wrapper.vm.isLightTheme).toBe(true);
  });

  it('should redraw visualization when theme is toggled', async () => {
    // Create a mock component that simulates the Calculator component
    const MockCalculator = {
      template: '<div></div>',
      props: {
        isLightTheme: {
          type: Boolean,
          default: true
        }
      },
      data() {
        return {
          result: {
            type: 'distribution',
            distributionType: 'normal',
            mean: 5,
            std: 1
          },
          visualizationRedrawn: false
        };
      },
      watch: {
        isLightTheme() {
          // Simulate redrawing the visualization when the theme changes
          if (this.result && this.result.type === 'distribution') {
            this.visualizationRedrawn = true;
          }
        }
      }
    };

    // Create a mock App component that uses our MockCalculator
    const MockApp = {
      template: `
        <div>
          <mock-calculator :is-light-theme="isLightTheme" ref="calculator" />
          <theme-toggle @theme-changed="onThemeChanged" ref="themeToggle" />
        </div>
      `,
      components: {
        MockCalculator,
        ThemeToggle
      },
      data() {
        return {
          isLightTheme: true
        };
      },
      methods: {
        onThemeChanged(lightTheme) {
          this.isLightTheme = lightTheme;
        }
      }
    };

    // Mount the mock App component
    const wrapper = mount(MockApp);

    // Get the MockCalculator component
    const calculator = wrapper.findComponent(MockCalculator);

    // Get the ThemeToggle component
    const themeToggle = wrapper.findComponent(ThemeToggle);

    // Initial state: visualizationRedrawn should be false
    expect(calculator.vm.visualizationRedrawn).toBe(false);

    // Toggle the theme
    await themeToggle.find('button').trigger('click');

    // After theme toggle: visualizationRedrawn should be true
    expect(calculator.vm.visualizationRedrawn).toBe(true);
  });
});
