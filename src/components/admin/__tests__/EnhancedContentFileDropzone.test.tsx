
import "@testing-library/jest-dom";
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedContentFileDropzone from '../EnhancedContentFileDropzone';

describe('EnhancedContentFileDropzone Component', () => {
  const mockOnDrop = jest.fn();

  const baseProps = {
    onDrop: mockOnDrop,
    isDragActive: false,
    getRootProps: () => ({}),
    getInputProps: () => ({}),
    role: "admin",
    maxSize: 52428800,
  };

  it('renders without crashing', () => {
    render(<EnhancedContentFileDropzone {...baseProps} />);
    expect(screen.getByText('Drag & drop files here, or click to select')).toBeInTheDocument();
    expect(screen.getByText(/Supports images and videos/i)).toBeInTheDocument();
    expect(screen.getByText(/Max file size/i)).toBeInTheDocument();
  });

  it('renders drag active style and message', () => {
    render(<EnhancedContentFileDropzone {...baseProps} isDragActive />);
    expect(screen.getByText('Drop the files here...')).toBeInTheDocument();
  });

  it('forwards correct ARIA attributes', () => {
    render(<EnhancedContentFileDropzone {...baseProps} />);
    const dropzone = screen.getByRole('button');
    expect(dropzone).toHaveAttribute('aria-label');
    expect(dropzone).toHaveAttribute('aria-describedby');
    expect(dropzone).toHaveAttribute('tabIndex', '0');
  });

  it('calls getInputProps and getRootProps functions', () => {
    const getInputProps = jest.fn(() => ({}));
    const getRootProps = jest.fn(() => ({}));
    render(
      <EnhancedContentFileDropzone
        {...baseProps}
        getInputProps={getInputProps}
        getRootProps={getRootProps}
      />
    );
    expect(getRootProps).toHaveBeenCalled();
    expect(getInputProps).toHaveBeenCalled();
  });
});
