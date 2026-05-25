#!/usr/bin/env python3
"""
Parse WordPress XML export and extract product images and descriptions.
Maps attachment items to parent products and updates the database.
"""

import xml.etree.ElementTree as ET
import os
import sys
import json
import pymysql
from urllib.parse import urlparse
from pathlib import Path
from collections import defaultdict

def parse_wordpress_xml(xml_path):
    """Parse WordPress XML and extract product data including images."""
    
    print(f"Parsing WordPress XML: {xml_path}")
    
    tree = ET.parse(xml_path)
    root = tree.getroot()
    
    # Define namespaces
    namespaces = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'wp': 'http://wordpress.org/export/1.2/',
        'dc': 'http://purl.org/dc/elements/1.1/'
    }
    
    products = {}  # post_id -> product data
    attachments = defaultdict(list)  # post_id -> list of image URLs
    
    # First pass: collect all items
    for item in root.findall('.//item'):
        try:
            post_type = item.findtext('wp:post_type', '', namespaces)
            post_id = item.findtext('wp:post_id', '', namespaces)
            post_parent = item.findtext('wp:post_parent', '', namespaces)
            
            if post_type == 'product':
                # This is a product
                title = item.findtext('title', '').strip()
                
                # Extract SKU from post meta
                sku = None
                post_meta = item.findall('.//wp:postmeta', namespaces)
                for meta in post_meta:
                    meta_key = meta.findtext('wp:meta_key', '', namespaces)
                    if meta_key == '_sku':
                        sku = meta.findtext('wp:meta_value', '', namespaces).strip()
                        break
                
                if not sku:
                    continue
                
                # Extract description
                content = item.findtext('content:encoded', '', namespaces).strip()
                
                products[post_id] = {
                    'sku': sku,
                    'title': title,
                    'description': content,
                    'images': []
                }
            
            elif post_type == 'attachment' and post_parent:
                # This is an attachment (image) - link to parent product
                attachment_url = item.findtext('wp:attachment_url', '', namespaces).strip()
                if attachment_url and 'amoindustrial' in attachment_url:
                    attachments[post_parent].append(attachment_url)
        
        except Exception as e:
            print(f"Error parsing item: {e}", file=sys.stderr)
            continue
    
    # Second pass: link attachments to products
    for post_id, product in products.items():
        if post_id in attachments:
            product['images'] = attachments[post_id]
    
    # Convert to SKU-keyed dict
    sku_products = {p['sku']: p for p in products.values() if p['sku']}
    
    return sku_products

def update_products_in_db(products_data, db_url):
    """Update products in database with descriptions and images."""
    
    # Parse DATABASE_URL
    parsed = urlparse(db_url)
    host_port = parsed.netloc.split('@')[1]
    host, port = host_port.rsplit(':', 1)
    user = parsed.username
    password = parsed.password
    database = parsed.path.lstrip('/')
    
    print(f"Connecting to database...")
    
    try:
        conn = pymysql.connect(
            host=host,
            port=int(port),
            user=user,
            password=password,
            database=database,
            ssl_verify_cert=False,
            ssl_verify_identity=False
        )
        
        updated = 0
        skipped = 0
        errors = []
        images_added = 0
        
        with conn.cursor() as cursor:
            for sku, data in products_data.items():
                try:
                    # Find product by SKU
                    cursor.execute("SELECT id FROM products WHERE sku = %s", (sku,))
                    result = cursor.fetchone()
                    
                    if not result:
                        skipped += 1
                        continue
                    
                    product_id = result[0]
                    
                    # Update description
                    if data['description']:
                        cursor.execute(
                            "UPDATE products SET description = %s WHERE id = %s",
                            (data['description'], product_id)
                        )
                    
                    # Update images
                    if data['images']:
                        # First image as main imageUrl
                        cursor.execute(
                            "UPDATE products SET imageUrl = %s WHERE id = %s",
                            (data['images'][0], product_id)
                        )
                        images_added += 1
                        
                        # Additional images as gallery (JSON array)
                        if len(data['images']) > 1:
                            gallery = json.dumps(data['images'][1:])
                            cursor.execute(
                                "UPDATE products SET galleryImages = %s WHERE id = %s",
                                (gallery, product_id)
                            )
                    
                    updated += 1
                    
                    if updated % 50 == 0:
                        conn.commit()
                        print(f"  Updated {updated} products ({images_added} with images)...", file=sys.stderr)
                
                except Exception as e:
                    errors.append(f"SKU {sku}: {str(e)[:80]}")
                    if len(errors) >= 20:
                        break
        
        conn.commit()
        conn.close()
        
        print(f"\n✓ Update complete!")
        print(f"  Updated: {updated}")
        print(f"  With images: {images_added}")
        print(f"  Skipped: {skipped}")
        if errors:
            print(f"  Errors: {len(errors)}")
            for err in errors[:10]:
                print(f"    - {err}")
        
        return updated, skipped, errors
        
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    db_url = os.getenv('DATABASE_URL')
    if not db_url:
        print("ERROR: DATABASE_URL not set", file=sys.stderr)
        sys.exit(1)
    
    xml_path = '/home/ubuntu/upload/amoindustrial.WordPress.2026-05-21.xml'
    
    if not Path(xml_path).exists():
        print(f"ERROR: XML file not found: {xml_path}", file=sys.stderr)
        sys.exit(1)
    
    print()
    
    # Parse XML
    products_data = parse_wordpress_xml(xml_path)
    print(f"Found {len(products_data)} products with metadata")
    
    # Count products with images
    products_with_images = sum(1 for p in products_data.values() if p['images'])
    total_images = sum(len(p['images']) for p in products_data.values())
    print(f"  {products_with_images} products have {total_images} images")
    print()
    
    # Update database
    updated, skipped, errors = update_products_in_db(products_data, db_url)
    
    sys.exit(0 if not errors or len(errors) < 20 else 1)
