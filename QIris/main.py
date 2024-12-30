import json

from UtilityFunctions import is_valid_md5, generate_rainbow_table
from QuantumFunctions import search
import argparse

parser = argparse.ArgumentParser(description="Search for a password in a rainbow table.")
group = parser.add_mutually_exclusive_group()
group.add_argument("--generate-rainbow-table", help="Generate a rainbow table based on the provide list of plaintext.")
group.add_argument("--hash-search", help="MD5 hash to search for.")
args = parser.parse_args()

if args.generate_rainbow_table:
    path = args.generate_rainbow_table
    # Try to open the file, if it fails, print an error message
    try:
        with open(path, 'r', encoding='latin-1') as f:
            plaintexts = f.read().splitlines()
    except FileNotFoundError:
        print("File not found.")
        exit()
    # Check if the file is empty
    if not plaintexts:
        print("File is empty.")
        exit()
    start, end, end_hashed, buckets = generate_rainbow_table(plaintexts)
    json_data = {"start": start,
                 "end": end,
                 "end_hashed": end_hashed,
                 "buckets": buckets}
    # Store the rainbow table in a json file
    with open('./rainbow_table.json', 'w') as f:
        json.dump(json_data, f, indent=4)
    print("Rainbow table generated.")
    exit()
elif args.hash_search:
    md5hash = args.hash_search
    # Check if valid MD5 hash
    if not is_valid_md5(md5hash):
        print("Invalid MD5 hash.")
        exit()
    # retrieve the rainbow table from the json file
    with open('./rainbow_table.json', 'r') as f:
        data = json.load(f)
        start = data["start"]
        end = data["end"]
        end_hashed = data["end_hashed"]
        buckets = data["buckets"]
        # convert bucket keys to integers
        buckets = {int(k): v for k, v in buckets.items()}
    password = search(start, end, end_hashed, buckets, md5hash)
    if password is not None:
        print(f"Password Found! The password is: {password}")
    else:
        print("Hash not found.")


