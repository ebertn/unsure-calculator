import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeToggle from '@/components/ThemeToggle.vue';

describe('ThemeToggle.vue', () => {
  it('should render correctly with default theme', () => {
    const wrapper = mount(ThemeToggle);

    // Check if the component renders
    expect(wrapper.exists()).toBe(true);

    // Check if the button exists
    const button = wrapper.find('button');
    expect(button.exists()).toBe(true);

    // Check if the button has the correct text based on the default theme
    // Default theme is dark (isDarkTheme = true), so button should show sun emoji
    expect(button.text()).toBe('☀️');
  });

  it('should toggle theme when button is clicked', async () => {
    const wrapper = mount(ThemeToggle);

    // Initial state: isDarkTheme = true (dark theme)
    expect(wrapper.vm.isDarkTheme).toBe(true);

    // Click the button to toggle the theme
    await wrapper.find('button').trigger('click');

    // After click: isDarkTheme should be toggled to false (light theme)
    expect(wrapper.vm.isDarkTheme).toBe(false);

    // Button text should change to moon emoji
    expect(wrapper.find('button').text()).toBe('🌙');

    // Click again to toggle back
    await wrapper.find('button').trigger('click');

    // Should be back to dark theme
    expect(wrapper.vm.isDarkTheme).toBe(true);
    expect(wrapper.find('button').text()).toBe('☀️');
  });

  it('should emit theme-changed event when toggled', async () => {
    const wrapper = mount(ThemeToggle);

    // Click the button to toggle the theme
    await wrapper.find('button').trigger('click');

    // Check if the theme-changed event was emitted
    expect(wrapper.emitted()).toHaveProperty('theme-changed');

    // Check if the event payload is correct (should be the new isDarkTheme value)
    expect(wrapper.emitted()['theme-changed'][0]).toEqual([false]);

    // Click again to toggle back
    await wrapper.find('button').trigger('click');

    // Check the second event emission
    expect(wrapper.emitted()['theme-changed']).toHaveLength(2);
    expect(wrapper.emitted()['theme-changed'][1]).toEqual([true]);
  });

  it('should toggle the dark-theme class on the body element', async () => {
    // Mock document.body.classList.toggle
    const originalToggle = document.body.classList.toggle;
    document.body.classList.toggle = vi.fn();

    const wrapper = mount(ThemeToggle);

    // Click the button to toggle the theme
    await wrapper.find('button').trigger('click');

    // Check if the toggle method was called with the correct arguments
    expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', true);

    // Click again to toggle back
    await wrapper.find('button').trigger('click');

    // Check if the toggle method was called again with the correct arguments
    expect(document.body.classList.toggle).toHaveBeenCalledWith('dark-theme', false);

    // Restore the original toggle method
    document.body.classList.toggle = originalToggle;
  });
});
