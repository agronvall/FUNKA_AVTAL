import re
import json

# Sample extracted text (replace this with reading from your file)
extracted_text = """
--- Page 2 ---
Name:
PBCSRV08
Description:

Host name:
PBCSRV08
Local web server address:
http://pbcsrv08:7563/
Web server address:

Time zone:
(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
Hardware list
No hardware defined.
Storage
...
--- Page 2 ---
Name:
PBNVR-AMIRALITET
Description:

Host name:
PBNVR-AMIRALITET
Local web server address:
http://pbnvr-amiralitet:7563/
Web server address:
http://192.168.64.10:7563/
Time zone:
(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
Hardware list
Name
Enabled
Kamera1 - AXIS P3727-PLE Panoramic Camera
(192.168.64.11)
Ì
Storage
...
--- Page 3 ---
Name:
PBNVR-ANDROMFYR
Description:

Host name:
PBNVR-ANDROMFYR
Local web server address:
http://pbnvr-andromfyr:7563/
Web server address:
http://192.168.78.10:7563/
Time zone:
(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna
Hardware list
Name
Enabled
AXIS P3807-PVE Network Camera (192.168.78.12)
Ì
AXIS P3807-PVE Network Camera (192.168.78.15)
Ì
...
"""

# Regular expressions for parsing
site_name_pattern = re.compile(r'^Name:\s*(.+)$', re.IGNORECASE)
host_name_pattern = re.compile(r'^Host name:\s*(.+)$', re.IGNORECASE)
hardware_start_pattern = re.compile(r'^Hardware list', re.IGNORECASE)
section_header_pattern = re.compile(r'^(Storage|Network|Other Sections)', re.IGNORECASE)  # Add other section names as needed
hardware_entry_pattern = re.compile(r'^(.*?)\s*\((\d{1,3}(?:\.\d{1,3}){3})\)\s*Ì?$')

def parse_extracted_text(text):
    sites = {}
    current_site = None
    in_hardware_section = False

    # Split text into lines
    lines = text.split('\n')

    for line in lines:
        line = line.strip()

        if not line:
            continue  # Skip empty lines

        # Check for site name
        site_match = site_name_pattern.match(line)
        if site_match:
            current_site = site_match.group(1).strip()
            sites[current_site] = {
                'host_name': None,
                'hardware': []
            }
            in_hardware_section = False  # Reset flag
            continue

        # Check for host name
        host_match = host_name_pattern.match(line)
        if host_match and current_site:
            sites[current_site]['host_name'] = host_match.group(1).strip()
            continue

        # Check for start of hardware list
        if hardware_start_pattern.match(line):
            in_hardware_section = True
            continue

        # Check for other section headers to end hardware list
        if in_hardware_section and section_header_pattern.match(line):
            in_hardware_section = False
            continue

        # If inside hardware section, parse hardware entries
        if in_hardware_section and current_site:
            hardware_match = hardware_entry_pattern.match(line)
            if hardware_match:
                hardware_name = hardware_match.group(1).strip()
                ip_address = hardware_match.group(2).strip()
                hardware_entry = f"{hardware_name} ({ip_address})"
                sites[current_site]['hardware'].append(hardware_entry)
            else:
                # Handle multi-line entries if they don't match the pattern
                # For example, if the hardware description spans multiple lines
                # You can implement additional logic here
                pass  # For now, we skip lines that don't match

    return sites

# Parse the extracted text
parsed_data = parse_extracted_text(extracted_text)

# Display the parsed data
print(json.dumps(parsed_data, indent=4, ensure_ascii=False))

# Optionally, save the parsed data to a JSON file
output_json_path = r"C:\Users\anton\Documents\Jobb\Test\site_info.json"
with open(output_json_path, 'w', encoding='utf-8') as json_file:
    json.dump(parsed_data, json_file, indent=4, ensure_ascii=False)

print(f"Site information saved to {output_json_path}")
