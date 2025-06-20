"""
Congress Contact Scraper
-----------------------
Scrapes contact information for U.S. Senators and Representatives from official government websites.

Usage:
    python scrape_congress_contacts.py [--senate] [--house] [--output-dir DIR] [--dry-run]

Dependencies:
    - requests
    - beautifulsoup4
    - pandas
    - tqdm (optional, for progress bars)

Outputs:
    senators_contacts.csv, representatives_contacts.csv (unless --dry-run)
"""
import requests
from bs4 import BeautifulSoup
import pandas as pd
import argparse
import concurrent.futures
import time
import logging
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
import os

try:
    from tqdm import tqdm
except ImportError:
    def tqdm(x, **kwargs):
        return x

# --- Constants ---
STATE_CODES = [
    'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
    'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
    'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
    'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
    'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
    'DC'
]

STATE_NAME_TO_CODE = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'District of Columbia': 'DC'
}

PARTY_MAP = {
    'D': 'Democrat', 'Democrat': 'Democrat', 'Democratic': 'Democrat',
    'R': 'Republican', 'Republican': 'Republican',
    'I': 'Independent', 'Independent': 'Independent',
}

# --- Logging ---
logging.basicConfig(filename='scraper.log', level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')

# --- Requests Session with Retries ---
def get_session():
    session = requests.Session()
    retries = Retry(total=5, backoff_factor=0.5, status_forcelist=[500, 502, 503, 504])
    adapter = HTTPAdapter(max_retries=retries)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

# --- Data Normalization ---
def normalize_party(party):
    return PARTY_MAP.get(party.strip(), party.strip())

def clean_phone(phone):
    return (phone.replace('\u200b', '')
                .replace(' ', '')
                .replace('-', '')
                .replace('(', '')
                .replace(')', '')
                .replace('.', '')
                .strip())

# --- Scraping Functions ---
def scrape_senators_from_state(state_code, session):
    url = f"https://www.senate.gov/states/{state_code}/intro.htm"
    try:
        resp = session.get(url, timeout=10)
        resp.raise_for_status()
    except Exception as e:
        logging.error(f"Failed to fetch {url}: {e}")
        return []
    soup = BeautifulSoup(resp.content, "html.parser")
    senators = []
    state_blocks = soup.find_all("div", class_="state-column")
    for block in state_blocks:
        try:
            strong_tag = block.find("strong")
            if not strong_tag:
                continue
            name_party = strong_tag.get_text(strip=True)
            name = name_party.split('(')[0].strip()
            party = normalize_party(name_party.split('(')[1].strip(')')) if '(' in name_party else ""
            website_tag = block.find("a", href=True)
            website = website_tag['href'] if website_tag else ""
            contact_tag = block.find("a", string=lambda x: x and "Contact" in x)
            mailing_address = ""
            phone = ""
            if contact_tag:
                current = contact_tag.find_next_sibling()
                address_lines = []
                while current and getattr(current, 'name', None) != "hr":
                    if getattr(current, 'name', None) == "br":
                        current = current.next_sibling
                        continue
                    text = current.strip() if isinstance(current, str) else current.get_text(strip=True)
                    if text:
                        address_lines.append(text)
                    current = current.next_sibling
                if address_lines:
                    phone = clean_phone(address_lines[-1])
                    mailing_address = ", ".join(address_lines[:-1])
            senators.append({
                "name": name,
                "state": state_code,
                "district": "",
                "party": party,
                "website": website,
                "phone": phone,
                "email": "",
                "mailing_address": mailing_address
            })
        except Exception as e:
            logging.error(f"Error parsing senator in {state_code}: {e}")
            continue
    return senators

def scrape_representatives(session):
    url = "https://www.house.gov/representatives"
    try:
        resp = session.get(url, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        logging.error(f"Failed to fetch {url}: {e}")
        return []
    soup = BeautifulSoup(resp.content, "html.parser")
    all_reps = []
    tables = soup.find_all("table", class_="table")
    for table in tables:
        caption_tag = table.find("caption")
        if not caption_tag:
            continue
        state_name = caption_tag.get_text(strip=True)
        state_code = STATE_NAME_TO_CODE.get(state_name, state_name)
        rows = table.find("tbody").find_all("tr")
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 6:
                continue
            district = cols[0].get_text(strip=True)
            name = cols[1].get_text(strip=True)
            website_tag = cols[1].find("a")
            website = website_tag["href"] if website_tag else ""
            party = normalize_party(cols[2].get_text(strip=True))
            mailing_address = cols[3].get_text(strip=True)
            phone = clean_phone(cols[4].get_text(strip=True))
            rep = {
                "name": name,
                "state": state_code,
                "district": district,
                "party": party,
                "website": website,
                "phone": phone,
                "email": "",
                "mailing_address": mailing_address
            }
            all_reps.append(rep)
    return all_reps

# --- Main ---
def main():
    parser = argparse.ArgumentParser(description="Scrape US Congress contact info.")
    parser.add_argument('--senate', action='store_true', help='Scrape senators')
    parser.add_argument('--house', action='store_true', help='Scrape representatives')
    parser.add_argument('--output-dir', default='.', help='Directory to save CSV files')
    parser.add_argument('--dry-run', action='store_true', help='Print sample data, do not write files')
    args = parser.parse_args()
    session = get_session()
    os.makedirs(args.output_dir, exist_ok=True)
    if not args.senate and not args.house:
        args.senate = args.house = True
    if args.senate:
        all_senators = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor:
            futures = {executor.submit(scrape_senators_from_state, code, session): code for code in STATE_CODES}
            for future in tqdm(concurrent.futures.as_completed(futures), total=len(STATE_CODES), desc="Senate States"):
                senators = future.result()
                all_senators.extend(senators)
        if args.dry_run:
            print(pd.DataFrame(all_senators).head())
        else:
            out_path = os.path.join(args.output_dir, "senators_contacts.csv")
            pd.DataFrame(all_senators).to_csv(out_path, index=False)
            print(f"Saved {out_path} with {len(all_senators)} records.")
    if args.house:
        representatives = scrape_representatives(session)
        if args.dry_run:
            print(pd.DataFrame(representatives).head())
        else:
            out_path = os.path.join(args.output_dir, "representatives_contacts.csv")
            pd.DataFrame(representatives).to_csv(out_path, index=False)
            print(f"Saved {out_path} with {len(representatives)} records.")

if __name__ == "__main__":
    main()
