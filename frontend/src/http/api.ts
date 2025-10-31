/* eslint-disable */

import axios from 'axios';

interface FastAPIValidationErrorItem {
  type: string;
  loc: (string | number)[];
  msg: string;
  ctx?: Record<string, any>;
}

interface FastAPIErrorResponse {
  detail?: FastAPIValidationErrorItem[] | string;
}

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true, // send cookies automatically
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const err = error?.response?.data;
    if (status === 401) {
      console.warn('User unauthorized. Might need refresh or logout');
    }

    if (err.detail) {
      if (typeof err.detail === 'string') {
        return Promise.reject({ errorMsg: err.detail, statusCode: status });
      } else if (Array.isArray(err.detail)) {
        return Promise.reject({
          errorMsg: formatFastAPIValidationErrors(err.detail),
          statusCode: status,
        });
      }
    }

    return Promise.reject(
      err ? err : { errorMsg: 'Something went wrong', statusCode: status },
    );
  },
);

function formatFastAPIValidationErrors(
  detail: FastAPIErrorResponse['detail'],
): string {
  if (!detail) return 'Validation failed.';

  if (typeof detail === 'string') return detail;

  const toLabel = (str: string) =>
    str.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  return detail
    .map((item) => {
      const field = toLabel(item.loc[item.loc.length - 1].toString());
      return `${field}: ${item.msg}`;
    })
    .join('\n');
}
