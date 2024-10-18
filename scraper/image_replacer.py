from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

categories_data = {
    "Housing": {
      "image": "/images/housing.jpg",
      "subcategories": [
        { "name": "Shelters", "image": "/images/shelters.jpg" },
        { "name": "Low income housing", "image": "/images/low_income_housing.jpg" },
        { "name": "Hostels", "image": "/images/hostels.jpg" },
        { "name": "Camping sites", "image": "/images/camping_sites.jpg" },
        { "name": "Public restroom map", "image": "/images/public_restroom_map.jpg" },
        { "name": "Public shower map", "image": "/images/public_shower_map.jpg" },
        { "name": "Disaster shelters", "image": "/images/disaster_shelters.jpg" }
      ]
    },
    "Transportation": {
      "image": "/images/transportation.jpg",
      "subcategories": [
        { "name": "Public transportation schedules and routes", "image": "/images/public_transportation_schedules.jpg" },
        { "name": "Transportation apps", "image": "/images/transportation_apps.jpg" }
      ]
    },
    "Food & Water": {
      "image": "/images/food_water.jpg",
      "subcategories": [
        { "name": "Soup kitchens", "image": "/images/soup_kitchens.jpg" },
        { "name": "Food stamps", "image": "/images/food_stamps.jpg" },
        { "name": "Food banks", "image": "/images/food_banks.jpg" },
        { "name": "Water fountain map", "image": "/images/water_fountain_map.jpg" },
        { "name": "Public restroom map", "image": "/images/public_restroom_map.jpg" }
      ]
    },
    "Financial Assistance": {
      "image": "/images/financial_assistance.jpg",
      "subcategories": [
        { "name": "Unemployment", "image": "/images/unemployment.jpg" },
        { "name": "Disability", "image": "/images/disability.jpg" },
        { "name": "Food Stamps", "image": "/images/food_stamps.jpg" },
        { "name": "Rent/Bill aid programs", "image": "/images/rent_bill_aid.jpg" },
        { "name": "Social Security", "image": "/images/social_security.jpg" }
      ]
    },
    "Mental Health": {
      "image": "/images/mental_health.jpg",
      "subcategories": [
        { "name": "Crisis hotlines", "image": "/images/crisis_hotlines.jpg" },
        { "name": "Local mental health clinics and therapists", "image": "/images/mental_health_clinics.jpg" },
        { "name": "Online counseling and therapy", "image": "/images/online_counseling.jpg" }
      ]
    },
    "Addiction & Abuse": {
      "image": "/images/addiction_abuse.jpg",
      "subcategories": [
        { "name": "Crisis hotlines", "image": "/images/crisis_hotlines.jpg" },
        { "name": "Local shelters and rehab centers", "image": "/images/shelters_rehab_centers.jpg" },
        { "name": "Counseling and therapy", "image": "/images/counseling_therapy.jpg" }
      ]
    },
    "Legal Help & Documents": {
      "image": "/images/legal_help.jpg",
      "subcategories": [
        { "name": "Social Security Card", "image": "/images/social_security_card.jpg" },
        { "name": "Birth certificate", "image": "/images/birth_certificate.jpg" },
        { "name": "ID/Drivers License", "image": "/images/id_drivers_license.jpg" },
        { "name": "Citizenship", "image": "/images/citizenship.jpg" },
        { "name": "Legal advice", "image": "/images/legal_advice.jpg" },
        { "name": "Legal aid societies", "image": "/images/legal_aid_societies.jpg" }
      ]
    },
    "Jobs": {
      "image": "/images/jobs.jpg",
      "subcategories": [
        { "name": "Temp agencies", "image": "/images/temp_agencies.jpg" },
        { "name": "Job listings", "image": "/images/job_listings.jpg" },
        { "name": "Soft skills", "image": "/images/soft_skills.jpg" }
      ]
    },
    "Education": {
      "image": "/images/education.jpg",
      "subcategories": [
        { "name": "Free GED resources", "image": "/images/ged_resources.jpg" },
        { "name": "Free educational books", "image": "/images/educational_books.jpg" },
        { "name": "Free online courses", "image": "/images/online_courses.jpg" },
        { "name": "Free certifications", "image": "/images/certifications.jpg" },
        { "name": "Free and low cost college", "image": "/images/low_cost_college.jpg" }
      ]
    },
    "Safety Tips": {
      "image": "/images/safety_tips.jpg",
      "subcategories": [
        { "name": "Camping safety tips", "image": "/images/camping_safety.jpg" },
        { "name": "Urban camping/shelter tips", "image": "/images/urban_camping.jpg" },
        { "name": "Hitchhiking safety tips", "image": "/images/hitchhiking_safety.jpg" }
      ]
    },
    "Health & Hygiene": {
      "image": "/images/health_hygiene.jpg",
      "subcategories": [
        { "name": "Personal hygiene tips", "image": "/images/personal_hygiene.jpg" },
        { "name": "Access to public showers", "image": "/images/public_showers.jpg" },
        { "name": "Dental care resources", "image": "/images/dental_care.jpg" },
        { "name": "Free or low-cost health clinics", "image": "/images/health_clinics.jpg" },
        { "name": "Vaccination services", "image": "/images/vaccination_services.jpg" },
        { "name": "Sexual health and contraception", "image": "/images/sexual_health.jpg" },
        { "name": "Basic first aid", "image": "/images/basic_first_aid.jpg" },
        { "name": "Hygiene products distribution centers", "image": "/images/hygiene_products.jpg" },
        { "name": "Skincare and wound care", "image": "/images/skincare_woundcare.jpg" },
        { "name": "Public restroom locations", "image": "/images/public_restrooms.jpg" }
      ]
    }
}


def search_flickr(query):
    # Set up Selenium with Chrome
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Automatically manage ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        url = f"https://www.pexels.com/search/{query}/"
        print(url)
        driver.get(url)

        # Wait for a specific element that indicates the page is loaded
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CLASS_NAME, 'MediaCard_image__yVXRE'))  # Adjust this selector based on the page structure
        )

        # Find images using Selenium
        images = driver.find_elements(By.CLASS_NAME, 'MediaCard_image__yVXRE')  # Adjust this selector based on the page structure
        print(f"Found {len(images)} images")

        # Extract and return the first image URL found
        if images:
            image_url = images[0].get_attribute('src')
            print(f"Image URL: {image_url}")
            return image_url

    except Exception as e:
        print(f"An error occurred: {e}")

    finally:
        driver.quit()

    return None

def replace_images(data):
    replaced_data = {}
    for category, info in data.items():
        replaced_data[category] = {
            "image": search_flickr(category),
            "subcategories": []
        }
        for subcategory in info['subcategories']:
            replaced_data[category]["subcategories"].append({
                "name": subcategory['name'],
                "image": search_flickr(subcategory['name'])
            })
    return replaced_data

# Test the function with the categories_data
replaced_categories = replace_images(categories_data)
print(replaced_categories)
