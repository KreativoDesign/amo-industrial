#!/usr/bin/env python3
"""
Scrape product images from AMO Industrial WordPress shop and match to database products
"""

import os
import re
import requests
import pymysql
from urllib.parse import urljoin
from bs4 import BeautifulSoup

def get_db_connection():
    """Get database connection"""
    return pymysql.connect(
        host='localhost',
        user='root',
        password='',
        database='amo_industrial',
        ssl_verify_cert=False,
        ssl_verify_identity=False,
    )

def normalize_product_name(name):
    """Normalize product name for matching"""
    return re.sub(r'[^a-z0-9]', '', name.lower().strip())

def scrape_wordpress_products():
    """Scrape all products from WordPress shop"""
    base_url = "https://amoindustrial.co.za/shop/"
    products = []
    page = 1
    
    print("🔍 Scraping WordPress shop...")
    
    while page <= 25:
        url = f"{base_url}?paged={page}" if page > 1 else base_url
        print(f"  Fetching page {page}...")
        
        try:
            response = requests.get(url, timeout=15, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find all product items
            product_items = soup.find_all('li', class_='product')
            
            if not product_items:
                print(f"  No products found on page {page}. Stopping.")
                break
            
            page_count = len(product_items)
            print(f"    Found {page_count} products")
            
            for item in product_items:
                try:
                    # Get product name - try h4, then h2, then links
                    name_elem = item.find('h4')
                    if not name_elem:
                        name_elem = item.find('h2', class_='woocommerce-loop-product__title')
                    if not name_elem:
                        name_elem = item.find('a', class_='woocommerce-loop-product__title')
                    if not name_elem:
                        # Try last link with text
                        links = item.find_all('a')
                        for link in reversed(links):
                            text = link.get_text(strip=True)
                            if text and len(text) > 5:
                                name_elem = link
                                break
                    
                    if not name_elem:
                        continue
                    
                    name = name_elem.get_text(strip=True)
                    if not name or len(name) < 2:
                        continue
                    
                    # Get product image - look inside woocommerce-product-details
                    details_link = item.find('a', class_='woocommerce-product-details')
                    if details_link:
                        img_elem = details_link.find('img')
                    else:
                        img_elem = item.find('img')
                    
                    if not img_elem:
                        continue
                    
                    image_url = img_elem.get('src') or img_elem.get('data-src')
                    if not image_url or 'placeholder' in image_url.lower():
                        continue
                    
                    # Make sure it's an absolute URL
                    if not image_url.startswith('http'):
                        image_url = urljoin(base_url, image_url)
                    
                    products.append({
                        'name': name,
                        'image_url': image_url
                    })
                    
                except Exception as e:
                    continue
            
            page += 1
            
        except Exception as e:
            print(f"  Error fetching page {page}: {e}")
            break
    
    print(f"✅ Scraped {len(products)} products from WordPress")
    return products

def match_and_update_products(wp_products):
    """Match WordPress products to database products and update images"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    print(f"\n📊 Matching products...")
    
    matched = 0
    updated = 0
    failed = 0
    
    for wp_product in wp_products:
        wp_name = wp_product['name']
        wp_image = wp_product['image_url']
        wp_name_normalized = normalize_product_name(wp_name)
        
        try:
            # Try exact name match first
            cursor.execute(
                "SELECT id, name FROM products WHERE LOWER(name) = %s LIMIT 1",
                (wp_name.lower(),)
            )
            result = cursor.fetchone()
            
            if result:
                db_id, db_name = result
                matched += 1
                
                # Update product with image URL
                try:
                    cursor.execute(
                        "UPDATE products SET imageUrl = %s WHERE id = %s",
                        (wp_image, db_id)
                    )
                    conn.commit()
                    updated += 1
                    print(f"  ✅ {db_name[:60]}")
                    
                except Exception as e:
                    print(f"  ❌ Failed to update: {e}")
                    failed += 1
            
        except Exception as e:
            failed += 1
    
    cursor.close()
    conn.close()
    
    print(f"\n📈 Results:")
    print(f"  Matched: {matched}")
    print(f"  Updated: {updated}")
    print(f"  Failed: {failed}")
    
    return updated

if __name__ == "__main__":
    print("🚀 Starting WordPress image scraper...\n")
    
    # Scrape WordPress products
    wp_products = scrape_wordpress_products()
    
    if wp_products:
        # Match and update database products
        match_and_update_products(wp_products)
        print("\n✨ Done!")
    else:
        print("❌ No products scraped from WordPress")
