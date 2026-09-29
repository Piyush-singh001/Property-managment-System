from fastapi import HTTPException

class AppException(HTTPException):
    def __init__(self, status_code: int, message: str, error_code: str = "ERROR"):
        super().__init__(status_code=status_code, detail={"message": message, "error_code": error_code})
        self.message = message
        self.error_code = error_code

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", error_code: str = "NOT_FOUND"):
        super().__init__(status_code=404, message=message, error_code=error_code)

class BadRequestException(AppException):
    def __init__(self, message: str = "Invalid request", error_code: str = "BAD_REQUEST"):
        super().__init__(status_code=400, message=message, error_code=error_code)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Unauthorized", error_code: str = "UNAUTHORIZED"):
        super().__init__(status_code=401, message=message, error_code=error_code)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Forbidden", error_code: str = "FORBIDDEN"):
        super().__init__(status_code=403, message=message, error_code=error_code)
