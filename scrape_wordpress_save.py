#!/usr/bin/env python3
"""
Scrape product images from AMO Industrial WordPress shop and save to JSON
"""

import json
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

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

if __name__ == "__main__":
    print("🚀 Starting WordPress image scraper...\n")
    
    # Scrape WordPress products
    wp_products = scrape_wordpress_products()
    
    if wp_products:
        # Save to JSON
        with open('/home/ubuntu/amo-industrial/wordpress_products.json', 'w') as f:
            json.dump(wp_products, f, indent=2)
        print(f"\n✅ Saved {len(wp_products)} products to wordpress_products.json")
    else:
        print("❌ No products scraped from WordPress")
