import requests
import json
import os

ENDPOINT = "https://apifabopenai.openai.azure.com/openai/deployments/gpt-4/chat/completions?api-version=2024-02-15-preview"

# Your Azure OpenAI API key
API_KEY = os.getenv("AZ_OPENAI_API_KEY")

# ------------------------------------------------------- #

def get_gpt4_response(prompt, system_message="You are a helpful assistant.", max_tokens=150):
    """
    Sends a prompt to the Azure OpenAI GPT-4 API and returns the structured response.

    Args:
        prompt (str): The user's input message.
        system_message (str): The system-level instruction for the assistant.
        max_tokens (int): The maximum number of tokens to generate in the response.

    Returns:
        dict: The JSON response from the API parsed into a Python dictionary.
    """
    # Define the headers
    headers = {
        "Content-Type": "application/json",
        "api-key": API_KEY
    }

    # Construct the request payload
    payload = {
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7,  # Adjust creativity
        "n": 1,               # Number of responses to generate
        "stop": None          # Define stop sequences if needed
    }

    try:
        # Send the POST request to the Azure OpenAI API
        response = requests.post(ENDPOINT, headers=headers, json=payload)

        # Raise an exception for HTTP error codes
        response.raise_for_status()

    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")  # HTTP error
        print(f"Response content: {response.text}")
        return None
    except Exception as err:
        print(f"An error occurred: {err}")  # Other errors
        return None

    # Parse the JSON response
    response_json = response.json()

    return response_json

def print_structured_response(response_json):
    """
    Prints the structured response from the GPT-4 API.

    Args:
        response_json (dict): The JSON response from the API.
    """
    if not response_json:
        print("No response to display.")
        return

    # Extract relevant information
    try:
        choices = response_json.get("choices", [])
        if not choices:
            print("No choices found in the response.")
            return

        for idx, choice in enumerate(choices):
            message = choice.get("message", {})
            role = message.get("role", "unknown")
            content = message.get("content", "")
            finish_reason = choice.get("finish_reason", "unknown")

            print(f"--- Choice {idx + 1} ---")
            print(f"Role: {role}")
            print("Content:")
            print(content)
            print(f"Finish Reason: {finish_reason}")
            print("----------------------\n")

    except Exception as e:
        print(f"Error processing the response: {e}")

def main():
    """
    Main function to execute the script.
    """
    print("Azure OpenAI GPT-4 Structured Output Script")
    print("------------------------------------------\n")

    # Example prompt; you can modify this or take user input
    user_prompt = "Can you provide a summary of the latest advancements in artificial intelligence?"

    print(f"User Prompt: {user_prompt}\n")

    # Get the response from GPT-4
    response = get_gpt4_response(user_prompt)

    # Print the structured response
    print_structured_response(response)

if __name__ == "__main__":
    main()