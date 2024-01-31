import google.generativeai as genai
import imageio.v2 as iio
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv
import logging
import os


load_dotenv()

# Replace with your actual API key
api_key = os.getenv("API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro-vision')

app = Flask(__name__)
CORS(app)
app.app_context()
logging.basicConfig(level=logging.DEBUG)


# Helper function to read an image from a local path
def read_image(path):
    img = iio.imread(path)
    return Image.fromarray(img)


def send_image_file(image):
    try:
        with open('example.txt', 'r', encoding='utf-8') as file:
            example = file.read()
    except FileNotFoundError:
        print("No example file found")

    promt = example

    # Generate content using the model
    response = model.generate_content(
        [promt, image],
        stream=True
    )
    response.resolve()
    print("Response: " + str(response.candidates))
    response_string = response.candidates[0].content.parts[0].text
    print("Response: " + str(response_string))

    # Take the string from the response and format it into a dictionary
    response_as_dictionary = string_to_dict(response_string)

    return response_as_dictionary


def send_image_url(image_path):
    img = read_image(image_path)

    try:
        with open('example.txt', 'r', encoding='utf-8') as file:
            example = file.read()
    except FileNotFoundError:
        print("No example file found")

    promt = example

    try:
        response = model.generate_content(
            [promt, img],
            stream=True
        )
        response.resolve()
        response_string = response.candidates[0].content.parts[0].text

        # Take the string from the response and format it into a dictionary
        response_as_dictionary = string_to_dict(response_string)

        return response_as_dictionary

    except Exception as e:
        return jsonify({
            "error": f"Server Error - {e}",
            "status": 500,
            "data": None
        })


def string_to_dict(response_string):
    # Split the response by empty lines
    entries = [entry.strip() for entry in response_string.strip().split('\n\n')]
    print("Entries: " + str(entries))

    # Extract the plant type
    plant_type = entries[0]

    # Initialize the data dictionary
    data = {
        "type": plant_type,
        "issues": []
    }

    print("Entries: " + str(entries))

    # There has to be a better way to do this
    # Iterate over entries starting from the second entry
    for i in range(1, len(entries), 3):
        if i + 1 >= len(entries) or i + 2 >= len(entries):
            break

        name = entries[i] # first line of response is the name or type
        description = entries[i + 1] # second line of response is the description
        percent = entries[i + 2] # third line of response is the probablity

        data["issues"].append({
            "name": name,
            "description": description,
            "percent": percent
        })

    return data


@app.route('/', methods=['POST'])
def response_text():
    data = request.get_json()
    image_path = data.get('image_url', '')  # Adjust the parameter name

    try:
        ai_response = send_image_url(image_path)
        print("AI Response: " + str(ai_response))

    except Exception as e:
        error = jsonify({
            "error": f"Server Error - {e}",
            "status": 500,
            "data": None
        })
        print(error)

        return error

    return jsonify(ai_response)


@app.route('/process_image', methods=['POST'])
def process_image():
    try:
        img_file = request.files['img']
        img = read_image(img_file)

        response_text = send_image_file(img)
        print(response_text)

        return response_text

    except Exception as e:
        logging.exception(e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
