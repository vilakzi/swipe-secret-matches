
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import EnhancedContentUploadForm from "../EnhancedContentUploadForm";

describe("EnhancedContentUploadForm", () => {
  const CONTENT_CATEGORIES = [
    { value: "news", label: "News" },
    { value: "other", label: "Other" }
  ];

  const defaultProps = {
    title: "",
    setTitle: jest.fn(),
    description: "",
    setDescription: jest.fn(),
    category: "other",
    setCategory: jest.fn(),
    tags: "",
    setTags: jest.fn(),
    scheduledDate: "",
    setScheduledDate: jest.fn(),
    CONTENT_CATEGORIES
  };

  it("renders all form fields with correct labels and ARIA", () => {
    render(<EnhancedContentUploadForm {...defaultProps} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content tags/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/schedule publication date/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/content title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/content description/i)).toBeInTheDocument();
  });

  it("category select is accessible", () => {
    render(<EnhancedContentUploadForm {...defaultProps} />);
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
  });
});
