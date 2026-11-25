/**
 * Helpers for the backend's standard error shape: { message: string, errors?: { field: string[] } }
 */

export const getErrorMessage = (error, fallback = 'Something went wrong.') =>
  error?.response?.data?.message || error?.message || fallback;

/** Map a 422 response onto an AntD form so messages show under the right fields. */
export const applyFormErrors = (form, error) => {
  const errors = error?.response?.data?.errors;
  if (!errors) return false;

  form.setFields(
    Object.entries(errors).map(([name, messages]) => ({
      name,
      errors: Array.isArray(messages) ? messages : [String(messages)],
    })),
  );
  return true;
};
