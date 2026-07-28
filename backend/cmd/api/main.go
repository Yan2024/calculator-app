package main

import (
	"log"
	"net/http"

	"github.com/Yan2024/calculator-app/backend/internal/handler"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc(
		"/api/v1/calculate",
		handler.Calculate,
	)

	log.Println("server running on http://localhost:8080")

	if err := http.ListenAndServe(":8080", mux); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}