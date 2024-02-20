const errorHandler = (statusCode, message) => {
    const error = new Error();
    error.statusCode = statusCode;
    error.message = message;
    return error;
};

export default errorHandler;

// next() function is used to pass the error to the next middleware in the stack.
