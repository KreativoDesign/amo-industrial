# AMO Industrial — Project TODO

## Phase 2: Database Schema & Setup
- [x] Define database schema: products, categories, brands, quote_requests, quote_items
- [x] Generate and apply migrations
- [x] Seed sample product categories and demo products

## Phase 3: Global Theme, Layout & Navigation
- [x] Set up AMO Industrial CSS theme (industrial red, charcoal, off-white)
- [x] Configure Google Fonts (Inter + Barlow Condensed)
- [x] Build sticky top navigation with mega-menu (Categories, Shop Industrial, Contact, Your Quote)
- [x] Build site footer with contact info, links, social
- [x] Build main layout wrapper (Header + Footer)

## Phase 4: Homepage & Contact Page
- [x] Build hero section with industrial headline and CTA
- [x] Build company value propositions section
- [x] Build product category showcase section
- [x] Build "How Quotes Work" section
- [x] Build supplier/brands section
- [x] Build contact CTA section
- [x] Build Contact page (address, phone, email, hours, map)

## Phase 5: Product Catalogue & Filtering
- [x] Build /categories page with category grid
- [x] Build /category/:slug page with products + sidebar filters
- [x] Build /product/:slug detail page
- [x] Implement keyword search
- [x] Implement category, brand, price range filters
- [x] Live filtering without page reload
- [x] Related products section on product page

## Phase 6: RFQ Quote System
- [x] Build QuoteContext (global state for quote list)
- [x] Add "Add to Quote" button on product cards and detail pages
- [x] Build quote drawer/sidebar (slide-out, live count badge)
- [x] Build /request-quote dedicated page
- [x] Build quote submission form (company, contact, email, phone, notes)
- [x] Store submitted quotes in database
- [x] Trigger owner notification on quote submission

## Phase 7: Admin Dashboard
- [x] Build /admin protected route (admin role only)
- [x] Build admin product list with add/edit/delete
- [x] Build admin quote requests view with status management
- [x] Build CSV import tool for bulk product upload
- [x] Build category management in admin

## Phase 8: Backend Routers & Tests
- [x] Implement tRPC routers: products, categories, quotes, admin
- [x] Implement CSV import endpoint
- [x] Write vitest tests for core procedures
- [x] Final mobile responsiveness polish
- [x] SEO meta tags on all pages

## Phase 9: Product Catalogue Import
- [x] Import 506 products from WooCommerce CSV export
- [x] Parse and normalize product data (prices, categories, brands)
- [x] Create 76 categories and 59 brands from product data
- [x] Verify all products are searchable and filterable

## Phase 10: WordPress Data Enrichment
- [x] Parse WordPress XML export (5.5 MB)
- [x] Extract 422 products with metadata
- [x] Map 455 product images to 306 products via attachment relationships
- [x] Extract and store full product descriptions (329 products)
- [x] Enrich database with gallery images (40 products with multiple images)

## Phase 11: Complete Image Coverage
- [x] Identified 200 products without main images
- [x] Generated professional placeholder images for all 200 products
- [x] Uploaded placeholders to S3 storage
- [x] Updated database — 100% of products now have images (506/506)

## Phase 12: Frontend Image Filtering
- [x] Updated getProducts() to filter out products without images
- [x] Updated getProductBySlug() to filter out products without images
- [x] All product queries now exclude products with null/empty imageUrl
- [x] Tests pass (7/7)

## Phase 13: Image URL Correction
- [x] Identified broken image URLs with "Storage Path: " prefix
- [x] Fixed all image URLs by removing prefix (200 products)
- [x] Verified all images now load correctly


## Phase 14: Admin Image Upload Tool
- [x] Add uploadProductImage tRPC procedure to backend
- [x] Implement drag-and-drop image uploader in ProductFormModal
- [x] Add image preview functionality
- [x] Wire file upload to storage service
- [x] Add change image functionality
- [x] All tests pass (7/7)


## Phase 15: Manual Product Creation
- [x] Updated ProductFormModal to allow image upload for new products
- [x] New products can now be created with image preview before saving
- [x] Image is automatically uploaded to S3 after product creation
- [x] Admins can add products with all fields: name, SKU, category, brand, price, description, image
- [x] All tests pass (7/7)


## Phase 16: Product Import from URL
- [x] Add scrapeProductUrl tRPC procedure to backend
- [x] Implement HTML scraping for product name, description, and images
- [x] Add URL scraper UI to ProductFormModal (only for new products)
- [x] Auto-fill form fields with scraped data
- [x] Support for relative and absolute image URLs
- [x] All tests pass (7/7)


## Phase 17: Admin Panel Navigation Link
- [x] Add Settings icon import from lucide-react
- [x] Add useAuth hook to Header component
- [x] Add conditional Admin link in desktop navigation (only visible to admin users)
- [x] Style Admin link in red to match branding
- [x] All tests pass (7/7)


## Phase 18: Mobile Admin Menu
- [x] Add Admin Panel link to mobile navigation menu
- [x] Show Admin link only for logged-in admin users
- [x] Style with red color and settings icon for consistency
- [x] All tests pass (7/7)


## Phase 19: Frontend Login/Logout Button
- [x] Add Login button to desktop navigation (visible when not logged in)
- [x] Add Logout button to desktop navigation (visible when logged in)
- [x] Add Login button to mobile navigation (visible when not logged in)
- [x] Add Logout button to mobile navigation (visible when logged in)
- [x] Style buttons consistently with AMO branding
- [x] All tests pass (7/7)
