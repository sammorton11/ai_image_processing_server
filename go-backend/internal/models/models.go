package models

type PlantIssue struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Percent     string `json:"percent"`
}

type PlantData struct {
	Type   string        `json:"type"`
	Issues []PlantIssue `json:"issues"`
}
