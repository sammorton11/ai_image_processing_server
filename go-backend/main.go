package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strings"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"google.golang.org/api/option"
)

const (
   maxFileSize = 80 << 20
   uploadDir = "uploads"
   tempFileFmt = "uploaded-*.jpg"
)


func main() {
   mux := http.NewServeMux()
   handler := cors.AllowAll().Handler(mux)

   err := godotenv.Load()
      if err != nil {
      log.Fatal("Error loading .env file")
   }

   // Routes
   mux.HandleFunc("/process_image_url", processImageHandler)
   mux.HandleFunc("/process_image_file", processFileHandler)

   port := 5001
   addr := fmt.Sprintf(":%d", port)
   fmt.Printf("Server is running on http://localhost%s\n", addr)
   log.Fatal(http.ListenAndServe(addr, handler))
}


func processImageHandler(w http.ResponseWriter, r *http.Request) {

   // Read the request body
   body, err := io.ReadAll(r.Body)
   if err != nil {
     http.Error(w, "Failed to read request body", http.StatusBadRequest)
     return
   }
   defer r.Body.Close()

   // Unmarshal the JSON body into a map
   var requestBody map[string]string
   if err := json.Unmarshal(body, &requestBody); err != nil {
     http.Error(w, "Failed to decode JSON body", http.StatusBadRequest)
     return
   }

   fmt.Println(requestBody)

   // Extract the 'image_url' field from the map
   imageFilePath, ok := requestBody["image_url"]
   if !ok {
     http.Error(w, "Missing 'image_url' in JSON payload", http.StatusBadRequest)
     return
   }

   // Call your function with the image file path
   result, err := sendImageURL(imageFilePath)
   if err != nil {
     http.Error(w, "Internal Server Error", http.StatusInternalServerError)
     return
   }
   strMap := stringToMap(result)

   // Marshal the map to JSON
   jsonResponse, err := json.Marshal(strMap)
   if err != nil {
     http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
     return
   }

   w.Header().Set("Content-Type", "application/json")
   w.Write(jsonResponse)
}


func processFileHandler(w http.ResponseWriter, r *http.Request) {
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
   defer file.Close()


   pathName, err := fileTransfer(w, r, file) 
   if err != nil {
      http.Error(w, "File transfer fail - Internal Server Error: "+err.Error(), http.StatusInternalServerError)
      return
   }

   result, err := sendImageFile(pathName)
   if err != nil {
      http.Error(w, "Failed to send file to api - Internal Server Error: "+err.Error(), http.StatusInternalServerError)
      return
   }

   strMap := stringToMap(result)

   // Marshal the map to JSON
   jsonResponse, err := json.Marshal(strMap)
   if err != nil {
      http.Error(w, "Failed to encode JSON: "+err.Error(), http.StatusInternalServerError)
      return
   }

   w.Header().Set("Content-Type", "application/json")
   w.Write(jsonResponse)
}


func readImageURL(url string) ([]byte, error) {
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


func sendImageURL(pathToImage string) (string, error) {
   api_key := os.Getenv("API_KEY")
   ctx := context.Background()

	client, err := genai.NewClient(ctx, option.WithAPIKey(api_key))
   if err != nil {
      return "", fmt.Errorf("failed to create AI client: %w", err)
   }
   defer client.Close()

   model := client.GenerativeModel("gemini-pro-vision")

   imageBytes, err := readImageURL(pathToImage)
   if err != nil {
       log.Fatal(err)
   }

   promptTxt := readPromptTxt()
   prompt := []genai.Part{
     genai.ImageData("jpeg", imageBytes),
     genai.Text(promptTxt),
   }
   resp, err := model.GenerateContent(ctx, prompt...)
   fmt.Println(resp)

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


func sendImageFile(pathToImage string) (string, error) {
   api_key := os.Getenv("API_KEY")
   ctx := context.Background()

   // For text-and-image input (multimodal), use the gemini-pro-vision model
	client, err := genai.NewClient(ctx, option.WithAPIKey(api_key))
   if err != nil {
      return "", fmt.Errorf("failed to create AI client: %w", err)
   }
   defer client.Close()
   model := client.GenerativeModel("gemini-pro-vision")
   fmt.Println("Made it to here!")

   imageBytes, err := os.ReadFile(pathToImage)
   if err != nil {
       log.Fatal(err)
   }

   fmt.Println("readPromptTxt")
   
   promptTxt := readPromptTxt()
   prompt := []genai.Part{
     genai.ImageData("jpeg", imageBytes),
     genai.Text(promptTxt),
   }

   resp, err := model.GenerateContent(ctx, prompt...)
   if err != nil {
      return "", fmt.Errorf("error generating content: %w", err)
   }
   fmt.Println("resp: HELP")

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



func readPromptTxt() string {
   path := "prompt3.txt" 
   content, err := os.ReadFile(path)
   if err != nil {
      log.Fatal(err)
   }

   text := string(content)

   return text
}

type PlantIssue struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Percent     string `json:"percent"`
}

type PlantData struct {
	Type   string        `json:"type"`
	Issues []PlantIssue `json:"issues"`
}

func stringToMap(responseString string) PlantData {
	// Split the response by empty lines
	splitString := strings.Split(strings.TrimSpace(responseString), "\n\n")
	entries := make([]string, len(splitString))
	for i := range splitString {
		entries[i] = strings.TrimSpace(splitString[i])
	}
	data := PlantData{
		Type:   entries[0],
		Issues: make([]PlantIssue, 0),
	}

	entryIter := iter(entries[1:])  // start from one because we already grabbed the first line
	for {
		if len(entryIter) < 3 {
			break
		}

		deficiencyName := <-entryIter
		description := <-entryIter
		percent := <-entryIter

		issue := PlantIssue{
			Name:        deficiencyName,
			Description: description,
			Percent:     percent,
		}

		data.Issues = append(data.Issues, issue)
	}

	return data
}

// Helper function to create an iterator over a slice of strings
func iter(s []string) <-chan string {
	c := make(chan string, len(s))
	for _, value := range s {
		c <- value
	}
	close(c)
	return c
}


func fileTransfer(w http.ResponseWriter, r *http.Request, file multipart.File) (string, error) {
   // Read the file data
   fileBytes, err := io.ReadAll(file)
   if err != nil {
      errMsg := "Failed to read file: " + err.Error()
      fmt.Println(errMsg)
      http.Error(w, errMsg, http.StatusInternalServerError)
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
   tempFile, err := os.CreateTemp(uploadDir, tempFileFmt)
   if err != nil {
      errMsg := "Failed to create temporary file: " + err.Error()
      fmt.Println(errMsg)
      http.Error(w, errMsg, http.StatusInternalServerError)
      return "", err
   }
   defer tempFile.Close()

   // Write the file data to the temporary file
   _, err = tempFile.Write(fileBytes)
   if err != nil {
      errMsg := "Failed to write to temporary file: " + err.Error()
      fmt.Println(errMsg)
      http.Error(w, errMsg, http.StatusInternalServerError)
      return "", err
   }

   return tempFile.Name(), nil
}
