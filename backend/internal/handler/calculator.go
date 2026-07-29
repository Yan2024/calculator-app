package handler

import (
	"encoding/json"
	"errors"
	"log"
	"net/http"

	"github.com/Yan2024/calculator-app/backend/internal/model"
	"github.com/Yan2024/calculator-app/backend/internal/service"
)

func Calculate(writer http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writeJSON(
			writer,
			http.StatusMethodNotAllowed,
			model.ErrorResponse{Error: "method not allowed"},
		)

		return
	}

	var calculation model.CalculationRequest

	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()

	if err := decoder.Decode(&calculation); err != nil {
		writeJSON(
			writer,
			http.StatusBadRequest,
			model.ErrorResponse{Error: "invalid request body"},
		)

		return
	}

	if calculation.Operation == "" {
		writeJSON(
			writer,
			http.StatusBadRequest,
			model.ErrorResponse{Error: "operation is required"},
		)

		return
	}

	result, err := service.Calculate(
		calculation.Operation,
		calculation.Left,
		calculation.Right,
	)

	if err != nil {
		switch {
		case errors.Is(err, service.ErrDivisionByZero):
			writeJSON(
				writer,
				http.StatusBadRequest,
				model.ErrorResponse{Error: "division by zero is not allowed"},
			)

		case errors.Is(err, service.ErrUnsupportedOperation):
			writeJSON(
				writer,
				http.StatusBadRequest,
				model.ErrorResponse{Error: "unsupported operation"},
			)

		default:
			writeJSON(
				writer,
				http.StatusInternalServerError,
				model.ErrorResponse{Error: "internal server error"},
			)
		}

		return
	}

	writeJSON(
		writer,
		http.StatusOK,
		model.CalculationResponse{Result: result},
	)
}

func writeJSON(
	writer http.ResponseWriter,
	statusCode int,
	body any,
) {
	writer.Header().Set("Content-Type", "application/json")
	writer.WriteHeader(statusCode)

	if err := json.NewEncoder(writer).Encode(body); err != nil {
		log.Printf("failed to encode response: %v", err)
	}
}
