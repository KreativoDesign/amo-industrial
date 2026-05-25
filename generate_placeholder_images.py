#!/usr/bin/env python3
"""
Generate placeholder images for products without images.
Uses PIL to create simple placeholder images with product names.
"""

import os
import sys
import pymysql
import json
from urllib.parse import urlparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

def get_products_without_images(db_url):
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
            SELECT id, sku, name, categoryId
            FROM products 
            WHERE published = 1 AND (imageUrl IS NULL OR imageUrl = '')
            ORDER BY name
        """)
        
        results = cursor.fetchall()
    
    conn.close()
    return results

def get_category_name(db_url, category_id):
    """Get category name by ID."""
    
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
        cursor.execute("SELECT name FROM categories WHERE id = %s", (category_id,))
        result = cursor.fetchone()
    
    conn.close()
    return result[0] if result else "Product"

def create_placeholder_image(product_name, category_name, output_path):
    """Create a placeholder image with product information."""
    
    # Create image with industrial colors
    width, height = 500, 500
    image = Image.new('RGB', (width, height), color=(31, 41, 55))  # charcoal
    draw = ImageDraw.Draw(image)
    
    # Try to use a nice font, fall back to default
    try:
        title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
        text_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 18)
    except:
        title_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
    
    # Draw AMO Industrial red accent bar
    draw.rectangle([(0, 0), (width, 60)], fill=(220, 38, 38))  # AMO red
    
    # Draw category label
    draw.text((20, 15), category_name.upper(), fill=(255, 255, 255), font=text_font)
    
    # Wrap and draw product name
    wrapped_text = textwrap.fill(product_name, width=30)
    y_position = 120
    
    for line in wrapped_text.split('\n'):
        draw.text((20, y_position), line, fill=(255, 255, 255), font=title_font)
        y_position += 40
    
    # Draw footer
    draw.text((20, height - 50), "Product Image", fill=(156, 163, 175), font=text_font)
    draw.text((20, height - 25), "Not Available", fill=(156, 163, 175), font=text_font)
    
    # Save image
    image.save(output_path)
    return output_path

def upload_placeholder_to_storage(image_path, product_id):
    """Upload placeholder image to storage and return URL."""
    
    try:
        # Use manus-upload-file to upload to S3
        import subprocess
        result = subprocess.run(
            ['manus-upload-file', '--webdev', image_path],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            # Parse the output to get the URL
            output = result.stdout.strip()
            # The output should contain a URL like /manus-storage/...
            if '/manus-storage/' in output:
                # Extract URL from output
                lines = output.split('\n')
                for line in lines:
                    if '/manus-storage/' in line:
                        return line.strip()
        
        return None
    except Exception as e:
        print(f"Error uploading image: {e}", file=sys.stderr)
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
    
    print("\nGenerating placeholder images for products without images...\n")
    
    products = get_products_without_images(db_url)
    print(f"Found {len(products)} products without images\n")
    
    # Create temp directory for placeholder images
    temp_dir = Path("/tmp/product_placeholders")
    temp_dir.mkdir(exist_ok=True)
    
    updated = 0
    skipped = 0
    
    for i, (product_id, sku, name, category_id) in enumerate(products, 1):
        try:
            category_name = get_category_name(db_url, category_id)
            
            # Create placeholder image
            image_path = temp_dir / f"placeholder_{product_id}.png"
            create_placeholder_image(name, category_name, str(image_path))
            
            # Upload to storage
            image_url = upload_placeholder_to_storage(str(image_path), product_id)
            
            if image_url:
                # Update database
                if update_product_image(db_url, product_id, image_url):
                    updated += 1
                    if i % 10 == 0:
                        print(f"  Generated {i} placeholders...", file=sys.stderr)
                else:
                    skipped += 1
            else:
                skipped += 1
            
            # Clean up temp file
            image_path.unlink(missing_ok=True)
            
        except Exception as e:
            print(f"Error processing product {product_id}: {e}", file=sys.stderr)
            skipped += 1
    
    print(f"\n✓ Complete!")
    print(f"  Generated: {updated}")
    print(f"  Skipped: {skipped}")
