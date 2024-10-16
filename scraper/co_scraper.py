from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import requests
import json
import psycopg2
import sql
from bs4 import BeautifulSoup
from ratelimit import limits, sleep_and_retry

# Setting up Chrome in headless mode
chrome_options = Options()
chrome_options.add_argument('--headless')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')

# Initialize the WebDriver
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

# Open the main page
url = 'https://www.211colorado.org/#category'
driver.get(url)

# Allow some time for the page to load
time.sleep(5)

# Find all category-button links
category_buttons = driver.find_elements(By.CLASS_NAME, 'category-button')

# Collect the links and category names
category_links = []
category_names = []
for button in category_buttons:
    category_links.append(button.get_attribute('href'))
    category_names.append(button.find_element(By.TAG_NAME, 'span').text.strip())

link_texts = set()  # Change to a set to automatically prevent duplicates

for link, category in zip(category_links, category_names):
    # Navigate to each category link
    driver.get(link)

    # Allow time for page to load
    time.sleep(3)

    # Extract text inside links that are children of paragraphs, which are children of divs with class 'group-links'
    group_paragraph_links = driver.find_elements(By.XPATH, "//div[contains(@class, 'group-links')]//p//a")

    for glink in group_paragraph_links:
        text = glink.text.strip()  # Remove leading/trailing whitespace
        if text:  # Only add non-empty strings
            link_texts.add((category, text))  # Store as a tuple of (category, subcategory)

# Closing the driver
driver.quit()

def process_and_insert_resource(record, category, subcategory):
    name = record.get('name', 'No Name').replace("'", "''")
    alt_name = record.get('alternate_name', '')
    url = record.get('website', '') or record.get('program_website', '') or record.get('agency_website', '') or record.get('program_site_website', '')
    url = url.replace("'", "''") if url else ''
    image_url = get_first_image_url(url) if url else ''
    location_name = f"{record.get('address_1', '')}, {record.get('city', '')}, {record.get('state', '')} {record.get('postal_code', '')}"
    address1 = record.get('address_1', '')
    address2 = record.get('address_2', '')
    city = record.get('city', '')
    county = record.get('county', '')
    state = record.get('state', '')
    postal_code = record.get('postal_code', '')
    coverage_area = record.get('coverage', '')
    description = record.get('description', '').replace("'", "''")
    tips = record.get('tips', '').replace("'", "''")
    application_process = record.get('application_process', '').replace("'", "''")
    documents_required = record.get('documents_required', '').replace("'", "''")
    wait_list = record.get('wait_list', '')
    wait_time = record.get('wait_time', '')
    service_fees = record.get('service_fees', False)
    payment_notes = record.get('payment_notes', '')
    eligibility_notes = record.get('eligibility', '')
    walk_in_services = record.get('walkins_accepted', None)
    wheelchair_access = record.get('wheelchair_accessibility', '')
    contact_email = record.get('contact_email', '')
    contact_name = record.get('contact_name', '')
    contact_title = record.get('contact_title', '')
    email_main = record.get('mainEmailAddress', '')
    email_owner = record.get('account_owner_email', '')
    contact_info = json.dumps({'email': contact_email, 'name': contact_name, 'title': contact_title, 'email_owner': email_owner, 'email_main': email_main})
    place_id = None  # The provided data doesn't include a place_id
    location_data = record.get('location', '').split()
    latitude = location_data[-1].strip('()') if len(location_data) > 1 else ''
    longitude = location_data[1].strip('()') if len(location_data) > 1 else ''
    hours_text = record.get('hours_of_operation', '')
    eligibility = json.dumps({'min_age': record.get('custom_minimum_age', ''), 'max_age': record.get('custom_maximum_age', ''), 'gender': record.get('custom_gender', '')})
    special_eligibility = json.dumps({'immigrants_without_documentation': record.get('immigrants_without_documentation', '')})

    # Collect all non-empty phone numbers from various sources
    phone_numbers = {}
    phone_sources = [
        record.get('phones', {}),
        record.get('agency_phones', {}),
        record.get('site_phones', {}),
        record.get('program_phones', {})
    ]
    
    for source in phone_sources:
        for key, value in source.items():
            if value and value.strip():  # Check if the phone number is not empty or just whitespace
                phone_numbers[key] = value.strip()
    
    # Ensure the first number is the main number
    main_number = ''
    for key in ['phone_1', 'main', 'primary']:
        if key in phone_numbers:
            main_number = phone_numbers.pop(key)
            break
    
    if not main_number and phone_numbers:
        main_number = next(iter(phone_numbers.values()))
        del phone_numbers[next(iter(phone_numbers))]
    
    # Create the final phone_numbers JSON, only including non-empty values
    phone_numbers_json = {}
    if main_number:
        phone_numbers_json['main'] = main_number
    for key, value in phone_numbers.items():
        if value:  # This check ensures we don't include empty strings
            phone_numbers_json[key] = value

    # Modify the services field to ensure valid JSON
    services_full = json.dumps(record.get('taxonomies', []))
    # Filter services to include only name and category
    services = []
    for taxonomy in record.get('taxonomies', []):
        if isinstance(taxonomy, dict):
            service = {
                'name': taxonomy.get('name', ''),
                'category': taxonomy.get('category', '')
            }
            services.append(service)
    services = json.dumps(services)

    resource = {
        'name': name,
        'alt_name': alt_name,
        'categories': json.dumps([category, subcategory]),
        'url': url,
        'image_url': image_url,
        'location_name': location_name,
        'address1': address1,
        'address2': address2,
        'city': city,
        'county': county,
        'state': state,
        'postal_code': postal_code,
        'description': description,
        'tips': tips,
        'phone_numbers': json.dumps(phone_numbers_json) if phone_numbers_json else None,
        'place_id': place_id,
        'latitude': latitude,
        'longitude': longitude,
        'hours_text': hours_text,
        'services': services,
        'eligibility': eligibility,
        'languages': record.get('languages', ''),
        'application_process': record.get('application_process', ''),
        'documents_required': record.get('documents_required', ''),
        'coverage_area': coverage_area,
        'contact_name': record.get('contact_name', ''),
        'contact_title': record.get('contact_title', ''),
        'contact_email': record.get('contact_email', ''),
        'service_fees': service_fees,
        'payment_notes': payment_notes,
        'eligibility_notes': eligibility_notes,
        'walk_in_services': walk_in_services,
        'wheelchair_access': wheelchair_access,
        'contact_info': contact_info,
    }

    try:
        conn = psycopg2.connect(
            dbname="resourcefinder",
            user="admin",
            password="password",
            host="localhost"
        )
        cur = conn.cursor()

        query = """
            INSERT INTO moderated_resources 
            (name, alt_name, categories, url, image_url, location_name, address1, address2, city, county, state, postal_code, description, tips, phone_numbers, place_id, latitude, longitude, hours_text, services, eligibility, languages, application_process, documents_required, coverage_area, contact_info, service_fees, payment_notes, eligibility_notes, walk_in_services, wheelchair_access)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """

        cur.execute(query, (
            str(resource['name']),
            str(resource['alt_name']),
            str(resource['categories']),
            str(resource['url']),
            str(resource['image_url']),
            str(resource['location_name']),
            str(resource['address1']),
            str(resource['address2']),
            str(resource['city']),
            str(resource['county']),
            str(resource['state']),
            str(resource['postal_code']),
            str(resource['description']),
            str(resource['tips']),
            str(resource['phone_numbers']),
            str(resource['place_id']),
            str(resource['latitude']),
            str(resource['longitude']),
            str(resource['hours_text']),
            str(resource['services']),
            str(resource['eligibility']),
            str(resource['languages']),
            str(resource['application_process']),
            str(resource['documents_required']),
            str(resource['coverage_area']),
            str(resource['contact_info']),
            bool(resource['service_fees']),
            str(resource['payment_notes']),
            str(resource['eligibility_notes']),
            str(resource['walk_in_services']),
            str(resource['wheelchair_access'])
        ))

        inserted_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return inserted_id
    except Exception as e:
        print(f"Error inserting resource into database: {e}")
        return None

def get_first_image_url(url):
    # Ensure the URL has a scheme
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url  # Default to https if no scheme is provided

    try:
        response = requests.get(url, timeout=60)
        if response.status_code == 200:
            soup = BeautifulSoup(response.content, 'html.parser')
            img_tag = soup.find('img')
            if img_tag and 'src' in img_tag.attrs:
                return img_tag['src']
    except Exception as e:
        print(f"Error fetching image from {url}: {e}")
    return ''

# New code for sending POST requests
url = 'https://search.211colorado.org/search'

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Language': 'en-US,en;q=0.5',
    'Referer': 'https://search.211colorado.org/search?terms=community%20shelters&page=1&location=Parker%2C%20CO&service_area=Parker',
    'X-CSRF-Token': 'VwUBrBwUY8ZnI6hua_YkFsUm6zcAjYuRGo5KgsOoMURIqL_6LxZ6Sek-NQiVt9KH-Vw-FGJKlftpeyCRu-ayvg',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Origin': 'https://search.211colorado.org',
    'DNT': '1',
    'Connection': 'keep-alive',
    'Cookie': '_united-way-211_session=DIun4dm7rNHHTNQsKqZnmzGKSEi7Nec1ScpceUufkr40fCtfHhSE6ZyFfqb6Klctt6iYTr4LJLfUIYG%2FrrsmGukdwmPus2sJK6Q9Bjjj0mQ18%2BYsRvOxlfySaIAXjJESzT6qNU76n%2FXDT6DnfgPL2FoEQx6Yv%2BG5eJP1LxYGtmaYDMVzcZg9QmrpYjdts17pL9XV2nSZJgvJHwYId1cvuiXBCWZ%2BrNMkMGXd7ljGMNnsCy66vXMavV4uFyUCrlcS5%2Fopjy6eLUntYKyD2WnmuY4VbXVNiYSK5erVx2UieA%3D%3D--U0EYvFoMh7PGVDcu--nkFIN%2Bjx25d4IDpWsKCL3g%3D%3D',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-GPC': '1',
}

# Define the rate limit: 10 requests per minute
ONE_MINUTE = 60

@sleep_and_retry
@limits(calls=10, period=ONE_MINUTE)
def fetch_resources(category, subcategory, page):
    payload = {
        "page": page,
        "per_page": 25,
        "location": "colorado",
        "service_area": "colorado",
        "terms": [subcategory],
        "coords": {
            "lng": -105.7820674,
            "lat": 39.5500507
        }
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"Error fetching resources for {category} - {subcategory}: {e}")
        return None

# Process each category and subcategory
for category, subcategory in sorted(link_texts):
    print(f"Fetching resources for Category: {category}, Subcategory: {subcategory}")
    page = 1
    while True:
        data = fetch_resources(category, subcategory, page)
        if not data:
            break

        total_results = data.get('total_results', 0)
        total_pages = (total_results + 24) // 25  # Calculate total pages

        # Process each resource in the results
        for resource in data.get('results', []):
            inserted_id = process_and_insert_resource(resource, category, subcategory)
            if inserted_id:
                print(f"Inserted resource with ID: {inserted_id}")
            else:
                print("Failed to insert resource")

        if page >= total_pages:
            break  # Exit the loop if we've processed all pages
        page += 1  # Move to the next page
