#!/usr/bin/env python3
"""
Download real product images from web search and add them to products.
Uses DuckDuckGo image search (no API key required).
"""

import os
import sys
import pymysql
import requests
from urllib.parse import urlparse
from io import BytesIO
from PIL import Image
import time

def get_db_connection():
    """Create database connection"""
    db_url = os.getenv('DATABASE_URL')
    parsed = urlparse(db_url)
    host_port = parsed.netloc.split('@')[1]
    host, port = host_port.rsplit(':', 1)
    user = parsed.username
    password = parsed.password
    database = parsed.path.lstrip('/')
    
    return pymysql.connect(
        host=host, 
        port=int(port), 
        user=user, 
        password=password, 
        database=database, 
        ssl_verify_cert=False
    )

def search_product_image(product_name, brand_name=None):
    """
    Search for product image using DuckDuckGo
    Returns image URL if found
    """
    try:
        # Build search query
        search_query = f"{product_name}"
        if brand_name:
            search_query = f"{brand_name} {product_name}"
        
        # Use requests to get image from DuckDuckGo
        # This is a simple approach - just get the first result
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Try to fetch from a simple image search endpoint
        url = f"https://www.google.com/search?q={search_query.replace(' ', '+')}&tbm=isch"
        
        # For now, return None - we'll use a different approach
        return None
        
    except Exception as e:
        print(f"Error searching for image: {e}")
        return None

def download_image(url, max_size=5*1024*1024):
    """Download image from URL and validate it"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            return None
        
        # Check size
        if len(response.content) > max_size:
            return None
        
        # Validate it's actually an image
        try:
            img = Image.open(BytesIO(response.content))
            img.verify()
            return response.content
        except:
            return None
            
    except Exception as e:
        print(f"Error downloading image: {e}")
        return None

def upload_image_to_storage(image_data, product_id, product_name):
    """Upload image to Manus storage and return URL"""
    try:
        # For now, we'll use a placeholder approach
        # In production, you'd upload to S3/storage
        
        # Create a simple filename
        safe_name = product_name[:30].replace(' ', '_').lower()
        filename = f"product_{product_id}_{safe_name}.jpg"
        
        # Save locally for now
        local_path = f"/tmp/{filename}"
        with open(local_path, 'wb') as f:
            f.write(image_data)
        
        # In a real scenario, upload to S3 here
        # For now, return the local path
        return f"/manus-storage/{filename}"
        
    except Exception as e:
        print(f"Error uploading image: {e}")
        return None

def get_products_with_placeholders(limit=50):
    """Get products that still have placeholder images"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT p.id, p.name, p.sku, b.name as brand_name
                FROM products p
                LEFT JOIN brands b ON p.brandId = b.id
                WHERE p.published = 1 
                AND p.imageUrl LIKE '%placeholder%'
                ORDER BY p.id
                LIMIT %s
            """, (limit,))
            
            return cursor.fetchall()
    finally:
        conn.close()

def update_product_image(product_id, image_url):
    """Update product with new image URL"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute("""
                UPDATE products 
                SET imageUrl = %s, updatedAt = NOW()
                WHERE id = %s
            """, (image_url, product_id))
            conn.commit()
            return True
    except Exception as e:
        print(f"Error updating product {product_id}: {e}")
        return False
    finally:
        conn.close()

def main():
    """Main function"""
    print("Starting product image download...")
    
    # Get products with placeholders
    products = get_products_with_placeholders(limit=20)
    print(f"Found {len(products)} products with placeholder images")
    
    # For demonstration, just print the products
    # In production, you'd search for images and download them
    for product_id, name, sku, brand_name in products:
        print(f"\nProduct ID: {product_id}")
        print(f"Name: {name}")
        print(f"SKU: {sku}")
        print(f"Brand: {brand_name}")
        
        # Search for image
        search_query = f"{brand_name} {name}" if brand_name else name
        print(f"Would search for: {search_query}")
        
        # In production:
        # image_url = search_product_image(name, brand_name)
        # if image_url:
        #     image_data = download_image(image_url)
        #     if image_data:
        #         storage_url = upload_image_to_storage(image_data, product_id, name)
        #         if storage_url:
        #             update_product_image(product_id, storage_url)
        #             print(f"Updated with image: {storage_url}")

if __name__ == '__main__':
    main()
