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

	repo := repository.NewDiskImgRepo()
	imgService := service.New(repo)
	imgHandler := handlers.New(imgService)

	mux.HandleFunc("/process_image_url", imgHandler.ProcessImageURL)
	mux.HandleFunc("/process_image_file", imgHandler.ProcessImageFile)

	port := 5001
	addr := fmt.Sprintf(":%d", port)

	fmt.Printf("Server is running on http://localhost%s\n", addr)
	log.Fatal(http.ListenAndServe(addr, handler))
}
