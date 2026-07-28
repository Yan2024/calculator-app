package service

import (
	"errors"
	"testing"
)

func TestCalculate(t *testing.T) {
	tests := []struct {
		name          string
		operation     string
		left          float64
		right         float64
		expected      float64
		expectedError error
	}{
		{
			name:      "adds two numbers",
			operation: OperationAdd,
			left:      10,
			right:     5,
			expected:  15,
		},
		{
			name:      "adds negative numbers",
			operation: OperationAdd,
			left:      -10,
			right:     -5,
			expected:  -15,
		},
		{
			name:      "subtracts two numbers",
			operation: OperationSubtract,
			left:      10,
			right:     5,
			expected:  5,
		},
		{
			name:      "subtracts resulting in a negative number",
			operation: OperationSubtract,
			left:      5,
			right:     10,
			expected:  -5,
		},
		{
			name:      "multiplies two numbers",
			operation: OperationMultiply,
			left:      10,
			right:     5,
			expected:  50,
		},
		{
			name:      "multiplies by zero",
			operation: OperationMultiply,
			left:      10,
			right:     0,
			expected:  0,
		},
		{
			name:      "divides two numbers",
			operation: OperationDivide,
			left:      10,
			right:     5,
			expected:  2,
		},
		{
			name:      "divides decimal numbers",
			operation: OperationDivide,
			left:      5,
			right:     2,
			expected:  2.5,
		},
		{
			name:          "rejects division by zero",
			operation:     OperationDivide,
			left:          10,
			right:         0,
			expectedError: ErrDivisionByZero,
		},
		{
			name:          "rejects unsupported operation",
			operation:     "unknown",
			left:          10,
			right:         5,
			expectedError: ErrUnsupportedOperation,
		},
		{
			name:          "rejects empty operation",
			operation:     "",
			left:          10,
			right:         5,
			expectedError: ErrUnsupportedOperation,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := Calculate(
				tt.operation,
				tt.left,
				tt.right,
			)

			if tt.expectedError != nil {
				if !errors.Is(err, tt.expectedError) {
					t.Fatalf(
						"expected error %v, got %v",
						tt.expectedError,
						err,
					)
				}

				return
			}

			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}

			if result != tt.expected {
				t.Errorf(
					"expected %v, got %v",
					tt.expected,
					result,
				)
			}
		})
	}
}
