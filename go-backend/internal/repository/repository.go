package repository

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
)

type ImageRepository interface {
	ReadImgURL(url string) ([]byte, error)
	ReadImgFile(ctx context.Context, filePath string) ([]byte, error)
	ReadPromptTxt() string
}

type DiskImageRepository struct{}

func NewDiskImgRepo() *DiskImageRepository {
	return &DiskImageRepository{}
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

func (r *DiskImageRepository) ReadImgFile(ctx context.Context, filePath string) ([]byte, error) {
	return os.ReadFile(filePath)
}

func (r *DiskImageRepository) ReadPromptTxt() string {
	path := "prompt3.txt"
	content, err := os.ReadFile(path)
	if err != nil {
		log.Fatal(err)
	}

	text := string(content)

	return text
}
