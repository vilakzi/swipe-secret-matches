
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EnhancedContentFilePreview from "../EnhancedContentFilePreview";

describe("EnhancedContentFilePreview", () => {
  const imageFile = new File(["dummy"], "myphoto.png", { type: "image/png" });

  const baseProps = {
    uploadFile: {
      id: "abc1",
      file: imageFile,
      preview: "blob:http://localhost:3000/image",
      type: "image" as const,
      isDuplicate: false
    },
    onRemove: jest.fn()
  };

  it("renders image preview and file metadata", () => {
    render(<EnhancedContentFilePreview {...baseProps} />);
    expect(
      screen.getByAltText(/preview of image file/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/myphoto.png/i)).toBeInTheDocument();
    expect(screen.getByText(/mb/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remove file/i)).toBeInTheDocument();
  });

  it("renders duplicate badge if isDuplicate is true", () => {
    const props = {
      ...baseProps,
      uploadFile: { ...baseProps.uploadFile, isDuplicate: true }
    };
    render(<EnhancedContentFilePreview {...props} />);
    expect(screen.getByLabelText(/duplicate file/i)).toBeInTheDocument();
    expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
  });

  it("calls onRemove when remove button clicked", () => {
    render(<EnhancedContentFilePreview {...baseProps} />);
    fireEvent.click(screen.getByLabelText(/remove file/i));
    expect(baseProps.onRemove).toHaveBeenCalledWith("abc1");
  });

  it("renders video preview when type is video", () => {
    const videoProps = {
      ...baseProps,
      uploadFile: {
        ...baseProps.uploadFile,
        type: "video" as const,
        preview: "blob:http://localhost:3000/videofile",
        file: new File(["(video)"], "cat.mp4", { type: "video/mp4" })
      }
    };
    render(<EnhancedContentFilePreview {...videoProps} />);
    expect(screen.getByLabelText(/preview of video file/i)).toBeInTheDocument();
    expect(screen.getByText(/cat.mp4/i)).toBeInTheDocument();
    expect(screen.getByText(/video/i)).toBeInTheDocument();
  });
});
