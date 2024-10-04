import pdfplumber
import re
import os
import json
import logging

# Configure logging
logging.basicConfig(filename='hardware_extraction.log', level=logging.WARNING,
                    format='%(asctime)s - %(levelname)s - %(message)s')

# Path to the PDF file
pdf_path = r"C:\Users\anton\Documents\Jobb\Test\Configuration report.pdf"

def extract_site_info(pdf_path):
    if not os.path.isfile(pdf_path):
        print(f"Error: The file {pdf_path} does not exist.")
        return {}

    site_info = {}
    current_site = None
    in_hardware_list = False
    hardware_lines = []

    # Regex patterns to match required sections
    site_pattern = re.compile(r"Name:\s+([A-Za-z0-9\-]+)", re.IGNORECASE)
    host_name_pattern = re.compile(r"Host name:\s+([A-Za-z0-9\- ]+)", re.IGNORECASE)
    hardware_start_pattern = re.compile(r"Hardware list", re.IGNORECASE)
    storage_start_pattern = re.compile(r"Storage", re.IGNORECASE)
    single_line_hardware_pattern = re.compile(r"^(.+?)\s+\((\d{1,3}(?:\.\d{1,3}){3})\)\s+❒✓$", re.IGNORECASE)
    multi_line_hardware_pattern = re.compile(r"^(.+?)\s+-\s+(\d{1,3}(?:\.\d{1,3}){3})\s+(.+)$", re.IGNORECASE)

    with pdfplumber.open(pdf_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            text = page.extract_text()
            if not text:
                continue

            lines = text.split('\n')
            for line_number, line in enumerate(lines, start=1):
                # Extract site name
                site_match = site_pattern.search(line)
                if site_match:
                    # Save previous site's hardware list
                    if current_site and hardware_lines:
                        site_info[current_site]['hardware'] = hardware_lines
                        hardware_lines = []
                        in_hardware_list = False

                    current_site = site_match.group(1).strip()
                    site_info[current_site] = {'host_name': None, 'hardware': []}
                    in_hardware_list = False
                    continue

                # Extract host name
                host_name_match = host_name_pattern.search(line)
                if host_name_match and current_site:
                    site_info[current_site]['host_name'] = host_name_match.group(1).strip()
                    continue

                # Enter hardware list section
                if hardware_start_pattern.search(line):
                    in_hardware_list = True
                    hardware_lines = []
                    continue

                # Exit hardware list when Storage section starts
                if storage_start_pattern.search(line):
                    if current_site and hardware_lines:
                        site_info[current_site]['hardware'] = hardware_lines
                        hardware_lines = []
                    in_hardware_list = False
                    continue

                # Collect hardware lines if inside hardware list
                if in_hardware_list and current_site:
                    stripped_line = line.strip()

                    # Skip unwanted lines
                    if stripped_line in {'Name Enabled', 'r3'}:
                        continue

                    # Handle single-line hardware entries
                    single_match = single_line_hardware_pattern.match(stripped_line)
                    if single_match:
                        hardware_name = single_match.group(1).strip()
                        ip_address = single_match.group(2).strip()
                        hardware_lines.append(f"{hardware_name} ({ip_address})")
                        continue

                    # Handle multi-line hardware entries
                    multi_match = multi_line_hardware_pattern.match(stripped_line)
                    if multi_match:
                        hardware_name = multi_match.group(1).strip()
                        ip_address = multi_match.group(2).strip()
                        hardware_description = multi_match.group(3).strip()
                        hardware_lines.append(f"{hardware_name} - {ip_address} {hardware_description}")
                        continue

                    # If none of the above, accumulate lines for multi-line entries
                    if stripped_line:
                        hardware_lines.append(stripped_line)

        # After processing all pages, ensure the last site's hardware is captured
        if current_site and hardware_lines:
            site_info[current_site]['hardware'] = hardware_lines

    return site_info

def display_site_info(site_info):
    for site, details in site_info.items():
        print(f"Site: {site}")
        print(f"Host Name: {details['host_name'] if details['host_name'] else 'N/A'}")
        print("Hardware List:")
        if details['hardware']:
            for hw in details['hardware']:
                print(f"  - {hw}")
        else:
            print("  - No hardware listed.")
        print()

def save_site_info_to_json(site_info, output_path):
    try:
        with open(output_path, 'w', encoding='utf-8') as json_file:
            json.dump(site_info, json_file, indent=4, ensure_ascii=False)
        print(f"Site information saved to {output_path}")
    except Exception as e:
        print(f"Error saving JSON: {e}")

if __name__ == "__main__":
    site_info = extract_site_info(pdf_path)

    if site_info:
        display_site_info(site_info)
        output_json_path = r"C:\Users\anton\Documents\Jobb\Test\site_info.json"
        save_site_info_to_json(site_info, output_json_path)
    else:
        print("No site information extracted.")
