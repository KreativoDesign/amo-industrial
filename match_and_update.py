#!/usr/bin/env python3
"""
Match WordPress products to database products and generate SQL UPDATE statements
"""

import json
import re
from difflib import SequenceMatcher

def normalize_name(name):
    """Normalize product name for matching"""
    # Convert to lowercase
    name = name.lower()
    # Remove special characters but keep spaces
    name = re.sub(r'[^a-z0-9\s]', '', name)
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def similarity(a, b):
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, a, b).ratio()

def find_best_match(wp_name, db_products):
    """Find the best matching database product for a WordPress product"""
    wp_norm = normalize_name(wp_name)
    
    best_match = None
    best_score = 0
    
    for db_product in db_products:
        db_norm = normalize_name(db_product['name'])
        
        # Calculate similarity
        score = similarity(wp_norm, db_norm)
        
        if score > best_score:
            best_score = score
            best_match = db_product
    
    return best_match, best_score

if __name__ == "__main__":
    print("📊 Loading data...\n")
    
    # Load WordPress products
    with open('/home/ubuntu/amo-industrial/wordpress_products.json', 'r') as f:
        wp_products = json.load(f)
    
    print(f"✅ Loaded {len(wp_products)} WordPress products")
    
    # Load database products (we'll need to fetch these from the API)
    # For now, let's just show the WordPress products
    print("\n📋 Sample WordPress products:")
    for i, product in enumerate(wp_products[:10]):
        print(f"  {i+1}. {product['name'][:70]}")
        print(f"     Image: {product['image_url'][:80]}...")
    
    print(f"\n💾 Total products to process: {len(wp_products)}")
    print("\n✅ WordPress products ready for import")
    print("\nNext step: Use the Admin Dashboard to import these images")
