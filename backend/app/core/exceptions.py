class FoodChowException(Exception):
    """Base exception for the FoodChow application."""

    def __init__(self, message: str, code: str = "FOODCHOW_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class ResourceNotFoundError(FoodChowException):
    """Raised when a requested resource does not exist."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            message=message,
            code="RESOURCE_NOT_FOUND",
        )


class ToolExecutionError(FoodChowException):
    """Raised when a support tool fails."""

    def __init__(self, message: str = "Tool execution failed"):
        super().__init__(
            message=message,
            code="TOOL_EXECUTION_ERROR",
        )


class ValidationError(FoodChowException):
    """Raised when application validation fails."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(
            message=message,
            code="VALIDATION_ERROR",
        )


class PermissionDeniedError(FoodChowException):
    """Raised when an action is not permitted."""

    def __init__(self, message: str = "Permission denied"):
        super().__init__(
            message=message,
            code="PERMISSION_DENIED",
        )