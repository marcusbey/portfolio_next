import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Contact } from "../components/Contact";

// Mock fetch function
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Contact Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it("renders contact button and opens form on click", () => {
    render(<Contact />);

    // Initially form should be hidden
    expect(
      screen.queryByText("Have a question? Drop in your message 👇")
    ).not.toBeInTheDocument();

    // Click contact button
    const contactButton = screen.getByRole("button");
    fireEvent.click(contactButton);

    // Form should be visible
    expect(
      screen.getByText("Have a question? Drop in your message")
    ).toBeInTheDocument();
  });

  it("validates empty email and message", async () => {
    render(<Contact />);

    // Open form
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );
    fireEvent.change(messageInput, {
      target: { value: "This is a valid message with enough content." },
    });

    // Try to submit empty form
    fireEvent.click(screen.getByText("Submit"));

    // Check for error messages
    expect(
      await screen.findByText("Oops! Email cannot be empty.")
    ).toBeInTheDocument();
  });

  it("validates invalid email format", async () => {
    render(<Contact />);

    // Open form
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // Enter invalid email
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );
    fireEvent.change(messageInput, {
      target: { value: "This is a valid message with enough content." },
    });

    // Try to submit
    fireEvent.click(screen.getByText("Submit"));

    // Check for error message
    expect(
      await screen.findByText("Please enter a valid email address")
    ).toBeInTheDocument();
  });

  it("successfully submits form", async () => {
    // Mock successful API response
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            success: true,
            message: "Email sent successfully",
            id: "test-id",
          }),
      })
    );

    render(<Contact />);

    // Open form
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // Fill form
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a test message" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Submit"));

    // Check loading state
    expect(screen.getByText("Submitting...")).toBeInTheDocument();

    // Check success message
    await waitFor(() => {
      expect(
        screen.getByText(
          "Message sent successfully! I'll get back to you soon."
        )
      ).toBeInTheDocument();
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/contact-v2",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    );

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const payload = JSON.parse(fetchCall[1].body);
    expect(payload).toMatchObject({
      email: "test@example.com",
      message: "This is a test message",
      honeypot: "",
    });
    expect(typeof payload.timestamp).toBe("number");
  });

  it("handles API error", async () => {
    // Mock API error
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: "Error sending email" }),
      })
    );

    render(<Contact />);

    // Open form
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // Fill form
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a test message" },
    });

    // Submit form
    fireEvent.click(screen.getByText("Submit"));

    // Check error message
    await waitFor(() => {
      expect(
        screen.getByText((content) =>
          content.includes("Failed to send message")
        )
      ).toBeInTheDocument();
    });
  });

  it("resets form on close and reopen", () => {
    render(<Contact />);

    // Open form
    const toggleButton = screen.getByRole("button");
    fireEvent.click(toggleButton);

    // Fill form
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, {
      target: { value: "This is a test message" },
    });

    // Close form
    fireEvent.click(toggleButton);

    // Reopen form
    fireEvent.click(toggleButton);

    // Check if form is reset
    expect(screen.getByPlaceholderText("johndoe@xyz.com")).toHaveValue("");
    expect(
      screen.getByPlaceholderText("I'd love a compliment from you.")
    ).toHaveValue("");
  });
});
