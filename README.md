# Plant Defiency AI Detection Application
https://plantdef-ai.netlify.app

This application leverages Google's Generative AI capabilities to process images of plants with deficiencies. It provides two endpoints, one for handling image URLs and another for image files.

Recently added the go server which is becoming the primary server.

## Dependencies

    google.generativeai: Provides access to Google's Generative AI capabilities.
    
    imageio.v2: A library for reading and writing images.
    
    Flask: A web framework for creating web applications in Python.
    
    flask_cors: Flask extension for handling Cross-Origin Resource Sharing (CORS).
    
    PIL (Python Imaging Library): Used for working with images.
    
    dotenv: A library for reading variables from a .env file.
    
    logging: Python's logging module for logging messages.
    
    os: A module for interacting with the operating system.


## Configuration

    Environment Variables:
        Create a .env file and add your API key:

        env

        API_KEY=your_google_generative_ai_api_key

    Google Generative AI Setup:
        Configure the Google Generative AI with the obtained API key.
        Initialize a Generative Model called 'gemini-pro-vision'.

## Flask App Setup

    Create a Flask app and set up Cross-Origin Resource Sharing (CORS).
    Configure logging for the app.

## Helper Functions

    read_image(path):
    Reads an image from a local path using imageio and converts it to a PIL Image object.

    send_image_file(image):
    Sends an image file to the Google Generative AI model and returns the response as a dictionary.

    send_image_url(image_path):
    Reads an image from a specified path, sends it to the model, and returns the response as a dictionary.

    string_to_dict(response_string):
    Parses the response string from the model and converts it into a dictionary.

## Flask Routes

    /:
    Defines a route for handling POST requests. Expects a JSON payload with an "image_url" parameter, sends the image to the model, and returns the AI-generated response as JSON.

    /process_image:
    Defines a route for handling POST requests with an image file. Reads the image, sends it to the model, and returns the AI-generated response as JSON.

## Main Block

    Runs the Flask app on port 5000 in debug mode if the script is executed directly.

![Screen Shot 2024-02-18 at 2 02 32 AM](https://github.com/sammorton11/ai_image_processing_server/assets/86651172/35cd2c3f-7f37-4661-b6c5-ccf883ab7a1c)
![Screen Shot 2024-02-18 at 2 05 55 AM](https://github.com/sammorton11/ai_image_processing_server/assets/86651172/55c53084-520c-4826-9157-6048e0d01f10)

![Screen Shot 2024-02-18 at 2 03 09 AM](https://github.com/sammorton11/ai_image_processing_server/assets/86651172/d90294f3-425f-44fb-aa51-9e604259faea)
![Screen Shot 2024-02-18 at 2 06 07 AM](https://github.com/sammorton11/ai_image_processing_server/assets/86651172/1aabe0cf-7341-48fa-accb-64caff4f5787)



