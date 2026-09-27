package models

type ApiResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data"`
	Message *string     `json:"message"`
}

func SuccessResponse(data interface{}) ApiResponse {
	return ApiResponse{
		Success: true,
		Data:    data,
		Message: nil,
	}
}

func SuccessWithMessage(data interface{}, message string) ApiResponse {
	return ApiResponse{
		Success: true,
		Data:    data,
		Message: &message,
	}
}

func ErrorResponse(message string) ApiResponse {
	return ApiResponse{
		Success: false,
		Data:    nil,
		Message: &message,
	}
}
