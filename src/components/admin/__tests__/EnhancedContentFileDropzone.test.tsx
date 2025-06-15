
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EnhancedContentFileDropzone from "../EnhancedContentFileDropzone";
import userEvent from "@testing-library/user-event";

describe("EnhancedContentFileDropzone", () => {
  const mockOnDrop = jest.fn();
  const rootProps = {
    tabIndex: 0,
    role: "button",
    "aria-label": "Drag and drop files here, or click to select",
    "aria-describedby": "dropzone-description dropzone-limit",
    onKeyDown: jest.fn(),
    "aria-live": "polite"
  };
  const inputProps = { onClick: jest.fn() };

  it("renders with correct ARIA and description", () => {
    render(
      <EnhancedContentFileDropzone
        onDrop={mockOnDrop}
        isDragActive={false}
        getRootProps={() => rootProps}
        getInputProps={() => inputProps}
        role="admin"
        maxSize={1024 * 1024 * 20}
      />
    );
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-label",
      "Drag and drop files here, or click to select"
    );
    expect(screen.getByText(/drag & drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/max file size/i)).toHaveAttribute("aria-live");
    expect(screen.getByLabelText(/file upload input/i)).toBeInTheDocument();
  });

  it("supports keyboard activation (Enter/Space)", async () => {
    const user = userEvent.setup();
    render(
      <EnhancedContentFileDropzone
        onDrop={mockOnDrop}
        isDragActive={false}
        getRootProps={() => ({
          ...rootProps,
          onKeyDown: (e: React.KeyboardEvent) => {
            rootProps.onKeyDown(e);
            if (e.key === " " || e.key === "Enter") inputProps.onClick(e);
          }
        })}
        getInputProps={() => inputProps}
        role="admin"
        maxSize={1024 * 1024 * 20}
      />
    );
    const dropzone = screen.getByRole("button");
    await user.tab();
    expect(dropzone).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(inputProps.onClick).toHaveBeenCalled();
    await user.keyboard(" ");
    expect(inputProps.onClick).toHaveBeenCalledTimes(2);
  });
});
