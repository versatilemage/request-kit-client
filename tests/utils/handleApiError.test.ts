import { describe, it, expect, vi } from 'vitest';
import { handleApiError } from '../../src/utils/handleApiError';
import { HTTP_STATUS } from '../../src/types/statusCodes';

describe('handleApiError', () => {
  it('calls onUnauthorized on 401 status', () => {
    const mockCallback = vi.fn();

    const error = {
      isAxiosError: true,
      response: {
        status: HTTP_STATUS.UNAUTHORIZED,
        data: { message: 'Unauthorized access' },
      },
      message: 'Unauthorized access',
    };

    const result = handleApiError(error, {
      onUnauthorized: mockCallback,
    });

    expect(mockCallback).toHaveBeenCalledWith(401);
    expect(result.message).toBe('Unauthorized access');
    expect(result.statusCode).toBe(401);
    expect(result.raw).toBeInstanceOf(Error);
  });

  it('calls onUnauthorized on 403 status', () => {
    const mockCallback = vi.fn();

    const error = {
      isAxiosError: true,
      response: {
        status: HTTP_STATUS.FORBIDDEN,
        data: { message: 'Forbidden access' },
      },
      message: 'Forbidden access',
    };

    const result = handleApiError(error, {
      onUnauthorized: mockCallback,
    });

    expect(mockCallback).toHaveBeenCalledWith(403);
    expect(result.statusCode).toBe(403);
  });

  it('does not call onUnauthorized for other statuses', () => {
    const mockCallback = vi.fn();

    const error = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: 'Internal Server Error' },
      },
      message: 'Internal Server Error',
    };

    const result = handleApiError(error, {
      onUnauthorized: mockCallback,
    });

    expect(mockCallback).not.toHaveBeenCalled();
    expect(result.statusCode).toBe(500);
  });

  it('works without onUnauthorized provided', () => {
    const error = {
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
      message: 'Unauthorized',
    };

    const result = handleApiError(error);
    expect(result.statusCode).toBe(401);
    expect(result.message).toBe('Unauthorized');
  });

  it('handles non-Axios errors gracefully', () => {
    const result = handleApiError(new Error('Something broke'));
    expect(result.message).toBe('Something broke');
    expect(result.statusCode).toBeUndefined(); // not Axios = no statusCode
  });
});
