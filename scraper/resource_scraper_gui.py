
import tkinter as tk
from tkinter import scrolledtext
import googlemaps
import json
import requests
from duckduckgo_search import DDGS

# Function to get additional details from Google Places API
def google_places_details(api_key, name, location):
    gmaps = googlemaps.Client(key=api_key)
    try:
        # Use Google's Places API to find place details based on name and location
        query_result = gmaps.places(query=name + ' near ' + location)
        if query_result['results']:
            place = query_result['results'][0]
            place_id = place.get('place_id', '')
            if not place_id:
                place_id = ''
            latitude = place['geometry']['location']['lat']
            if not latitude:
                latitude = 0
            longitude = place['geometry']['location']['lng']
            if not longitude:
                longitude = 0
            address = place.get('vicinity', '') or place.get('formatted_address', '')
            
            # Request more details with place_id
            details = gmaps.place(place_id=place_id)
            periods = details['result'].get('opening_hours', {}).get('periods', [])

            hours_formatted = []
            for period in periods:
                open_info = period.get('open', {})
                close_info = period.get('close', {})
                hours_formatted.append({
                    "open": {
                        "day": open_info.get('day', 0),
                        "time": open_info.get('time', '')
                    },
                    "close": {
                        "day": close_info.get('day', 0),
                        "time": close_info.get('time', '')
                    }
                })

            # Get image URL
            photos = details['result'].get('photos', [])
            if photos:
                # Construct the URL for the first photo
                photo_reference = photos[0].get('photo_reference')
                image_request_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={api_key}"

                # Request the image
                image_response = requests.get(image_request_url)
                image_url = image_response.url
            else:
                image_url = ''

            # Get phone number
            phone_number = details['result'].get('International_phone_number', '')
            if not phone_number:
                phone_number = details['result'].get('formatted_phone_number', '')

            return place_id, latitude, longitude, address, json.dumps(hours_formatted), image_url, phone_number
        else:
            query_result = gmaps.places(query=location)
            if query_result['results']:
                place = query_result['results'][0]
                place_id = place.get('place_id', '')
                if not place_id:
                    place_id = ''
                latitude = place['geometry']['location']['lat']
                if not latitude:
                    latitude = 0
                longitude = place['geometry']['location']['lng']
                if not longitude:
                    longitude = 0
                return place_id, latitude, longitude, location, json.dumps([]), '', ''
    except Exception as e:
        print("Error retrieving Google Places data:", e)
    return '', 0, 0, '', json.dumps([]), '', ''

# Define the function to search and return SQL statements
def search_and_format_sql(api_key, location, category, subcategory, max_results):
    def search_duckduckgo(location, category, subcategory, max_results):
        query = f"{subcategory} {category} {location}"
        with DDGS() as ddgs:
            results = [r for r in ddgs.text(query, max_results=max_results)]
        return results

    def format_to_sql(records, location, category, subcategory):
        sql_statements = []
        for record in records:
            name = record.get('title', 'No Title').replace("'", "''")
            url = record.get('href', '').replace("'", "''")
            description = record.get('body', '').replace("'", "''")

            # Retrieve additional data from Google
            place_id, latitude, longitude, address, hours, image_url, phone_number = google_places_details(api_key, name, location)

            if address:
                location = address

            # Include image_url and phone_number in the SQL insert
            sql = (f"INSERT INTO moderated_resources (name, category, subcategory, url, image_url, location, description, phone_number, place_id, latitude, longitude, hours) "
                   f"VALUES ('{name}', '{category}', '{subcategory}', '{url}', '{image_url}', '{location}', '{description}', '{phone_number}', '{place_id}', {latitude}, {longitude}, '{hours}');")
            sql_statements.append(sql)
        return sql_statements

    results = search_duckduckgo(location, category, subcategory, max_results)
    sql_statements = format_to_sql(results, location, category, subcategory)
    return sql_statements

# GUI application
def run_gui():
    def on_generate():
        api_key = api_key_entry.get()
        location = location_entry.get()
        category = category_entry.get()
        subcategory = subcategory_entry.get()
        
        sql_statements = search_and_format_sql(api_key, location, category, subcategory, int(max_results_entry.get()))
        output_text.delete(1.0, tk.END)
        for sql in sql_statements:
            output_text.insert(tk.END, sql + "\n")

    app = tk.Tk()
    app.title("Resource Scraper")

    # Google Maps API Key input
    tk.Label(app, text="Google Maps API Key:").grid(row=0, column=0)
    api_key_entry = tk.Entry(app, show="*")
    api_key_entry.grid(row=0, column=1)
    
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
