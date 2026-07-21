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


## Phase 20: WordPress Image Scraping & Bulk Import ✅ COMPLETE
- [x] Scrape 440 product images from WordPress shop
- [x] Create importBulkUrls tRPC procedure for bulk image matching
- [x] Implement product name matching algorithm (60% similarity threshold)
- [x] Add Bulk WordPress Image Import UI to admin dashboard
- [x] Display import results (matched, updated, unmatched products)
- [x] Add wordpress_products.json to public folder
- [x] Write and pass 4 vitest tests for matching logic
- [x] Run bulk import: 356 products matched, 42 updated with real images

## Phase 21: Frontend Login/Logout Navigation ✅ COMPLETE
- [x] Add Login button to desktop navigation (visible when not logged in)
- [x] Add Logout button to desktop navigation (visible when logged in)
- [x] Add Login button to mobile navigation (visible when not logged in)
- [x] Add Logout button to mobile navigation (visible when logged in)
- [x] Display user name next to logout button on desktop
- [x] All 11 vitest tests pass

## Phase 22: Admin Role Assignment & Import Execution ✅ COMPLETE
- [x] Promote user to admin role in database
- [x] Create Node.js import script for bulk WordPress image import
- [x] Execute bulk import: 356 matched, 42 updated, 84 unmatched
- [x] Fix mobile admin panel responsiveness issue

## Phase 23: Mobile-Responsive Admin Dashboard ✅ COMPLETE
- [x] Add mobile header with hamburger menu
- [x] Create collapsible sidebar navigation for mobile
- [x] Implement responsive grid layouts for all tabs
- [x] Convert products table to card view on mobile
- [x] Add overlay for mobile sidebar
- [x] Optimize typography and spacing for mobile
- [x] All 11 vitest tests pass


## Phase 24: Product Image Visibility & Replication ✅ COMPLETE

## Phase 25: Comprehensive Product Image Filtering ✅ COMPLETE
- [x] Filter featured products to only show those with real images
- [x] Remove hardcoded products with placeholder images from homepage
- [x] Display only products with valid imageUrl on featured section
- [x] Update product visibility logic to hide products without images
- [x] Filter out products with placeholder/missing images from shop display
- [x] Create admin tool to replicate images across product variants
- [x] Identify products with duplicate names but different sizes
- [x] Copy images from one variant to all matching variants
- [x] Update backend getProducts query to exclude image-less products site-wide
- [x] Filter products without images from all website surfaces (shop, featured, related, detail)
- [x] Add "Replicate Images Across Variants" button to admin dashboard
- [x] All 11 vitest tests pass
- [x] Backend filter ensures NO products without images appear anywhere on website


## Phase 26: Auto-Replicate Main Product Image to Variants ✅ COMPLETE
- [x] Identify products with options where main has image but variants don't
- [x] Create script to replicate main product image to all variants
- [x] Execute bulk image replication: 119 variant products updated
- [x] Verify all option variants now display the main product image
- [x] Alpen F4 FORTE and all variant groups now have consistent images
- [x] All 11 vitest tests pass


## Phase 27: Product Variant Selector ✅ COMPLETE
- [x] Examine ProductDetail page structure and variant data
- [x] Create getVariants tRPC procedure to fetch product variants
- [x] Implement variant selector dropdown with smooth switching
- [x] Add variant switching logic with URL navigation
- [x] Highlight current variant in dropdown
- [x] All 11 vitest tests pass

## Phase 28: Dynamic Variant Image Updates ✅ COMPLETE
- [x] Add selectedVariantId state to ProductDetail component
- [x] Implement dynamic variant data fetching without page navigation
- [x] Update product image, name, SKU, and details on variant selection
- [x] Reset image gallery to first image when variant is selected
- [x] Update "Add to Quote" button to use selected variant data
- [x] Smooth transitions between variant displays
- [x] All 11 vitest tests pass


## Phase 29: Header Logo Replacement ✅ COMPLETE
- [x] Upload AMO Industrial logo image to webdev storage
- [x] Replace text logo with professional logo image in Header component
- [x] Adjust logo sizing for desktop and mobile views
- [x] Maintain responsive design and header layout
- [x] All 11 vitest tests pass

## Phase 30: Logo Interactivity & Hover Effects ✅ COMPLETE
- [x] Verify logo is clickable and returns to homepage
- [x] Add subtle scale-up hover effect (scale-105)
- [x] Add drop-shadow hover effect for depth
- [x] Smooth 300ms transition with ease-out timing
- [x] Add cursor pointer to indicate clickability
- [x] All 11 vitest tests pass


## Phase 31: Responsive Footer with Logo Branding ✅ COMPLETE
- [x] Replace footer icon and text logo with AMO Industrial logo image
- [x] Center all footer content on mobile view
- [x] Make footer fully responsive across all device sizes
- [x] Adjust footer layout for mobile, tablet, and desktop
- [x] Maintain footer functionality and links
- [x] Test footer responsiveness on all breakpoints

## Phase 32: Enhanced Slide-Out Sidebar Navigation ✅ COMPLETE
- [x] Implement smooth slide-out animation for sidebar on mobile
- [x] Add backdrop overlay with smooth fade-in/out transitions
- [x] Enhance sidebar styling with better visual hierarchy
- [x] Optimize sidebar for all breakpoints (mobile, tablet, desktop)
- [x] Add smooth transitions and animations using Tailwind
- [x] Test sidebar on mobile, tablet, and desktop devices
- [x] Verify all navigation items are accessible and responsive

## Phase 33: Inventory Management System ✅ COMPLETE
- [x] Create inventory schema with stock levels, reorder thresholds, and history
- [x] Generate and apply database migrations for inventory tables
- [x] Implement backend tRPC procedures for inventory operations (get, update, track history)
- [x] Create inventory management UI in admin dashboard
- [x] Add low-stock alerts and reorder threshold configuration
- [x] Display stock status on product cards in admin panel
- [x] Implement inventory history tracking and audit log
- [x] Add visual indicators for stock levels (in stock, low stock, out of stock)
- [x] Test inventory system on all breakpoints
