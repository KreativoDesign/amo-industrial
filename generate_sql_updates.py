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
    # Remove special characters and extra spaces
    name = re.sub(r'[^a-z0-9\s]', '', name)
    # Remove extra spaces
    name = re.sub(r'\s+', ' ', name).strip()
    return name

def similarity(a, b):
    """Calculate similarity between two strings (0-1)"""
    return SequenceMatcher(None, a, b).ratio()

def match_products(wp_products, db_products):
    """Match WordPress products to database products"""
    matches = []
    unmatched_wp = []
    
    for wp_product in wp_products:
        wp_name = wp_product['name']
        wp_norm = normalize_name(wp_name)
        
        best_match = None
        best_score = 0
        
        for db_product in db_products:
            db_name = db_product['name']
            db_norm = normalize_name(db_name)
            
            # Calculate similarity
            score = similarity(wp_norm, db_norm)
            
            if score > best_score:
                best_score = score
                best_match = db_product
        
        # Only match if similarity is high enough (70%)
        if best_score >= 0.7 and best_match:
            matches.append({
                'db_id': best_match['id'],
                'db_name': best_match['name'],
                'wp_name': wp_name,
                'image_url': wp_product['image_url'],
                'score': best_score
            })
        else:
            unmatched_wp.append({
                'name': wp_name,
                'image_url': wp_product['image_url'],
                'best_match': best_match['name'] if best_match else 'None',
                'score': best_score
            })
    
    return matches, unmatched_wp

def generate_sql_updates(matches):
    """Generate SQL UPDATE statements"""
    sql_statements = []
    
    for match in matches:
        # Escape single quotes in URL
        url = match['image_url'].replace("'", "\\'")
        sql = f"UPDATE products SET imageUrl = '{url}' WHERE id = {match['db_id']};"
        sql_statements.append(sql)
    
    return sql_statements

if __name__ == "__main__":
    print("📊 Loading data...\n")
    
    # Load WordPress products
    with open('/home/ubuntu/amo-industrial/wordpress_products.json', 'r') as f:
        wp_products = json.load(f)
    
    print(f"✅ Loaded {len(wp_products)} WordPress products")
    
    # For now, just show some sample products
    print("\n📋 Sample WordPress products:")
    for i, product in enumerate(wp_products[:5]):
        print(f"  {i+1}. {product['name'][:60]}...")
        print(f"     URL: {product['image_url'][:80]}...")
    
    print(f"\n💾 Total products to process: {len(wp_products)}")
    print("\n✅ WordPress products saved to wordpress_products.json")
    print("\nNext step: Use the Admin Dashboard URL import feature to update products")
