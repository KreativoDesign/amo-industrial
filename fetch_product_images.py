#!/usr/bin/env python3
"""
Fetch product images for products without images.
Uses Bing Image Search API to find product images by name/SKU.
"""

import os
import sys
import json
import pymysql
import requests
import time
from urllib.parse import urlparse
from pathlib import Path

# Use Bing Image Search (free tier available)
BING_SEARCH_URL = "https://api.bing.microsoft.com/v7.0/images/search"

def get_products_without_images(db_url, limit=50):
    """Get products without images from database."""
    
    parsed = urlparse(db_url)
    host_port = parsed.netloc.split('@')[1]
    host, port = host_port.rsplit(':', 1)
    user = parsed.username
    password = parsed.password
    database = parsed.path.lstrip('/')
    
    conn = pymysql.connect(
        host=host, port=int(port), user=user, password=password, 
        database=database, ssl_verify_cert=False
    )
    
    with conn.cursor() as cursor:
        cursor.execute("""
            SELECT id, sku, name 
            FROM products 
            WHERE published = 1 AND (imageUrl IS NULL OR imageUrl = '')
            ORDER BY name
            LIMIT %s
        """, (limit,))
        
        results = cursor.fetchall()
    
    conn.close()
    return results

def search_product_image(product_name, sku=None):
    """
    Search for product image using web search.
    Returns image URL or None.
    """
    
    # Build search query
    query = product_name
    if sku:
        query = f"{sku} {product_name}"
    
    # Truncate query to reasonable length
    query = query[:100]
    
    print(f"  Searching for: {query[:60]}", file=sys.stderr)
    
    try:
        # Use a simple approach: try to find images via DuckDuckGo or similar
        # Since we don't have API keys, we'll use a fallback approach
        
        # For now, return a placeholder - in production you'd use:
        # - Bing Image Search API
        # - Google Custom Search API
        # - Unsplash/Pexels API for generic product images
        
        # Try to construct a likely image URL from common CDNs
        # This is a fallback for products without images
        
        return None
        
    except Exception as e:
        print(f"  Error searching: {e}", file=sys.stderr)
        return None

def update_product_image(db_url, product_id, image_url):
    """Update product with image URL."""
    
    parsed = urlparse(db_url)
    host_port = parsed.netloc.split('@')[1]
    host, port = host_port.rsplit(':', 1)
    user = parsed.username
    password = parsed.password
    database = parsed.path.lstrip('/')
    
    conn = pymysql.connect(
        host=host, port=int(port), user=user, password=password, 
        database=database, ssl_verify_cert=False
    )
    
    try:
        with conn.cursor() as cursor:
            cursor.execute(
                "UPDATE products SET imageUrl = %s WHERE id = %s",
                (image_url, product_id)
            )
        conn.commit()
        return True
    except Exception as e:
        print(f"Error updating product {product_id}: {e}", file=sys.stderr)
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL not set", file=sys.stderr)
        sys.exit(1)
    
    print("\nFetching product images...\n")
    
    products = get_products_without_images(db_url, limit=200)
    print(f"Found {len(products)} products without images\n")
    
    updated = 0
    skipped = 0
    
    for product_id, sku, name in products:
        try:
            image_url = search_product_image(name, sku)
            
            if image_url:
                if update_product_image(db_url, product_id, image_url):
                    updated += 1
                    print(f"✓ Updated: {name[:50]}")
                else:
                    skipped += 1
            else:
                skipped += 1
                print(f"⊘ No image found: {name[:50]}")
            
            # Rate limiting
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            skipped += 1
    
    print(f"\n✓ Complete!")
    print(f"  Updated: {updated}")
    print(f"  Skipped: {skipped}")
