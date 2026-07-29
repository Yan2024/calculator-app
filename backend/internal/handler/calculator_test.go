package handler

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		body           string
		expectedStatus int
		expectedBody   string
	}{
		{
			name:           "returns addition result",
			method:         http.MethodPost,
			body:           `{"operation":"add","left":10,"right":5}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `"result":15`,
		},
		{
			name:           "returns subtraction result",
			method:         http.MethodPost,
			body:           `{"operation":"subtract","left":10,"right":5}`,
			expectedStatus: http.StatusOK,
			expectedBody:   `"result":5`,
		},
		{
			name:           "rejects division by zero",
			method:         http.MethodPost,
			body:           `{"operation":"divide","left":10,"right":0}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"division by zero is not allowed"`,
		},
		{
			name:           "rejects unsupported operation",
			method:         http.MethodPost,
			body:           `{"operation":"unknown","left":10,"right":5}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"unsupported operation"`,
		},
		{
			name:           "rejects invalid JSON",
			method:         http.MethodPost,
			body:           `{"operation":`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"invalid request body"`,
		},
		{
			name:           "rejects missing operation",
			method:         http.MethodPost,
			body:           `{"left":10,"right":5}`,
			expectedStatus: http.StatusBadRequest,
			expectedBody:   `"error":"operation is required"`,
		},
		{
			name:           "rejects unsupported HTTP method",
			method:         http.MethodGet,
			body:           "",
			expectedStatus: http.StatusMethodNotAllowed,
			expectedBody:   `"error":"method not allowed"`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			request := httptest.NewRequest(
				tt.method,
				"/api/v1/calculate",
				strings.NewReader(tt.body),
			)

			response := httptest.NewRecorder()

			Calculate(response, request)

			if response.Code != tt.expectedStatus {
				t.Fatalf(
					"expected status %d, got %d",
					tt.expectedStatus,
					response.Code,
				)
			}

			if !strings.Contains(
				response.Body.String(),
				tt.expectedBody,
			) {
				t.Errorf(
					"expected body to contain %q, got %q",
					tt.expectedBody,
					response.Body.String(),
				)
			}
		})
	}
}
