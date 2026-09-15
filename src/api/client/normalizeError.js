export class ApiError extends Error {
  constructor({ message, status, code, details, cause }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.cause = cause;
  }
}

export const normalizeError = (error) => {
  if (error instanceof ApiError) return error;

  if (error?.response) {
    const { status, data } = error.response;
    return new ApiError({
      message: data?.message || `Request failed (${status})`,
      status,
      code: data?.code || 'HTTP_ERROR',
      details: data?.details,
      cause: error,
    });
  }

  if (error?.code === 'ECONNABORTED') {
    return new ApiError({ message: 'Request timed out', code: 'TIMEOUT', cause: error });
  }

  if (error?.request) {
    return new ApiError({
      message: 'Network error — cannot reach the server',
      code: 'NETWORK_ERROR',
      cause: error,
    });
  }

  return new ApiError({
    message: error?.message || 'Unknown error',
    code: 'UNKNOWN_ERROR',
    cause: error,
  });
};
