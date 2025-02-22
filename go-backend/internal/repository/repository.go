package repository

import (
	"fmt"
	"io"
	"log"
	"main/internal/models"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
)

// ImageRepository defines core operations for image processing and storage
type ImageRepository interface {
	ReadImgURL(url string) ([]byte, error)
	ReadPromptTxt() string
	StringToTopic(responseString string) models.Topic
	SaveImage(file io.Reader) (string, error)
	FileTransfer(w http.ResponseWriter, file multipart.File) (string, error)
}

// DiskImageRepository implements storage operations using local filesystem
type DiskImageRepository struct{}

const (
	uploadDir   = "uploads"
	tempFileFmt = "uploaded-*.jpg"
)

func NewDiskImgRepo() *DiskImageRepository {
	return &DiskImageRepository{}
}

// FileTransfer handles the upload process from receiving to storing a file
func (r *DiskImageRepository) FileTransfer(w http.ResponseWriter, file multipart.File) (string, error) {
	fileBytes, err := readFile(w, file)
	if err != nil {
		return "", err
	}

	// Create uploads directory if missing
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		errMsg := "Failed to create 'uploads' directory: " + err.Error()
		fmt.Println(errMsg)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return "", err
	}

	tempFile, err := createDir(w, uploadDir, tempFileFmt)
	if err != nil {
		log.Println(err)
		return "", err
	}
	defer func(tempFile *os.File) {
		err := tempFile.Close()
		if err != nil {
			fmt.Println(err)
			return
		}
	}(tempFile)

	err = writeFile(w, tempFile, fileBytes)
	if err != nil {
		return "", nil
	}

	return tempFile.Name(), nil
}

// Creates temp file in specified directory with given pattern
func createDir(w http.ResponseWriter, dir string, pattern string) (*os.File, error) {
	tempFile, err := os.CreateTemp(dir, pattern)
	if err != nil {
		errMsg := "Failed to create temporary file: " + err.Error()
		http.Error(w, errMsg, http.StatusInternalServerError)
		return nil, err
	}
	return tempFile, nil
}

// Writes byte data to temporary file
func writeFile(w http.ResponseWriter, tempFile *os.File, fileBytes []byte) error {
	_, err := tempFile.Write(fileBytes)
	if err != nil {
		errMsg := "Failed to write to temporary file: " + err.Error()
		log.Println(errMsg)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return err
	}
	return nil
}

// Reads multipart file into bytes
func readFile(w http.ResponseWriter, file multipart.File) ([]byte, error) {
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		errMsg := "Failed to read file: " + err.Error()
		fmt.Println(errMsg)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return nil, err
	}
	return fileBytes, nil
}

// ReadImgURL fetches and returns image bytes from given URL
func (r *DiskImageRepository) ReadImgURL(url string) ([]byte, error) {
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to make HTTP request: %w", err)
	}
	defer resp.Body.Close()

	imageBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image from response body: %w", err)
	}
	return imageBytes, nil
}

// ReadPromptTxt loads prompt template from file
func (r *DiskImageRepository) ReadPromptTxt() string {
	path := "prompt4.txt"
	content, err := os.ReadFile(path)
	if err != nil {
		fmt.Println("Failed to read prompt text file:", err)
		return ""
	}
	return string(content)
}

// StringToTopic parses AI response string into Topic struct
// Format: first line is plant type, following lines grouped in threes (name, description, percentage)
func (r *DiskImageRepository) StringToTopic(responseString string) models.Topic {
	lines := strings.Split(strings.TrimSpace(responseString), "\n\n")
	if len(lines) < 1 {
		return models.Topic{}
	}

	topic := models.Topic{
		Type:   strings.TrimSpace(lines[0]),
		Issues: make([]models.Issue, 0),
	}

	// Process remaining lines in groups of three
	for i := 1; i < len(lines)-2; i += 3 {
		issue := models.Issue{
			Name:        strings.TrimSpace(lines[i]),
			Description: strings.TrimSpace(lines[i+1]),
			Percent:     strings.TrimSpace(lines[i+2]),
		}
		topic.Issues = append(topic.Issues, issue)
	}
	return topic
}

// SaveImage stores file from Reader, returns path or error
func (r *DiskImageRepository) SaveImage(file io.Reader) (string, error) {
	if err := os.MkdirAll("uploads", 0755); err != nil {
		return "", fmt.Errorf("failed to create 'uploads' directory: %w", err)
	}

	tempFile, err := os.CreateTemp("uploads", "uploaded-*.jpg")
	if err != nil {
		return "", fmt.Errorf("failed to create temporary file: %w", err)
	}
	defer tempFile.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	if _, err := tempFile.Write(fileBytes); err != nil {
		return "", fmt.Errorf("failed to write to temporary file: %w", err)
	}
	return tempFile.Name(), nil
}

