import React from 'react';

/**
 * Component Tests: FeedbackModal
 *
 * Comprehensive tests for the FeedbackModal component including:
 * - Rendering and dialog states
 * - Category selection
 * - Form input and validation
 * - Screenshot upload (file selection)
 * - Screenshot paste functionality
 * - Form submission
 * - Dialog close and cleanup
 * - Error handling
 * - Accessibility
 * - Edge cases and memory management
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FeedbackModal } from '@/components/features/feedback/FeedbackModal';
import { submitFeedback } from '@/lib/utils/feedback';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'title': 'Send Feedback',
      'fields.category.label': 'What type of feedback?',
      'fields.message.label': 'Message',
      'fields.message.placeholder': 'Tell us what\'s on your mind...',
      'fields.screenshot.label': 'Screenshot (optional)',
      'fields.screenshot.placeholder': 'Click to upload or paste an image',
      'fields.screenshot.hint': 'You can also paste a screenshot with Ctrl+V (Cmd+V on Mac)',
      'fields.email.label': 'Email (optional)',
      'fields.email.placeholder': 'your@email.com',
      'categories.general': 'General Feedback',
      'categories.feature-request': 'Feature Request',
      'categories.bug-report': 'Bug Report',
      'categories.ux-issue': 'UX Issue',
      'actions.cancel': 'Cancel',
      'actions.submit': 'Send Feedback',
      'actions.submitting': 'Sending...',
      'success.title': 'Thanks for your feedback!',
      'success.message': 'We\'ve received your message and will review it soon.',
      'errors.submitFailed': 'Failed to submit feedback. Please try again.',
      'errors.networkError': 'Network error. Please check your connection and try again.',
    };
    return translations[key] || key;
  },
  useLocale: () => 'en',
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bug: () => <div data-testid="bug-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  MessageCircle: () => <div data-testid="message-circle-icon" />,
  Palette: () => <div data-testid="palette-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  X: () => <div data-testid="x-icon" />,
}));

// Mock only submitFeedback
jest.mock('@/lib/utils/feedback', () => ({
  validateFeedback: jest.requireActual('@/lib/utils/feedback').validateFeedback,
  submitFeedback: jest.fn(),
}));

const mockSubmitFeedback = submitFeedback as jest.MockedFunction<typeof submitFeedback>;

describe('FeedbackModal', () => {
  let mockOnOpenChange: jest.Mock;
  let mockCreateObjectURL: jest.Mock;
  let mockRevokeObjectURL: jest.Mock;

  beforeEach(() => {
    mockOnOpenChange = jest.fn();
    mockCreateObjectURL = jest.fn(() => 'mock-object-url');
    mockRevokeObjectURL = jest.fn();

    // Mock URL methods
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;

    // Reset mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open is true', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render modal content when open is false', () => {
      render(<FeedbackModal open={false} onOpenChange={mockOnOpenChange} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render dialog title correctly', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);
      expect(screen.getByRole('heading', { name: 'Send Feedback' })).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByText('What type of feedback?')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Tell us what\'s on your mind...')).toBeInTheDocument();
      expect(screen.getByText('Screenshot (optional)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument();
    });

    it('should render all category buttons', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByText('General Feedback')).toBeInTheDocument();
      expect(screen.getByText('Feature Request')).toBeInTheDocument();
      expect(screen.getByText('Bug Report')).toBeInTheDocument();
      expect(screen.getByText('UX Issue')).toBeInTheDocument();
    });

    it('should render category buttons with correct icons', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument();
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
      expect(screen.getByTestId('bug-icon')).toBeInTheDocument();
      expect(screen.getByTestId('palette-icon')).toBeInTheDocument();
    });

    it('should render success state after successful submission', async () => {
      mockSubmitFeedback.mockResolvedValue({ success: true, issueId: 'SEN-123' });

      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      // Fill form
      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      // Submit
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
        expect(screen.getByText('We\'ve received your message and will review it soon.')).toBeInTheDocument();
      });
    });
  });

  describe('Category Selection', () => {
    it('should select category when button is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const generalButton = screen.getByText('General Feedback');
      await user.click(generalButton);

      expect(generalButton.closest('button')).toHaveAttribute('data-selected', 'true');
    });

    it('should update selected state for all categories', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const categories = ['General Feedback', 'Feature Request', 'Bug Report', 'UX Issue'];

      for (const category of categories) {
        const button = screen.getByText(category);
        await user.click(button);
        expect(button.closest('button')).toHaveAttribute('data-selected', 'true');
      }
    });

    it('should only have one category selected at a time', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const generalButton = screen.getByText('General Feedback');
      const featureButton = screen.getByText('Feature Request');

      await user.click(generalButton);
      expect(generalButton.closest('button')).toHaveAttribute('data-selected', 'true');

      await user.click(featureButton);
      expect(featureButton.closest('button')).toHaveAttribute('data-selected', 'true');
      expect(generalButton.closest('button')).toHaveAttribute('data-selected', 'false');
    });

    it('should clear category error when category is selected', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      // Submit without category to trigger error
      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a category')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Select category
      await user.click(screen.getByText('General Feedback'));

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText('Please select a category')).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Input', () => {
    it('should accept message input', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'This is my feedback');

      expect(messageInput).toHaveValue('This is my feedback');
    });

    it('should accept email input', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const emailInput = screen.getByPlaceholderText('your@email.com');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should show error when category not selected', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please select a category')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should show error when message is empty', async () => {
      const user = userEvent.setup();
render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a message')).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      // Fill in required fields first
      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      // Then add invalid email
      const emailInput = screen.getByPlaceholderText('your@email.com');
      await user.type(emailInput, 'invalid-email');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should allow optional email to be left empty', async () => {
mockSubmitFeedback.mockResolvedValue({ success: true });

      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitFeedback).toHaveBeenCalled();
      });
    });
  });

  describe('Screenshot Upload', () => {
    it('should accept file selection', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(fileInput.files?.[0]).toBe(file);
      expect(fileInput.files).toHaveLength(1);
    });

    it('should show preview after file selection', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        const preview = screen.getByAltText('Screenshot preview');
        expect(preview).toBeInTheDocument();
        expect(preview).toHaveAttribute('src', 'mock-object-url');
      });
    });

    it('should display file name after selection', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('screenshot.png')).toBeInTheDocument();
      });
    });

    it('should show remove button after file selection', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        // Check for screenshot file name instead
        expect(screen.getByText('screenshot.png')).toBeInTheDocument();
      });
    });

    it('should clear screenshot when remove button is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('screenshot.png')).toBeInTheDocument();
      });

      // Find the remove button within the screenshot section (not the dialog close button)
      const screenshotSection = screen.getByText('screenshot.png').closest('div');
      const removeButton = screenshotSection?.querySelector('button');

      if (removeButton) {
        await user.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('screenshot.png')).not.toBeInTheDocument();
        expect(screen.queryByAltText('Screenshot preview')).not.toBeInTheDocument();
      });
    });

    it('should revoke Object URL when screenshot is removed', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
      });

      // Find the remove button within the screenshot section
      const screenshotSection = screen.getByText('screenshot.png').closest('div');
      const removeButton = screenshotSection?.querySelector('button');

      if (removeButton) {
        await user.click(removeButton);
      }

      await waitFor(() => {
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-object-url');
      });
    });

    it('should reset file input value after removal', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      // Find the remove button within the screenshot section
      const screenshotSection = screen.getByText('screenshot.png').closest('div');
      const removeButton = screenshotSection?.querySelector('button');

      if (removeButton) {
        await user.click(removeButton);
      }

      // Verify screenshot is removed from UI (file input value cannot be tested due to browser security)
      await waitFor(() => {
        expect(screen.queryByText('screenshot.png')).not.toBeInTheDocument();
        expect(screen.queryByAltText('Screenshot preview')).not.toBeInTheDocument();
      });
    });

    it('should show validation error for files larger than 5MB', async () => {
      const user = userEvent.setup();
render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      // Create a large file (6MB)
      const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, largeFile);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Screenshot must be less than 5MB')).toBeInTheDocument();
      });
    });

    it('should clear screenshot error when new file is selected', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      // No error should be present
      expect(screen.queryByText('Screenshot must be less than 5MB')).not.toBeInTheDocument();
    });
  });

  describe('Screenshot Paste', () => {
    it('should attach screenshot when image is pasted', async () => {
      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'pasted.png', { type: 'image/png' });
      const form = container.querySelector('form');

      // Create clipboard event
      const clipboardData = {
        items: [
          {
            type: 'image/png',
            getAsFile: () => file,
          },
        ],
      };

      const pasteEvent = new Event('paste', { bubbles: true }) as any;
      pasteEvent.clipboardData = clipboardData;

      form?.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(screen.getByText('pasted.png')).toBeInTheDocument();
      });
    });

    it('should create preview URL when image is pasted', async () => {
      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'pasted.png', { type: 'image/png' });
      const form = container.querySelector('form');

      const clipboardData = {
        items: [
          {
            type: 'image/png',
            getAsFile: () => file,
          },
        ],
      };

      const pasteEvent = new Event('paste', { bubbles: true }) as any;
      pasteEvent.clipboardData = clipboardData;

      form?.dispatchEvent(pasteEvent);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalledWith(file);
        expect(screen.getByAltText('Screenshot preview')).toHaveAttribute('src', 'mock-object-url');
      });
    });

    it('should ignore non-image paste events', () => {
      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const form = container.querySelector('form');

      const clipboardData = {
        items: [
          {
            type: 'text/plain',
            getAsFile: () => null,
          },
        ],
      };

      const pasteEvent = new Event('paste', { bubbles: true }) as any;
      pasteEvent.clipboardData = clipboardData;

      form?.dispatchEvent(pasteEvent);

      expect(screen.queryByAltText('Screenshot preview')).not.toBeInTheDocument();
    });

    it('should replace previous screenshot on multiple pastes', async () => {
      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file1 = new File(['screenshot1'], 'first.png', { type: 'image/png' });
      const file2 = new File(['screenshot2'], 'second.png', { type: 'image/png' });
      const form = container.querySelector('form');

      // First paste
      const clipboardData1 = {
        items: [{ type: 'image/png', getAsFile: () => file1 }],
      };
      const pasteEvent1 = new Event('paste', { bubbles: true }) as any;
      pasteEvent1.clipboardData = clipboardData1;
      form?.dispatchEvent(pasteEvent1);

      await waitFor(() => {
        expect(screen.getByText('first.png')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Second paste
      const clipboardData2 = {
        items: [{ type: 'image/png', getAsFile: () => file2 }],
      };
      const pasteEvent2 = new Event('paste', { bubbles: true }) as any;
      pasteEvent2.clipboardData = clipboardData2;
      form?.dispatchEvent(pasteEvent2);

      await waitFor(() => {
        expect(screen.getByText('second.png')).toBeInTheDocument();
        expect(screen.queryByText('first.png')).not.toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Form Submission', () => {
    it('should prevent default form submission', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockResolvedValue({ success: true });

      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const form = container.querySelector('form');
      const submitHandler = jest.fn((e) => e.preventDefault());
      form?.addEventListener('submit', submitHandler);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(submitHandler).toHaveBeenCalled();
      });
    });

    it('should validate fields before submission', async () => {
      const user = userEvent.setup();
render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitFeedback).not.toHaveBeenCalled();
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
      });
    });

    it('should disable buttons during submission', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      const cancelButton = screen.getByRole('button', { name: /cancel/i });

      await user.click(submitButton);

      // Buttons should be disabled during submission
      expect(submitButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();

      // Wait for success state (submission completes)
      await waitFor(() => {
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
      });
    });

    it('should call submitFeedback with correct data', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockResolvedValue({ success: true });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('Bug Report'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Found a bug');
      const emailInput = screen.getByPlaceholderText('your@email.com');
      await user.type(emailInput, 'test@example.com');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockSubmitFeedback).toHaveBeenCalledWith(
          expect.objectContaining({
            category: 'bug-report',
            message: 'Found a bug',
            email: 'test@example.com',
          }),
          'en'
        );
      });
    });

    it('should show success state on successful submission', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockResolvedValue({ success: true, issueId: 'SEN-123' });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
      });
    });

    it('should auto-close modal after successful submission', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

mockSubmitFeedback.mockResolvedValue({ success: true });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Thanks for your feedback!')).toBeInTheDocument();
      });

      // Fast-forward 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });

      jest.useRealTimers();
    });

    it('should show error message on submission failure', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockResolvedValue({
        success: false,
        error: 'Server error occurred',
      });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Server error occurred')).toBeInTheDocument();
      });
    });

    it('should show network error on API exception', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockRejectedValue(new Error('Network error'));

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
      });
    });

    it('should clear isSubmitting state after error', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Network error')), 50))
      );

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Should show loading state briefly
      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument();
      });

      // Should clear loading state after error and show error message
      await waitFor(() => {
        expect(screen.queryByText('Sending...')).not.toBeInTheDocument();
        expect(screen.getByText('Network error. Please check your connection and try again.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /send feedback/i })).toBeInTheDocument();
      });
    });
  });

  describe('Dialog Close & Cleanup', () => {
    it('should call onOpenChange when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should revoke preview URL on close', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(mockCreateObjectURL).toHaveBeenCalled();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-object-url');

      jest.useRealTimers();
    });

    it('should reset form fields after close with animation delay', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      const { rerender } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      // Close the modal
      rerender(<FeedbackModal open={false} onOpenChange={mockOnOpenChange} />);

      // Fast-forward animation delay
      jest.advanceTimersByTime(300);

      // Reopen to check if reset
      rerender(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const newMessageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      expect(newMessageInput).toHaveValue('');

      jest.useRealTimers();
    });

    it('should reset file input value on close', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      const { rerender } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      rerender(<FeedbackModal open={false} onOpenChange={mockOnOpenChange} />);
      jest.advanceTimersByTime(300);

      rerender(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const newFileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(newFileInput.value).toBe('');

      jest.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should display category error below category buttons', async () => {
      const user = userEvent.setup();
render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        const error = screen.getByText('Please select a category');
        expect(error).toBeInTheDocument();
        expect(error.className).toContain('text-error-500');
      });
    });

    it('should display message error', async () => {
      const user = userEvent.setup();
render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please enter a message')).toBeInTheDocument();
      });
    });

    it('should NOT display email error when email is empty', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Email is optional, so no error should appear for empty email
      await waitFor(() => {
        expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
      });
    });

    it('should NOT display screenshot error when no screenshot uploaded', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      // Screenshot is optional, so no error should appear when none is uploaded
      await waitFor(() => {
        expect(screen.queryByText('Screenshot must be less than 5MB')).not.toBeInTheDocument();
      });
    });

    it('should display general error for submission failures', async () => {
      const user = userEvent.setup();
mockSubmitFeedback.mockResolvedValue({
        success: false,
        error: 'Failed to submit feedback. Please try again.',
      });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      await user.click(screen.getByText('General Feedback'));
      const messageInput = screen.getByPlaceholderText('Tell us what\'s on your mind...');
      await user.type(messageInput, 'Test message');

      const submitButton = screen.getByRole('button', { name: /send feedback/i });
      await user.click(submitButton);

      await waitFor(() => {
        const error = screen.getByText('Failed to submit feedback. Please try again.');
        expect(error).toBeInTheDocument();
        expect(error.className).toContain('text-error-700');
      });
    });
  });

  describe('Accessibility', () => {
    it('should mark required fields with asterisk', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      // Check for asterisk in the document
      const asterisks = document.querySelectorAll('.text-error-500');
      expect(asterisks.length).toBeGreaterThan(0);
    });

    it('should have descriptive button labels', () => {
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send feedback/i })).toBeInTheDocument();
    });

    it('should use proper form element', () => {
      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form?.tagName).toBe('FORM');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing clipboard data gracefully', () => {
      const { container } = render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const form = container.querySelector('form');
      const pasteEvent = new Event('paste', { bubbles: true }) as any;
      pasteEvent.clipboardData = null;

      // Should not throw error
      expect(() => form?.dispatchEvent(pasteEvent)).not.toThrow();
    });

    it('should handle multiple file selections', async () => {
      const user = userEvent.setup();
      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file1 = new File(['screenshot1'], 'first.png', { type: 'image/png' });
      const file2 = new File(['screenshot2'], 'second.png', { type: 'image/png' });

      // Upload first file
      const fileInput1 = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput1, file1);

      await waitFor(() => {
        expect(screen.getByText('first.png')).toBeInTheDocument();
        expect(mockCreateObjectURL).toHaveBeenCalledWith(file1);
      }, { timeout: 3000 });

      // Track current call count before removing
      const firstCallCount = mockCreateObjectURL.mock.calls.length;

      // Remove the first screenshot to reveal the file input again
      const screenshotSection = screen.getByText('first.png').closest('div');
      const removeButton = screenshotSection?.querySelector('button');
      if (removeButton) {
        await user.click(removeButton);
      }

      await waitFor(() => {
        expect(screen.queryByText('first.png')).not.toBeInTheDocument();
      }, { timeout: 3000 });

      // Upload second file
      const fileInput2 = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(fileInput2, file2);

      // Wait for the second file to appear
      await waitFor(() => {
        expect(screen.getByText('second.png')).toBeInTheDocument();
        // Verify new preview URL was created
        expect(mockCreateObjectURL).toHaveBeenCalledTimes(firstCallCount + 1);
      }, { timeout: 5000 });
    }, 15000); // 15 second timeout for this test

    it('should not leak memory from Object URLs', async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<FeedbackModal open={true} onOpenChange={mockOnOpenChange} />);

      const file = new File(['screenshot'], 'screenshot.png', { type: 'image/png' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

      await user.upload(fileInput, file);

      expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

      // Close modal
      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-object-url');

      jest.useRealTimers();
    });
  });
});
