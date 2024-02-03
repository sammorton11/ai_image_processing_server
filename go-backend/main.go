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
	"github.com/rs/cors"
	"google.golang.org/api/option"
)

func main() {
   mux := http.NewServeMux()
   // Create a CORS handler with default options
   handler := cors.AllowAll().Handler(mux)


   // Add your existing route
   mux.HandleFunc("/process_image_url", processImageHandler)
   mux.HandleFunc("/process_image_file", processFileHandler)


   port := 5000
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
   fmt.Println(result)
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
   err := r.ParseMultipartForm(80 << 20) // 10 MB limit for the file size
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




// ReadImageURL reads an image from a URL and resizes it if needed
func readImageURL(url string) ([]byte, error) {
	// Make an HTTP request to get the image
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to make HTTP request: %w", err)
	}
	defer resp.Body.Close()

	// Read the image data from the response body
	imageBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read image from response body: %w", err)
	}

	return imageBytes, nil
}



func sendImageURL(pathToImage string) (string, error) {
   ctx := context.Background()

	// Access your API key as an environment variable (see "Set up your API key" above)
	client, err := genai.NewClient(ctx, option.WithAPIKey("AIzaSyBJPw1CZn5bUXyb309NcteN1mov6KkNCNw"))
	if err != nil {
		log.Fatal(err)
	}
	defer client.Close()

	// For text-and-image input (multimodal), use the gemini-pro-vision model
	model := client.GenerativeModel("gemini-pro-vision")

   // Read image from URL
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
	ctx := context.Background()

	client, err := genai.NewClient(ctx, option.WithAPIKey("AIzaSyBJPw1CZn5bUXyb309NcteN1mov6KkNCNw"))
	if err != nil {
		return "", fmt.Errorf("failed to create AI client: %w", err)
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-pro-vision")

	imageBytes, err := os.ReadFile(pathToImage)
	if err != nil {
		return "", fmt.Errorf("failed to read image file: %w", err)
	}
	promptTxt := readPromptTxt()

	prompt := []genai.Part{
		genai.ImageData("jpeg", imageBytes),
		genai.Text(promptTxt),
	}
	resp, err := model.GenerateContent(ctx, prompt...)
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
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
            fmt.Println("Idk man")
		}
	}

	return "", nil
}



func readPromptTxt() string {
   path := "/home/sammorton/Projects/ai_image_processing_server/go-backend/prompt2.txt" 
   content, err := os.ReadFile(path)
   if err != nil {
      log.Fatal(err)
   }

   text := string(content)

   return text
}


// Process the response string from the LLM API into a dictionary to send as JSON
func stringToMap2(responseString string) map[string]interface{} {
	// Split the response by empty lines
	splitString := strings.Split(strings.TrimSpace(responseString), "\n\n")
	entries := make([]string, len(splitString))
	for i := range splitString {
		entries[i] = strings.TrimSpace(splitString[i])
	}

	// Create a map to store the result
	data := make(map[string]interface{})

	// Add the "type" field to the map
	data["type"] = entries[0]

	// Add the "issues" field to the map as a slice
	data["issues"] = make([]map[string]interface{}, 0)

	// Iterate over entries starting from the second entry
	for i := 1; i < len(entries); i += 3 {
		deficiencyName := entries[i]
		description := entries[i+1]
		percent := entries[i+2]

		// Add a map for each issue to the "issues" slice
		issue := map[string]interface{}{
			"name":        deficiencyName,
			"description": description,
			"percent":     percent,
		}

		data["issues"] = append(data["issues"].([]map[string]interface{}), issue)
	}

   fmt.Println(data)

	return data
}



// PlantIssue represents an individual issue in the plant data
type PlantIssue struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Percent     string `json:"percent"`
}

// PlantData represents the entire plant data
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

	// Create a PlantData instance
	data := PlantData{
		Type:   entries[0],
		Issues: make([]PlantIssue, 0),
	}

	// Iterate over entries starting from the second entry
	iterEnt := iter(entries[1:]) // Skip the first entry
	for {
		// Check if there are enough entries to process
		if len(iterEnt) < 3 {
			break
		}

		// Extract values from the iterator
		deficiencyName := <-iterEnt
		description := <-iterEnt
		percent := <-iterEnt

		// Add a PlantIssue to the "issues" slice
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
      fmt.Println(err.Error())
      http.Error(w, "Failed to read file: "+err.Error(), http.StatusInternalServerError)
      return "", err
   }

   // Ensure the "uploads" directory exists
   err_ := os.MkdirAll("uploads", 0755)
   if err_ != nil {
      http.Error(w, "Failed to create 'uploads' directory: "+err.Error(), http.StatusInternalServerError)
      return "", err
   }

   // Create a temporary file in the "uploads" directory
   tempFile, err := os.CreateTemp("uploads", "uploaded-*.jpg")
   if err != nil {
      http.Error(w, "Failed to create temporary file: "+err.Error(), http.StatusInternalServerError)
      return "", err
   }
   defer tempFile.Close()

   _, err = tempFile.Write(fileBytes)
   if err != nil {
      http.Error(w, "Failed to write to temporary file: "+err.Error(), http.StatusInternalServerError)
      return "", err
   }

   return tempFile.Name(), nil
}
