import spacy
import json

# Load spaCy model
nlp = spacy.load("en_core_web_sm")

# Example response from the API
api_response = """Poinsettia
Nutrient deficiency
This is a common problem with poinsettias, especially if they are not getting enough fertilizer. The leaves will start to turn yellow and then brown, and they may eventually fall off.
80%
Overwatering
Poinsettias do not like to be overwatered, and this can cause the leaves to turn yellow and wilt.
60%"""

# Split the response into lines
lines = api_response.split('\n')

# Initialize variables
result_json = {
    'plant_type': lines[0],
    'issues': []
}

# Iterate through lines and extract information
i = 1
while i < len(lines) - 3:  # Adjusted to ensure there are enough lines for each issue
    current_issue = {
        'name': lines[i],
        'description': lines[i + 1],
        'likeliness_percentage': int(lines[i + 2].split('%')[0])
    }
    result_json['issues'].append(current_issue)
    i += 4

# Print or use the resulting JSON
print(json.dumps(result_json, indent=2))
print(result_json)

