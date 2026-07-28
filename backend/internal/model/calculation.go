package model

type CalculationRequest struct {
	Operation string  `json:"operation"`
	Left      float64 `json:"left"`
	Right     float64 `json:"right"`
}

type CalculationResponse struct {
	Result float64 `json:"result"`
}

type ErrorResponse struct {
	Error string `json:"error"`
}
