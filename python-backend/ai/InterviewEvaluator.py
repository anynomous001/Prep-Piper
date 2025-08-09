"""
An rag workflow for evaluating the performance of Performed interview.
"""
import json
import os


def load_transcripts(file_path):
    """
    Load transcripts from a JSON file.

    Args:
        file_path (str): The path to the JSON file containing the transcripts.
    
    Returns:
        dict: A dictionary containing the transcripts.
    
    Raises:
        FileNotFoundError: If the file doesn't exist.
        json.JSONDecodeError: If the file contains invalid JSON.
    """
    try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            transcripts = json.load(f)
            return transcripts
    
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        raise
    except Exception as e:
        print(f"Error loading transcripts: {e}")
        raise

print(load_transcripts(r'interviews\627dc248.json'))

