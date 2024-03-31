package service

import (
	"main/internal/models"
	"main/internal/repository"
	"reflect"
	"testing"
)

var repo = repository.NewDiskImgRepo()

func TestStringToMap(t *testing.T) {
	// Sample input string
	input := `
      Tomato Plant


      Blossom End Rot

      The tomatoes on your tomato plant are developing blossom end rot, a common issue stemming from calcium deficiency. Calcium is indispensable for tomatoes as it fortifies cell walls, averting rot. A lack of calcium can lead to blossom end rot, characterized by brown or black spots at the tomato's base. Remediation involves administering a calcium-rich fertilizer to the soil or utilizing a calcium spray.

      80%


      Bacterial Spot

      The tomato plant leaves have developed black spots, a prevalent issue attributable to a bacterial infection. The likeliest culprit is bacterial spot, caused by the bacterium Xanthomonas vesicatoria. Bacterial spot can manifest as black spots on leaves, stems, and fruit. Addressing this involves employing a copper-based bactericide or removing and destroying infected plant material.

      70%


      Septoria Leaf Spot

      The tomato plant leaves have developed brown spots, a prevalent issue attributable to a fungal infection. The likeliest culprit is Septoria leaf spot, caused by the fungus Septoria lycopersici. Septoria leaf spot can manifest as brown spots on leaves, which can eventually lead to defoliation. Addressing this involves employing a fungicide or removing and destroying infected plant material.

      60%
   `

	// Expected output PlantData struct
	expected := models.PlantData{
		Type: "Tomato Plant",
		Issues: []models.PlantIssue{
			{
				Name:        "Blossom End Rot",
				Description: "The tomatoes on your tomato plant are developing blossom end rot, a common issue stemming from calcium deficiency. Calcium is indispensable for tomatoes as it fortifies cell walls, averting rot. A lack of calcium can lead to blossom end rot, characterized by brown or black spots at the tomato's base. Remediation involves administering a calcium-rich fertilizer to the soil or utilizing a calcium spray.",
				Percent:     "80%",
			},
			{
				Name:        "Bacterial Spot",
				Description: "The tomato plant leaves have developed black spots, a prevalent issue attributable to a bacterial infection. The likeliest culprit is bacterial spot, caused by the bacterium Xanthomonas vesicatoria. Bacterial spot can manifest as black spots on leaves, stems, and fruit. Addressing this involves employing a copper-based bactericide or removing and destroying infected plant material.",
				Percent:     "70%",
			},
			{
				Name:        "Septoria Leaf Spot",
				Description: "The tomato plant leaves have developed brown spots, a prevalent issue attributable to a fungal infection. The likeliest culprit is Septoria leaf spot, caused by the fungus Septoria lycopersici. Septoria leaf spot can manifest as brown spots on leaves, which can eventually lead to defoliation. Addressing this involves employing a fungicide or removing and destroying infected plant material.",
				Percent:     "60%",
			},
		},
	}

	result := repo.StringToMap(input)

	// Compare the result with the expected output
	if !reflect.DeepEqual(result, expected) {
		t.Errorf("StringToMap failed: got %+v, want %+v", result, expected)
	}
}

func TestStringToMapEmptyInput(t *testing.T) {
	input := ""

	// Expected empty PlantData struct
	expected := models.PlantData{Issues: []models.PlantIssue{}}

	result := repo.StringToMap(input)

	if !reflect.DeepEqual(result, expected) {
		t.Errorf("StringToMap failed: got %+v, want %+v", result, expected)
	}
}
