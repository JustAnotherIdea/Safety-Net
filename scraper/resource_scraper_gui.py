import os
from dotenv import load_dotenv
import tkinter as tk
from tkinter import scrolledtext
import googlemaps
import json
import requests
from duckduckgo_search import DDGS
import psycopg2
from psycopg2 import sql

# Get the directory of the current script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Get the parent directory
parent_dir = os.path.dirname(current_dir)
# Construct the path to the .env file
dotenv_path = os.path.join(parent_dir, '.env')
# Load the .env file
load_dotenv(dotenv_path)

# Function to get additional details from Google Places API
def google_places_details(name, location):
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    gmaps = googlemaps.Client(key=api_key)
    try:
        # Use Google's Places API to find place details based on name and location
        query_result = gmaps.places(query=f"{name} near {location}")
        
        if not query_result['results']:
            # If no results found for name and location, try searching just for the location
            query_result = gmaps.places(query=location)
            if not query_result['results']:
                return '', 0, 0, '', json.dumps([]), '', ''

        place = query_result['results'][0]
        place_id = place.get('place_id', '')
        latitude = place['geometry']['location'].get('lat', 0)
        longitude = place['geometry']['location'].get('lng', 0)
        address = place.get('vicinity') or place.get('formatted_address', '')

        # Request more details with place_id
        details = gmaps.place(place_id=place_id)['result']
        
        # Format opening hours
        hours_formatted = []
        if 'opening_hours' in details and 'periods' in details['opening_hours']:
            for period in details['opening_hours']['periods']:
                hours_formatted.append({
                    "open": {
                        "day": period.get('day', 0),
                        "time": period.get('time', '')
                    },
                    "close": {
                        "day": period.get('close', {}).get('day', 0),
                        "time": period.get('close', {}).get('time', '')
                    }
                })

        # Get image URL
        image_url = ''
        if 'photos' in details and details['photos']:
            photo_reference = details['photos'][0].get('photo_reference')
            if photo_reference:
                image_request_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={api_key}"
                image_response = requests.get(image_request_url)
                image_url = image_response.url

        # Get phone number
        phone_number = details.get('international_phone_number') or details.get('formatted_phone_number', '')

        return place_id, latitude, longitude, address, json.dumps(hours_formatted), image_url, phone_number

    except Exception as e:
        print(f"Error retrieving Google Places data: {e}")
        return '', 0, 0, '', json.dumps([]), '', ''

# Define the function to search and return SQL statements
def search_and_format_sql(location, category, subcategory, max_results):
    def search_duckduckgo(location, category, subcategory, max_results):
        query = f"{subcategory} {category} {location}"
        with DDGS() as ddgs:
            results = [r for r in ddgs.text(query, max_results=max_results)]
        return results

    def process_and_insert_resource(record, location, category, subcategory):
        name = record.get('title', 'No Title').replace("'", "''")
        url = record.get('href', '').replace("'", "''")
        description = record.get('body', '').replace("'", "''")

        # Retrieve additional data from Google
        place_id, latitude, longitude, address, hours, image_url, phone_number = google_places_details(name, location)

        if address:
            location = address

        resource = {
            'name': name,
            'category': category,
            'subcategory': subcategory,
            'url': url,
            'image_url': image_url,
            'location': location,
            'description': description,
            'phone_number': phone_number,
            'place_id': place_id,
            'latitude': latitude,
            'longitude': longitude,
            'hours': hours
        }

        inserted_id = insert_resource_into_database(resource)
        return inserted_id

    try:
        results = search_duckduckgo(location, category, subcategory, max_results)
        inserted_ids = []
        for record in results:
            inserted_id = process_and_insert_resource(record, location, category, subcategory)
            if inserted_id:
                inserted_ids.append(inserted_id)
        return inserted_ids
    except Exception as e:
        print(f"Error in search_and_format_sql: {e}")
        return []

# Function to insert resources into the database
def insert_resource_into_database(resource):
    try:
        conn = psycopg2.connect(
            dbname="resourcefinder",
            user="admin",
            password="password",
            host="localhost"
        )
        cur = conn.cursor()

        # Parse the hours data
        hours = resource['hours']
        if isinstance(hours, str):
            # If hours is already a JSON string, parse it
            hours = json.loads(hours)
        
        query = sql.SQL("""
            INSERT INTO moderated_resources 
            (name, category, subcategory, url, image_url, location, description, phone_number, place_id, latitude, longitude, hours)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING id
        """)

        cur.execute(query, (
            resource['name'],
            resource['category'],
            resource['subcategory'],
            resource['url'],
            resource['image_url'],
            resource['location'],
            resource['description'],
            resource['phone_number'],
            resource['place_id'],
            resource['latitude'],
            resource['longitude'],
            json.dumps(hours)  # Encode hours as JSON string
        ))

        inserted_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()

        return inserted_id
    except Exception as e:
        print(f"Error inserting resource into database: {e}")
        return None

# GUI application
def run_gui():
    def on_generate():
        location = location_entry.get()
        category = category_entry.get()
        subcategory = subcategory_entry.get()
        
        inserted_ids = search_and_format_sql(location, category, subcategory, int(max_results_entry.get()))
        output_text.delete(1.0, tk.END)
        for id in inserted_ids:
            output_text.insert(tk.END, f"Inserted resource with ID: {id}\n")

    app = tk.Tk()
    app.title("Resource Scraper")

    # Location input
    tk.Label(app, text="Location:").grid(row=1, column=0)
    location_entry = tk.Entry(app)
    location_entry.grid(row=1, column=1)
    
    # Category input
    tk.Label(app, text="Category:").grid(row=2, column=0)
    category_entry = tk.Entry(app)
    category_entry.grid(row=2, column=1)
    
    # Subcategory input
    tk.Label(app, text="Subcategory:").grid(row=3, column=0)
    subcategory_entry = tk.Entry(app)
    subcategory_entry.grid(row=3, column=1)

    # Maximum number of results input
    tk.Label(app, text="Max Results:").grid(row=4, column=0)
    max_results_entry = tk.Entry(app)
    max_results_entry.grid(row=4, column=1)
    
    # Generate button
    generate_button = tk.Button(app, text="Generate SQL", command=on_generate)
    generate_button.grid(row=4, column=0, columnspan=2)
    
    # Output area
    output_text = scrolledtext.ScrolledText(app, width=80, height=20)
    output_text.grid(row=5, column=0, columnspan=2)

    app.mainloop()

run_gui()
