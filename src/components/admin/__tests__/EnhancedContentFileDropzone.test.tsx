import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EnhancedContentFileDropzone from '../EnhancedContentFileDropzone';

describe('EnhancedContentFileDropzone Component', () => {
  const mockSetFieldValue = jest.fn();

  const renderComponent = (props = {}) => {
    render(
      <EnhancedContentFileDropzone
        setFieldValue={mockSetFieldValue}
        {...props}
      />
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Drag n\' drop some files here, or click to select files')).toBeInTheDocument();
  });

  it('allows file selection via click', () => {
    renderComponent();
    const fileInput = screen.getByLabelText('Upload a file') as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(mockSetFieldValue).toHaveBeenCalledWith('files', [mockFile]);
  });

  it('handles drag and drop events', () => {
    renderComponent();
    const dropzone = screen.getByRole('button', {
      name: 'Drag n\' drop some files here, or click to select files'
    });

    const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const mockEvent = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: {
        files: [mockFile],
      },
    };

    fireEvent.dragEnter(dropzone, mockEvent);
    fireEvent.dragOver(dropzone, mockEvent);
    fireEvent.drop(dropzone, mockEvent);

    expect(mockSetFieldValue).toHaveBeenCalledWith('files', [mockFile]);
  });

  it('displays an error message when too many files are selected', () => {
    renderComponent({ maxFiles: 1 });
    const fileInput = screen.getByLabelText('Upload a file') as HTMLInputElement;

    const mockFile1 = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    const mockFile2 = new File(['world'], 'world.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [mockFile1, mockFile2] } });

    expect(screen.getByText('You can only upload up to 1 files')).toBeInTheDocument();
  });

  it('accepts specific file types', () => {
    const accept = 'image/jpeg, image/png';
    renderComponent({ accept });
    const dropzone = screen.getByRole('button', {
      name: 'Drag n\' drop some files here, or click to select files'
    });

    expect(dropzone).toHaveAttribute('accept', accept);
  });

  it('calls onFileAccepted when a file is accepted', () => {
    const onFileAccepted = jest.fn();
    renderComponent({ onFileAccepted });
    const fileInput = screen.getByLabelText('Upload a file') as HTMLInputElement;

    const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(onFileAccepted).toHaveBeenCalledWith([mockFile]);
  });

  it('calls onFileRejected when a file is rejected', () => {
    const onFileRejected = jest.fn();
    renderComponent({ onFileRejected, accept: 'image/jpeg' });
    const fileInput = screen.getByLabelText('Upload a file') as HTMLInputElement;

    const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
    fireEvent.change(fileInput, { target: { files: [mockFile] } });

    expect(onFileRejected).toHaveBeenCalled();
  });
});
