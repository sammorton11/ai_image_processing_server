package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"main/internal/service"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
)

// 10 MB limit for the file size when uploading an image file
const maxFileSize = 80 << 20

type ImgProcessHandler struct {
	service *service.ImgProcessServ
}

func New(imgService *service.ImgProcessServ) *ImgProcessHandler {
	return &ImgProcessHandler{service: imgService}
}

func extractJSON(rawData string) (string, error) {
	// Remove Markdown-style JSON block indicators
	rawData = strings.TrimPrefix(rawData, "```json")
	rawData = strings.TrimSuffix(rawData, "```")

	// Remove line breaks, carriage returns, and extra whitespace
	cleanedData := strings.ReplaceAll(rawData, "\n", "")
	cleanedData = strings.ReplaceAll(cleanedData, "\r", "")
	cleanedData = strings.TrimSpace(cleanedData)

	// Re-check if there are any trailing backticks after cleaning
	if strings.HasSuffix(cleanedData, "```") {
		cleanedData = strings.TrimSuffix(cleanedData, "```")
	}

	return cleanedData, nil
}


func (h *ImgProcessHandler) ProcessImageURL(w http.ResponseWriter, r *http.Request) {
	// Step 1: Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Step 2: Parse the JSON payload
	var requestBody map[string]string
	if err := json.Unmarshal(body, &requestBody); err != nil {
		http.Error(w, "Failed to decode JSON body", http.StatusBadRequest)
		return
	}

	// Extract the 'image_url' field
	imageFilePath, ok := requestBody["image_url"]
	if !ok {
		http.Error(w, "Missing 'image_url' in JSON payload", http.StatusBadRequest)
		return
	}

	// Step 3: Call the Gemini API with the image URL
	result, err := h.service.SendImageURL(imageFilePath)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Log the raw response
	fmt.Printf("Raw response from Gemini API:\n%s\n", result)

	// Step 4: Extract and clean the JSON from the response
	cleanJSON, err := extractJSON(result)
	if err != nil {
		fmt.Printf("Error extracting JSON: %s\n", err)
		http.Error(w, "Failed to process response from Gemini API", http.StatusInternalServerError)
		return
	}

	// Step 5: Parse the cleaned JSON into a Go map
	var responseMap map[string]interface{}
	if err := json.Unmarshal([]byte(cleanJSON), &responseMap); err != nil {
		fmt.Printf("Error unmarshalling cleaned JSON: %s\n", err)
		http.Error(w, "Failed to decode cleaned JSON", http.StatusInternalServerError)
		return
	}

	// Step 6: Send the structured JSON back to the client
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(responseMap); err != nil {
		fmt.Println("Error encoding JSON for client:", err)
		http.Error(w, "Failed to send JSON response", http.StatusInternalServerError)
		return
	}
}

func (h *ImgProcessHandler) ProcessImageFile(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Processing Image File")
	// Parse the form data, including the uploaded file
	err := r.ParseMultipartForm(maxFileSize) // 10 MB limit for the file size
	if err != nil {
		fmt.Println("Error parsing form:", err)
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the file from the request
	file, _, err := r.FormFile("img")
	if err != nil {
		fmt.Println("Error retrieving file:", err)
		http.Error(w, "Failed to get file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			fmt.Println("Error closing file:", err)
		}
	}(file)

	// Transfer the file to the server
	pathName, err := h.service.FileTransfer(w, file)
	if err != nil {
		http.Error(w, "File transfer failed - Internal Server Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response, err := h.service.SendImageFile(pathName)
	if err != nil {
		http.Error(w, "Failed to send file to API - Internal Server Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Extract the JSON from the response
	cleanJSON, err := extractJSON(response)
	if err != nil {
		fmt.Printf("Error extracting JSON: %s\n", err)
		http.Error(w, "Failed to extract JSON from response", http.StatusInternalServerError)
		return
	}

	// Parse the extracted JSON into a Go map
	var responseMap map[string]interface{}
	err = json.Unmarshal([]byte(cleanJSON), &responseMap)
	if err != nil {
		fmt.Println("Error unmarshalling JSON:", err)
		http.Error(w, "Failed to parse response JSON", http.StatusInternalServerError)
		return
	}

	// Send the cleaned and parsed JSON back to the client
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(responseMap)
	if err != nil {
		fmt.Println("Error encoding JSON for client:", err)
		http.Error(w, "Failed to send JSON response", http.StatusInternalServerError)
	}

	// Remove the file from the server when processing is complete
	err = os.Remove(pathName)
	if err != nil {
		fmt.Println("Error removing file:", err)
	}
}

func sanitizeString(input string) string {
	return strings.TrimSpace(strings.ReplaceAll(input, "\n", " "))
}

