import requests
from bs4 import BeautifulSoup
import pandas as pd

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

def scrape_senators_from_state(state_code):
    url = f"https://www.senate.gov/states/{state_code}/intro.htm"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")
    senators = []

    state_blocks = soup.find_all("div", class_="state-column")

    for block in state_blocks:
        try:
            strong_tag = block.find("strong")
            if not strong_tag:
                continue
            name_party = strong_tag.get_text(strip=True)
            name = name_party.split('(')[0].strip()
            party = name_party.split('(')[1].strip(')') if '(' in name_party else ""

            website_tag = block.find("a", href=True)
            website = website_tag['href'] if website_tag else ""

            contact_tag = block.find("a", string=lambda x: x and "Contact" in x)
            contact_url = contact_tag['href'] if contact_tag else ""

            mailing_address = ""
            phone = ""

            if contact_tag:
                current = contact_tag.find_next_sibling()
                address_lines = []
                while current and current.name != "hr":
                    if current.name == "br":
                        current = current.next_sibling
                        continue
                    text = current.strip() if isinstance(current, str) else current.get_text(strip=True)
                    if text:
                        address_lines.append(text)
                    current = current.next_sibling
                if address_lines:
                    phone = address_lines[-1]
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
            print(f"Error in {state_code}: {e}")
            continue

    return senators




def scrape_representatives():
    url = "https://www.house.gov/representatives"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, "html.parser")

    all_reps = []

    # Loop through each <table> by state
    tables = soup.find_all("table", class_="table")
    for table in tables:
        caption_tag = table.find("caption")
        if not caption_tag:
            continue
        state_name = caption_tag.get_text(strip=True)
        state_code = STATE_NAME_TO_CODE.get(state_name, state_name)  # Translate to state code

        rows = table.find("tbody").find_all("tr")
        for row in rows:
            cols = row.find_all("td")
            if len(cols) < 6:
                continue

            district = cols[0].get_text(strip=True)
            name = cols[1].get_text(strip=True)
            website_tag = cols[1].find("a")
            website = website_tag["href"] if website_tag else ""

            party = cols[2].get_text(strip=True)
            mailing_address = cols[3].get_text(strip=True)
            phone = cols[4].get_text(strip=True)

            rep = {
                "name": name,
                "state": state_code,  # Use state code instead of full name
                "district": district,
                "party": party,
                "website": website,
                "phone": phone,
                "email": "",
                "mailing_address": mailing_address
            }
            all_reps.append(rep)

    return all_reps



def main():
    all_senators = []
    for code in STATE_CODES:
        print(f"Scraping {code}...")
        senators = scrape_senators_from_state(code)
        all_senators.extend(senators)

    df = pd.DataFrame(all_senators)
    df.to_csv("senators_contacts.csv", index=False)
    print(f"Saved senators_contacts.csv with {len(df)} records.")
    
    representatives = scrape_representatives()
    df = pd.DataFrame(representatives)
    df.to_csv("representatives_contacts.csv", index=False)
    print(f"Saved representatives_contacts.csv with {len(df)} records.")


if __name__ == "__main__":
    main()
