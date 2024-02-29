import google.generativeai as genai
import imageio.v2 as iio
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv
import logging
import os

load_dotenv()

api_key = os.getenv("API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-pro-vision')

app = Flask(__name__)
CORS(app)
app.app_context()
logging.basicConfig(level=logging.DEBUG)


def read_image(path):
    img = iio.imread(path)
    return Image.fromarray(img)


def send_image_file(image):
    try:
        with open('prompt2.txt', 'r', encoding='utf-8') as file:
            file_text = file.read()
    except FileNotFoundError:
        print("No example file found")

    prompt = file_text

    # Generate content using the model
    response = model.generate_content(
        [prompt, image],
        stream=True
    )
    response.resolve()
    response_string = response.candidates[0].content.parts[0].text
    response_as_dictionary = string_to_dict(response_string)

    return response_as_dictionary


def send_image_url(image_path):
    img = read_image(image_path)

    try:
        with open('prompt2.txt', 'r', encoding='utf-8') as file:
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

        print("RESPONSE FROM AI:")
        print(response_string)

        response_as_dictionary = string_to_dict(response_string)

        return response_as_dictionary

    except Exception as e:
        return jsonify({
            "error": f"Server Error - {e}",
            "status": 500,
            "data": None
        })


# Process the response string from the LLM API into a dictionary to send as json
def string_to_dict(response_string):
    # Split the response by empty lines
    split_string = response_string.strip().split('\n\n')
    entries = [entry.strip() for entry in split_string]

    plant_type = entries[0]
    data = {
        "type": plant_type,
        "issues": []
    }

    # Iterate over entries starting from the second entry
    iter_ent = iter(entries[1:])  # Skip the first entry

    for deficiency_name, desc, percent in zip(iter_ent, iter_ent, iter_ent):
        data["issues"].append({
            "name": deficiency_name,
            "description": desc,
            "percent": percent
        })

    return data


@app.route('/process_image_url', methods=['POST'])
def process_image_url():
    data = request.get_json()
    image_path = data.get('image_url', '')

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


@app.route('/process_image_file', methods=['POST'])
def process_image_file():
    try:
        img_file = request.files['img']
        img = read_image(img_file)
        response_text = send_image_file(img)
        return response_text

    except Exception as e:
        logging.exception(e)
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
