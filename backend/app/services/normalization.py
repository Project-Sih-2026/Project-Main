import re

def normalize_plate(raw_text: str) -> str:
    """
    Normalizes license plate strings according to standard ALPR conventions:
    - Strips whitespace, dots, hyphens, and symbols
    - Converts to uppercase
    - Retains only standard uppercase alphanumeric characters [A-Z0-9]
    """
    if not raw_text:
        return ""
    
    # Strip whitespace and convert to uppercase
    cleaned = raw_text.strip().upper()
    
    # Remove any non-alphanumeric characters
    cleaned = re.sub(r"[^A-Z0-9]", "", cleaned)
    
    return cleaned

def calculate_plate_similarity(plate1: str, plate2: str) -> float:
    """
    Computes normalized Levenshtein similarity between two plate strings.
    """
    norm1 = normalize_plate(plate1)
    norm2 = normalize_plate(plate2)
    
    if norm1 == norm2:
        return 1.0
    if not norm1 or not norm2:
        return 0.0
    
    len1, len2 = len(norm1), len(norm2)
    matrix = [[0] * (len2 + 1) for _ in range(len1 + 1)]
    for i in range(len1 + 1):
        matrix[i][0] = i
    for j in range(len2 + 1):
        matrix[0][j] = j
        
    for i in range(1, len1 + 1):
        for j in range(1, len2 + 1):
            cost = 0 if norm1[i - 1] == norm2[j - 1] else 1
            matrix[i][j] = min(
                matrix[i - 1][j] + 1,      # deletion
                matrix[i][j - 1] + 1,      # insertion
                matrix[i - 1][j - 1] + cost # substitution
            )
            
    dist = matrix[len1][len2]
    max_len = max(len1, len2)
    return max(0.0, 1.0 - (dist / max_len))
