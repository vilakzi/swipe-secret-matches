
import '@testing-library/jest-dom';
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EnhancedContentFilePreview from "../EnhancedContentFilePreview";

describe("EnhancedContentFilePreview", () => {
  const mockFile = new File(["(⌐□_□)"], "cool.png", { type: "image/png" });
  const baseProps = {
    uploadFile: {
      id: "file-1",
      file: mockFile,
      preview: "blob:http://localhost/fake-url",
      type: "image",
    },
    onRemove: jest.fn(),
  };

  it("renders file preview with correct alt text and ARIA", () => {
    render(<EnhancedContentFilePreview {...baseProps} />);
    expect(screen.getByAltText(/Preview of image file cool.png/)).toBeInTheDocument();
    expect(screen.getByText("image")).toBeInTheDocument();
    expect(screen.getByText("cool.png")).toBeInTheDocument();
  });

  it("renders the remove button and calls onRemove", () => {
    render(<EnhancedContentFilePreview {...baseProps} />);
    const button = screen.getByLabelText(/Remove file cool.png/);
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(baseProps.onRemove).toHaveBeenCalledWith("file-1");
  });

  it("renders duplicate badge if isDuplicate is true", () => {
    render(
      <EnhancedContentFilePreview
        {...baseProps}
        uploadFile={{ ...baseProps.uploadFile, isDuplicate: true }}
      />
    );
    expect(screen.getByText(/Duplicate/)).toBeInTheDocument();
  });

  it("renders video preview when type is video", () => {
    render(
      <EnhancedContentFilePreview
        {...baseProps}
        uploadFile={{
          ...baseProps.uploadFile,
          type: "video",
          preview: "blob:http://localhost/fake-url",
        }}
      />
    );
    expect(screen.getByLabelText(/Preview of video file cool.png/)).toBeInTheDocument();
  });
});
