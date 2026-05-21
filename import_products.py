#!/usr/bin/env python3
"""
Import WooCommerce products from CSV to AMO Industrial database.
"""

import csv
import re
import sys
import os
from pathlib import Path
from urllib.parse import urlparse

try:
    import pymysql
except ImportError:
    os.system("sudo pip3 install pymysql -q")
    import pymysql

def slugify(text):
    """Convert text to URL-safe slug."""
    text = str(text).lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def get_or_create_category(conn, category_name):
    """Get or create a category and return its ID."""
    if not category_name:
        return None
    
    slug = slugify(category_name)
    
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM categories WHERE slug = %s", (slug,))
        result = cursor.fetchone()
        if result:
            return result[0]
        
        cursor.execute(
            "INSERT INTO categories (name, slug, sortOrder) VALUES (%s, %s, %s)",
            (category_name, slug, 999)
        )
        conn.commit()
        return cursor.lastrowid

def get_or_create_brand(conn, brand_name):
    """Get or create a brand and return its ID."""
    if not brand_name:
        return None
    
    slug = slugify(brand_name)
    
    with conn.cursor() as cursor:
        cursor.execute("SELECT id FROM brands WHERE slug = %s", (slug,))
        result = cursor.fetchone()
        if result:
            return result[0]
        
        cursor.execute(
            "INSERT INTO brands (name, slug) VALUES (%s, %s)",
            (brand_name, slug)
        )
        conn.commit()
        return cursor.lastrowid

def import_products(csv_path, db_url):
    """Import products from CSV to database."""
    
    # Parse DATABASE_URL
    parsed = urlparse(db_url)
    
    # Extract host and port
    host_port = parsed.netloc.split('@')[1] if '@' in parsed.netloc else parsed.netloc
    if ':' in host_port:
        host, port = host_port.rsplit(':', 1)
        try:
            port = int(port)
        except:
            port = 3306
    else:
        host = host_port
        port = 3306
    
    user = parsed.username
    password = parsed.password
    database = parsed.path.lstrip('/')
    
    print(f"Connecting to {user}@{host}:{port}/{database}...")
    
    try:
        conn = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            database=database,
            ssl_verify_cert=False,
            ssl_verify_identity=False
        )
        
        imported = 0
        skipped = 0
        errors = []
        
        with open(csv_path, 'r', encoding='utf-8-sig', newline='') as f:
            # Use DictReader with proper quoting
            reader = csv.DictReader(f, quoting=csv.QUOTE_ALL, quotechar='"')
            
            for row_num, row in enumerate(reader, start=2):
                try:
                    # Skip if no name or not published
                    name = row.get('Name', '').strip() if row.get('Name') else ''
                    published = row.get('Published', '').strip()
                    
                    if not name or published != '1':
                        skipped += 1
                        continue
                    
                    sku = row.get('SKU', '').strip() or None
                    short_desc = row.get('Short description', '').strip() or None
                    categories_str = row.get('Categories', '').strip()
                    brand_str = row.get('Brands', '').strip()
                    in_stock = 1 if row.get('In stock?', '').strip() == '1' else 0
                    
                    # Price handling - convert to decimal or NULL (price column is DECIMAL(12,2))
                    price_str = row.get('Regular price', '').strip()
                    regular_price = None
                    if price_str:
                        # Clean price - remove currency symbols and spaces
                        clean_price = re.sub(r'[^\d.,]', '', price_str).strip()
                        if clean_price and clean_price not in ['.', ',', '']:
                            # Replace comma with dot for decimal separator
                            clean_price = clean_price.replace(',', '.')
                            try:
                                regular_price = float(clean_price)
                            except:
                                regular_price = None
                    
                    # Generate slug
                    slug = slugify(name)
                    
                    # Handle categories
                    category_id = None
                    if categories_str:
                        first_cat = categories_str.split(',')[0].strip()
                        if first_cat:
                            category_id = get_or_create_category(conn, first_cat)
                    
                    # Handle brand
                    brand_id = None
                    if brand_str:
                        brand_id = get_or_create_brand(conn, brand_str)
                    
                    # Check if product exists
                    with conn.cursor() as cursor:
                        if sku:
                            cursor.execute("SELECT id FROM products WHERE sku = %s", (sku,))
                            if cursor.fetchone():
                                skipped += 1
                                continue
                        
                        # Insert product
                        cursor.execute(
                            """
                            INSERT INTO products 
                            (name, slug, sku, shortDescription, categoryId, brandId, 
                             unit, price, inStock, published, featured)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            """,
                            (
                                name, slug, sku, short_desc, category_id, brand_id,
                                'Each', regular_price, in_stock, 1, 0
                            )
                        )
                    
                    imported += 1
                    
                    if imported % 100 == 0:
                        conn.commit()
                        print(f"  Imported {imported} products...", file=sys.stderr)
                
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)[:80]}")
                    if len(errors) >= 20:
                        break
        
        conn.commit()
        conn.close()
        
        print(f"\n✓ Import complete!")
        print(f"  Imported: {imported}")
        print(f"  Skipped: {skipped}")
        if errors:
            print(f"  Errors: {len(errors)}")
            for err in errors[:10]:
                print(f"    - {err}")
        
        return imported, skipped, errors
        
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
    
    csv_path = '/home/ubuntu/upload/wc-product-export-21-5-2026-1779389481528.csv'
    
    if not Path(csv_path).exists():
        print(f"ERROR: CSV file not found: {csv_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Importing products from: {csv_path}")
    print()
    
    imported, skipped, errors = import_products(csv_path, db_url)
    
    sys.exit(0 if not errors or len(errors) < 20 else 1)
