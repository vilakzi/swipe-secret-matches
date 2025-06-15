import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { EnhancedContentFilePreview } from '../EnhancedContentFilePreview';

describe('EnhancedContentFilePreview Component', () => {
  const mockFile = new File(['(binary data)'], 'test-file.txt', { type: 'text/plain' });

  it('renders file name and size correctly', () => {
    render(<EnhancedContentFilePreview file={mockFile} />);
    expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    expect(screen.getByText('0 Bytes')).toBeInTheDocument(); // Size will be 0 in this mock
  });

  it('displays an appropriate icon based on file type', () => {
    render(<EnhancedContentFilePreview file={mockFile} />);
    // This test might need adjustment based on how icons are actually rendered.
    // For example, if you're using a specific component for icons, check for that component.
    // Here, I'm just checking for some text related to the file type.
    expect(screen.getByText(/txt/i)).toBeInTheDocument(); // Adjust this based on your actual implementation
  });

  it('applies custom styles correctly', () => {
    const customStyle = { backgroundColor: 'red' };
    render(<EnhancedContentFilePreview file={mockFile} style={customStyle} />);
    const previewElement = screen.getByText('test-file.txt').closest('div'); // Adjust based on your component structure
    expect(previewElement).toHaveStyle('background-color: red');
  });

  it('handles image files correctly', () => {
    const mockImageFile = new File(['(binary data)'], 'test-image.png', { type: 'image/png' });
    render(<EnhancedContentFilePreview file={mockImageFile} />);
    const imgElement = screen.getByAltText('Preview of test-image.png');
    expect(imgElement).toBeInTheDocument();
  });

  it('handles video files correctly', () => {
    const mockVideoFile = new File(['(binary data)'], 'test-video.mp4', { type: 'video/mp4' });
    render(<EnhancedContentFilePreview file={mockVideoFile} />);
    const videoElement = screen.getByRole('video');
    expect(videoElement).toBeInTheDocument();
  });

  it('provides a default preview for unknown file types', () => {
    const mockUnknownFile = new File(['(binary data)'], 'test-file.unknown', { type: 'application/unknown' });
    render(<EnhancedContentFilePreview file={mockUnknownFile} />);
    // Check for a default icon or message that indicates an unknown file type
    expect(screen.getByText(/unknown/i)).toBeInTheDocument(); // Adjust based on your actual implementation
  });
});
