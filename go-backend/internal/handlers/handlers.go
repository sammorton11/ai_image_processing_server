package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"main/internal/service"
	"mime/multipart"
	"net/http"
	"os"
)

// 10 MB limit for the file size when uploading an image file
const maxFileSize = 80 << 20

type ImgProcessHandler struct {
	service *service.ImgProcessServ
}

func New(imgService *service.ImgProcessServ) *ImgProcessHandler {
	return &ImgProcessHandler{service: imgService}
}

func (h *ImgProcessHandler) ProcessImageURL(w http.ResponseWriter, r *http.Request) {
	// Read the request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}
	// Close the request body - why? So that the file descriptor is released to avoid a file descriptor leak.
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			fmt.Println(err)
		}
	}(r.Body)

	// Unmarshal the JSON body into a map
	var requestBody map[string]string
	if err := json.Unmarshal(body, &requestBody); err != nil {
		http.Error(w, "Failed to decode JSON body", http.StatusBadRequest)
		return
	}

	// Extract the 'image_url' field from the map
	imageFilePath, ok := requestBody["image_url"]
	if !ok {
		http.Error(w, "Missing 'image_url' in JSON payload", http.StatusBadRequest)
		return
	}

	// Send the image URL to the gemini api
	result, err := h.service.SendImageURL(imageFilePath)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}

	// Convert the response string to a map then to a JSON
	strMap := h.service.StringToMap(result)
	jsonResponse, err := json.Marshal(strMap)
	if err != nil {
		http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonResponse)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func (h *ImgProcessHandler) ProcessImageFile(w http.ResponseWriter, r *http.Request) {
	// Parse the form data, including the uploaded file
	err := r.ParseMultipartForm(maxFileSize) // 10 MB limit for the file size
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, "Failed to parse form: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the file from the request
	file, _, err := r.FormFile("img")
	if err != nil {
		fmt.Println(err.Error())
		http.Error(w, "Failed to get file: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer func(file multipart.File) {
		err := file.Close()
		if err != nil {
			fmt.Println(err)
		}
	}(file)

	// Transfer the file to the server
	pathName, err := h.service.FileTransfer(w, file)
	if err != nil {
		http.Error(w, "File transfer fail - Internal Server Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	response, err := h.service.SendImageFile(pathName)
	if err != nil {
		http.Error(w, "Failed to send file to api - Internal Server Error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert the response string to a map then to a JSON
	strMap := h.service.StringToMap(response)
	jsonResponse, err := json.Marshal(strMap)
	if err != nil {
		http.Error(w, "Failed to encode JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Remove the file from the server when complete
	err = os.Remove(pathName)
	if err != nil {
		fmt.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_, err = w.Write(jsonResponse)
	if err != nil {
		fmt.Println(err)
		return
	}
}
