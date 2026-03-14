# ServicesHub - Marketplace de Servicios

## Current State
New project, no existing code.

## Requested Changes (Diff)

### Add
- Service marketplace where users can offer and hire freelance services
- User roles: sellers (service providers) and buyers (clients)
- Service listings with title, description, price, category, and seller info
- Browse and search services by category or keyword
- Service detail page with contact/hire button
- Seller profile page showing their services
- Dashboard for sellers to manage their listings (create, edit, delete)
- Authorization for protected routes

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: Users (via authorization), Services (CRUD), Categories, Search/filter
2. Backend entities: Service { id, title, description, price, category, sellerId, sellerName, createdAt, active }
3. Frontend: Landing/browse page, service detail, seller dashboard, create/edit service form, search & filter UI
4. Wire authorization for seller actions (create/edit/delete services)
