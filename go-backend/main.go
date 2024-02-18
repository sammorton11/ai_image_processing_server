package main

import (
	"fmt"
	"log"
	"main/internal/handlers"
	"main/internal/repository"
	"main/internal/service"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	handler := cors.AllowAll().Handler(mux)

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	repo := repository.NewDiskImgRepo() // You can initialize this with any required dependencies
	// Initialize your service
	imgService := service.New(repo) // You can initialize this with any required dependencies

	// Initialize your handlers with the service
	imgHandler := handlers.New(imgService)

	// Routes
	mux.HandleFunc("/process_image_url", imgHandler.ProcessImageURL)
	mux.HandleFunc("/process_image_file", imgHandler.ProcessImageFile)

	port := 5001
	addr := fmt.Sprintf(":%d", port)
	fmt.Printf("Server is running on http://localhost%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
