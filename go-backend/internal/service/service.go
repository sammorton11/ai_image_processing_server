package service

import (
	"context"
	"fmt"
	"io"
	"log"
	"main/internal/models"
	_ "main/internal/models"
	"main/internal/repository"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

const (
	uploadDir   = "uploads"
	tempFileFmt = "uploaded-*.jpg"
)

type ImgProcess interface {
	StringToMap(responseString string) models.PlantData
	SendImageURL(imageURL string) (string, error)
	SendImageFile(imageFile string) (string, error)
	FileTransfer(w http.ResponseWriter, file multipart.File) (string, error)
}

type ImgProcessServ struct {
	imgProc       ImgProcess
	imgRepository repository.ImageRepository
}

func New(repo repository.ImageRepository) *ImgProcessServ {
	return &ImgProcessServ{
		imgRepository: repo,
	}
}

// StringToMap - Response from api is a string and is formatted in a way that we can parse and map each line to a map
func StringToMap(responseString string) models.PlantData {
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

	for {
		if len(entryIter) < 3 {
			break
		}

		deficiencyName := <-entryIter
		description := <-entryIter
		percent := <-entryIter

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

func (s *ImgProcessServ) sendFile(ctx context.Context, imageBytes []byte) (string, error) {
	apiKey := os.Getenv("API_KEY")

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return "", fmt.Errorf("failed to create AI client: %w", err)
	}
	defer func(client *genai.Client) {
		err := client.Close()
		if err != nil {
			fmt.Println(err)
		}
	}(client)

	model := client.GenerativeModel("gemini-pro-vision")

	promptTxt := s.imgRepository.ReadPromptTxt()
	prompt := []genai.Part{
		genai.ImageData("jpeg", imageBytes),
		genai.Text(promptTxt),
	}

	resp, err := model.GenerateContent(ctx, prompt...)
	if err != nil {
		return "", fmt.Errorf("error generating content: %w", err)
	}

	if resp == nil {
		return "", fmt.Errorf("unexpected nil response from model.GenerateContent")
	}

	parts := resp.Candidates[0].Content.Parts
	for _, part := range parts {
		switch concretePart := part.(type) {
		case genai.Text:
			partStr := string(concretePart)
			return partStr, nil
		case genai.Blob:
			return "", nil
		default:
			return "", nil
		}
	}

	return "", nil
}

func (s *ImgProcessServ) SendImageURL(pathToImage string) (string, error) {
	imageBytes, err := s.imgRepository.ReadImgURL(pathToImage)
	if err != nil {
		log.Fatal(err)
	}

   ctx := context.Background()

   partStr, err := s.sendFile(ctx, imageBytes)
   if err != nil {
      return "", fmt.Errorf("failed to send file: %w", err)
   }

   return partStr, nil
}

func (s *ImgProcessServ) SendImageFile(pathToImage string) (string, error) {
	imageBytes, err := os.ReadFile(pathToImage)
	if err != nil {
		log.Fatal(err)
	}

   ctx := context.Background()

   partStr, err := s.sendFile(ctx, imageBytes)
   if err != nil {
      return "", fmt.Errorf("failed to send file: %w", err)
   }

   return partStr, nil
}

func FileTransfer(w http.ResponseWriter, file multipart.File) (string, error) {
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
