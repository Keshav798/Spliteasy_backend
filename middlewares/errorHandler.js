const { constants } = require("../constants");

const errorHandler = (error, req, res, next) => {
    const statusCode = res.statusCode ? res.statusCode : 500;

    // Default response structure
    const response = {
        title: "Error",
        message: error.message || "An unexpected error occurred.",
        stackTrace: process.env.NODE_ENV === "development" ? error.stack : "Stack trace hidden in production",
    };

    // Check for specific error cases
    if (error && error._message && error._message.includes("validation failed")) {
        response.title = "Validation Failed!";
    }

    // Customize based on statusCode
    switch (statusCode) {
        case constants.VALIDATION_ERROR:
            response.title = "Validation Error!";
            break;
        case constants.NOT_FOUND:
            response.title = "Not Found!";
            break;
        case constants.UNAUTHORIZED:
            response.title = "Unauthorized!";
            break;
        case constants.FORBIDDEN:
            response.title = "Forbidden!";
            break;
        case constants.SERVER_ERROR:
            response.title = "Server Error!";
            break;
        default:
            response.title = "Unexpected Error";
            break;
    }

    // Send the response
    res.status(statusCode).json(response);
};

module.exports = errorHandler;
