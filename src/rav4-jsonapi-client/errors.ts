import { HttpError, useNotify } from 'react-admin';

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.message = message;
    this.name = 'NotImplementedError';
  }
}

export class SafrsHttpError extends HttpError {
  constructor(message: string, status: number, body: any) {
    super(message, status, body);
    this.name = 'SafrsHttpError';
  }
}

export const safrsErrorHandler: HttpErrorHandler = (
  httpError: HttpError
): HttpError => {
  /* Example Safrs Error message
  {
    "errors": [
      {
        "title": "Request forbidden -- authorization will not help",
        "detail": "",
        "code": "403"
      }
    ]
  } */
  interface err {
    title: string;
    detail: string;
    code: string;
  }
  
  const errors: { errors: err[] } = httpError.body; // JSON.parse(httpError.body.stringify);
  if (errors?.errors?.length > 0) {
    alert("Data error "+ errors.errors[0].title)
    return new SafrsHttpError(
      errors.errors[0].title,
      httpError.status,
      errors.errors[0].code
    );
  } else {
    console.log('Unsopported Http Error Body', httpError.body);
    return httpError;
  }
};

export interface HttpErrorHandler {
  (httpError: HttpError): HttpError;
}
