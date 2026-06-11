import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsToggle } from '../components/SettingsToggle';

describe('SettingsToggle', () => {
  it('renders correctly with labels', () => {
    render(<SettingsToggle 
      value={true} 
      onLabel="On" 
      offLabel="Off" 
      onChange={() => {}} 
      onClose={() => {}} 
    />);
    expect(screen.getByText('On')).toBeInTheDocument();
    expect(screen.getByText('Off')).toBeInTheDocument();
  });

  it('calls onChange and onClose when "on" button is clicked', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<SettingsToggle 
      value={false} 
      onLabel="On" 
      offLabel="Off" 
      onChange={onChange} 
      onClose={onClose} 
    />);
    
    fireEvent.click(screen.getByText('On'));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onChange and onClose when "off" button is clicked', () => {
    const onChange = vi.fn();
    const onClose = vi.fn();
    render(<SettingsToggle 
      value={true} 
      onLabel="On" 
      offLabel="Off" 
      onChange={onChange} 
      onClose={onClose} 
    />);
    
    fireEvent.click(screen.getByText('Off'));
    expect(onChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('applies correct classes for active and inactive states', () => {
    const { rerender } = render(<SettingsToggle 
      value={true} 
      onLabel="On" 
      offLabel="Off" 
      onChange={() => {}} 
      onClose={() => {}} 
    />);
    
    // The "on" button (first button) should have the active style when value is true
    // toggleClass(true) = 'bg-purple-500 text-white'
    const onButton = screen.getByRole('button', { name: /on/i });
    expect(onButton.className).toContain('bg-purple-500');
    expect(onButton.className).toContain('text-white');

    // The "off" button should have the inactive style
    // toggleClass(!true) = toggleClass(false) = 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    const offButton = screen.getByRole('button', { name: /off/i });
    expect(offButton.className).toContain('bg-gray-700');
    expect(offButton.className).toContain('text-gray-300');
  });

  it('disables the "on" button when disabled prop is true', () => {
    render(<SettingsToggle 
      value={false} 
      onLabel="On" 
      offLabel="Off" 
      onChange={() => {}} 
      onClose={() => {}} 
      disabled={true}
    />);
    
    const onButton = screen.getByRole('button', { name: /on/i });
    expect(onButton).toBeDisabled();
    expect(onButton.className).toContain('bg-gray-800');
    expect(onButton.className).toContain('text-gray-500');
  });

});
