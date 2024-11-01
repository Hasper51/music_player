import syncedlyrics
import re
import json


def get_lyrics(title, artist):
    # Input from user
    
    lrc = syncedlyrics.search(title + " " + artist)
    print(lrc)
    # Initialize a list to store JSON entries
    json_data = []

    # Define a regex pattern to extract minutes, seconds, and milliseconds
    pattern = r'\[(\d+):(\d+)\.(\d+)\] (.+)'

    # Helper function to convert timestamp to milliseconds
    def convert_to_milliseconds(minutes, seconds, milliseconds):
        return (int(minutes) * 60 * 1000) + (int(seconds) * 1000) + int(milliseconds)

    # Process each line in the lyrics
    lines = lrc.split('\n')
    for line in lines:
        match = re.match(pattern, line)
        if match:
            minutes, seconds, milliseconds, text = match.groups()
            timestamp_ms = convert_to_milliseconds(minutes, seconds, milliseconds)
            json_entry = {
                "time": timestamp_ms,
                "lyrics": text
            }
            json_data.append(json_entry)

    # Convert the list of JSON entries to a JSON-formatted string
    json_string = json.dumps(json_data, indent=4)

    # Print the JSON string
    return json_string


