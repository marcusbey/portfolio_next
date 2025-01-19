import "@testing-library/jest-dom";
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
      screen.getByText("Have a question? Drop in your message 👇")
    ).toBeInTheDocument();
  });

  it("validates empty email and message", async () => {
    render(<Contact />);

    // Open form
    fireEvent.click(screen.getByRole("button"));

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
    fireEvent.click(screen.getByRole("button"));

    // Enter invalid email
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    fireEvent.change(emailInput, { target: { value: "invalid-email" } });

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
        json: () => Promise.resolve({ message: "Email sent successfully" }),
      })
    );

    render(<Contact />);

    // Open form
    fireEvent.click(screen.getByRole("button"));

    // Fill form
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Test message" } });

    // Submit form
    fireEvent.click(screen.getByText("Submit"));

    // Check loading state
    expect(screen.getByText("Submitting...")).toBeInTheDocument();

    // Check success message
    await waitFor(() => {
      expect(
        screen.getByText(
          "Message sent successfully! I'll get back to you soon. 🚀"
        )
      ).toBeInTheDocument();
    });

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith("/api/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        message: "Test message",
      }),
    });
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
    fireEvent.click(screen.getByRole("button"));

    // Fill form
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Test message" } });

    // Submit form
    fireEvent.click(screen.getByText("Submit"));

    // Check error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to send message. Please try again later.")
      ).toBeInTheDocument();
    });
  });

  it("resets form on close and reopen", () => {
    render(<Contact />);

    // Open form
    fireEvent.click(screen.getByRole("button"));

    // Fill form
    const emailInput = screen.getByPlaceholderText("johndoe@xyz.com");
    const messageInput = screen.getByPlaceholderText(
      "I'd love a compliment from you."
    );

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(messageInput, { target: { value: "Test message" } });

    // Close form
    fireEvent.click(screen.getByRole("button"));

    // Reopen form
    fireEvent.click(screen.getByRole("button"));

    // Check if form is reset
    expect(screen.getByPlaceholderText("johndoe@xyz.com")).toHaveValue("");
    expect(
      screen.getByPlaceholderText("I'd love a compliment from you.")
    ).toHaveValue("");
  });
});
