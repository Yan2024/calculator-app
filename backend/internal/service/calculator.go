package service

import (
	"errors"
	"fmt"
)

const (
	OperationAdd      = "add"
	OperationSubtract = "subtract"
	OperationMultiply = "multiply"
	OperationDivide   = "divide"
)

var (
	ErrUnsupportedOperation = errors.New("unsupported operation")
	ErrDivisionByZero       = errors.New("division by zero")
)

func Calculate(operation string, left, right float64) (float64, error) {
	switch operation {
	case OperationAdd:
		return left + right, nil

	case OperationSubtract:
		return left - right, nil

	case OperationMultiply:
		return left * right, nil

	case OperationDivide:
		if right == 0 {
			return 0, ErrDivisionByZero
		}

		return left / right, nil

	default:
		return 0, fmt.Errorf(
			"%w: %s",
			ErrUnsupportedOperation,
			operation,
		)
	}
}
