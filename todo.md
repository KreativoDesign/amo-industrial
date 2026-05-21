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
