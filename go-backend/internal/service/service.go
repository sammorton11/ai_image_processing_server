package service

import (
	"context"
	"fmt"
	"log"
	"main/internal/models"
	"main/internal/repository"
	"mime/multipart"
	"net/http"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type ImgProcessServ struct {
	imgRepository repository.ImageRepository
}

func New(repo repository.ImageRepository) *ImgProcessServ {
	return &ImgProcessServ{imgRepository: repo}
}

func (s *ImgProcessServ) SendImageURL(pathToImage string) (string, error) {
	imageBytes, err := s.imgRepository.ReadImgURL(pathToImage)
	if err != nil {
		return "", fmt.Errorf("failed to read image from URL: %w", err)
	}

	return s.sendFile(context.Background(), imageBytes)
}

func (s *ImgProcessServ) SendImageFile(imageFile string) (string, error) {
	imageBytes, err := os.ReadFile(imageFile)
	if err != nil {
		return "", fmt.Errorf("failed to read image file: %w", err)
	}

	return s.sendFile(context.Background(), imageBytes)
}

func (s *ImgProcessServ) sendFile(ctx context.Context, imageBytes []byte) (string, error) {
	apiKey := os.Getenv("API_KEY")
    log.Println("Sending file...")

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
        log.Printf("Error: %s", err.Error())
		return "", fmt.Errorf("failed to create AI client: %s", err.Error())
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-1.5-flash")

	promptTxt := s.imgRepository.ReadPromptTxt()
	prompt := []genai.Part{
		genai.ImageData("jpeg", imageBytes),
		genai.Text(promptTxt),
	}

	resp, err := model.GenerateContent(ctx, prompt...)
	if err != nil {
        log.Printf("Error: %s", err.Error())
		return "", fmt.Errorf("error generating content: %w", err)
	}

	if resp == nil {
        log.Println("response form gemini was a nil response")
		return "", fmt.Errorf("unexpected nil response from model.GenerateContent")
	}

	parts := resp.Candidates[0].Content.Parts
	for _, part := range parts {
		if textPart, ok := part.(genai.Text); ok {
			return string(textPart), nil
		}
	}

	return "", fmt.Errorf("no text part found in response")
}

// StringToMap wraps the repository's StringToMap function, making it accessible to the handler via the service layer
func (s *ImgProcessServ) StringToMap(responseString string) models.PlantData {
	return s.imgRepository.StringToMap(responseString)
}

func (s *ImgProcessServ) FileTransfer(w http.ResponseWriter, file multipart.File) (string, error) {
	return s.imgRepository.FileTransfer(w, file)
}
