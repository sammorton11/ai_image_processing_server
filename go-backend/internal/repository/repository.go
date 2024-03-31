package repository

import (
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"main/internal/models"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
)

type ImageRepository interface {
	ReadImgURL(url string) ([]byte, error)
	ReadPromptTxt() string
	StringToMap(responseString string) models.PlantData
	SaveImage(file io.Reader) (string, error)
	FileTransfer(w http.ResponseWriter, file multipart.File) (string, error)
}

type DiskImageRepository struct{}

const (
	uploadDir   = "uploads"
	tempFileFmt = "uploaded-*.jpg"
)

func NewDiskImgRepo() *DiskImageRepository {
	return &DiskImageRepository{}
}
func (r *DiskImageRepository) FileTransfer(w http.ResponseWriter, file multipart.File) (string, error) {
	fileBytes, err := readFile(w, file)
	if err != nil {
		return "", err
	}

	// Ensure the "uploads" directory exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		errMsg := "Failed to create 'uploads' directory: " + err.Error()
		fmt.Println(errMsg)
		http.Error(w, errMsg, http.StatusInternalServerError)
		return "", err
	}

	// Create a temporary file in the "uploads" directory
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

	// Write the file data to the temporary file
	err = writeFile(w, tempFile, fileBytes)
	if err != nil {
		return "", nil
	}

	return tempFile.Name(), nil
}
func createDir(w http.ResponseWriter, dir string, pattern string) (*os.File, error) {
	tempFile, err := os.CreateTemp(dir, pattern)
	if err != nil {
		errMsg := "Failed to create temporary file: " + err.Error()
		http.Error(w, errMsg, http.StatusInternalServerError)
		return nil, err
	}

	return tempFile, nil
}

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

func (r *DiskImageRepository) ReadPromptTxt() string {
	path := "prompt3.txt"
	content, err := os.ReadFile(path)
	if err != nil {
		fmt.Println("Failed to read prompt text file:", err)
		return ""
	}
	return string(content)
}

func (r *DiskImageRepository) StringToMap(responseString string) models.PlantData {
	splitString := strings.Split(strings.TrimSpace(responseString), "\n\n")
	entries := make([]string, len(splitString))

	for i := range splitString {
		entries[i] = strings.TrimSpace(splitString[i])
	}

	data := models.PlantData{
		Type:   entries[0],
		Issues: make([]models.PlantIssue, 0),
	}

	entryIter := iter(entries[1:]) // start from one because we already grabbed the first line

	//for i := 1; i < len(entries); i += 3 {
	//	if i+3 > len(entries) {
	//		break
	//	}
	//	issue := models.PlantIssue{
	//		Name:        entries[i],
	//		Description: entries[i+2],
	//		Percent:     entries[i+3],
	//	}
	//
	//	data.Issues = append(data.Issues, issue)
	//	if i+2 > len(entries) {
	//		break
	//	}
	//}

	for {
		if len(entryIter) < 3 {
			break
		}

		deficiencyName, description, percent := <-entryIter, <-entryIter, <-entryIter

		issue := models.PlantIssue{
			Name:        deficiencyName,
			Description: description,
			Percent:     percent,
		}

		data.Issues = append(data.Issues, issue)
	}

	return data
}

func iter(s []string) <-chan string {
	c := make(chan string, len(s))
	for _, value := range s {
		c <- value
	}
	close(c)
	return c
}

func (r *DiskImageRepository) SaveImage(file io.Reader) (string, error) {
	if err := os.MkdirAll("uploads", 0755); err != nil {
		return "", fmt.Errorf("failed to create 'uploads' directory: %w", err)
	}

	tempFile, err := ioutil.TempFile("uploads", "uploaded-*.jpg")
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
