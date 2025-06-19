# Saved Favorites System - UX/UI Design Specifications

## Overview
The Saved Favorites System allows customers to bookmark and organize their preferred meals, orders, and restaurants for quick access and sharing.

## User Stories

### Primary User Stories
- **As a customer**, I want to save favorite meals so I can quickly reorder them later
- **As a customer**, I want to organize favorites into categories so I can find them easily
- **As a customer**, I want to create custom lists so I can organize favorites by occasion or preference
- **As a customer**, I want to share my favorite lists so I can recommend meals to friends
- **As a customer**, I want quick access to favorites while browsing so I can order efficiently

### Secondary User Stories
- **As a customer**, I want to see favorite availability so I know if items are currently offered
- **As a customer**, I want to get notifications about favorite items so I don't miss promotions
- **As a customer**, I want to sync favorites across devices so I have access everywhere
- **As a customer**, I want to remove outdated favorites so my lists stay relevant

## Wireframes & User Interface

### Main Favorites Screen
```
┌─────────────────────────────────────┐
│ ← Favorites                    ⚙️ + │
├─────────────────────────────────────┤
│ [All] [Meals] [Restaurants] [Lists] │
├─────────────────────────────────────┤
│ Quick Access                        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    │
│ │ 📷  │ │ 📷  │ │ 📷  │ │ 📷  │    │
│ │Salmon│ │Bowl │ │Pizza│ │Sushi│    │
│ └─────┘ └─────┘ └─────┘ └─────┘    │
│                                     │
│ My Lists                            │
│ ┌─────────────────────────────────┐ │
│ │ 🍳 Breakfast Favorites (8)      │ │
│ │ Quick morning meals             │ │
│ │                            ▶   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🥗 Healthy Options (12)         │ │
│ │ Low-calorie, high-protein       │ │
│ │                            ▶   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎉 Date Night (5)               │ │
│ │ Special occasion meals          │ │
│ │                            ▶   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Recent Favorites                    │
│ [Meal cards with heart icons...]   │
└─────────────────────────────────────┘
```

### Favorite List Detail Screen
```
┌─────────────────────────────────────┐
│ ← Breakfast Favorites          ⚙️ 📤│
├─────────────────────────────────────┤
│ 8 items • Created Dec 1, 2024      │
│ Quick morning meals                 │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 📷 Avocado Toast Supreme        │ │
│ │ Green Bowl Kitchen              │ │
│ │ $12.99 • ⭐ 4.8 • 15 min      │ │
│ │ Available • Last ordered 3 days │ │
│ │ [Order Now]              ❤️ ⋮  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📷 Protein Pancakes             │ │
│ │ Fit Kitchen                     │ │
│ │ $14.50 • ⭐ 4.6 • 20 min      │ │
│ │ Unavailable • Seasonal item     │ │
│ │ [Notify When Available]  ❤️ ⋮  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [+ Add Items to List]               │
│                                     │
│ Share this list:                    │
│ [📱] [📧] [💬] [📋 Copy Link]      │
└─────────────────────────────────────┘
```

### Create Custom List Screen
```
┌─────────────────────────────────────┐
│ ← Create New List                   │
├─────────────────────────────────────┤
│ List Name                           │
│ ┌─────────────────────────────────┐ │
│ │ Weekend Treats                  │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description (Optional)              │
│ ┌─────────────────────────────────┐ │
│ │ Special meals for relaxing      │ │
│ │ weekend mornings                │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Choose Icon                         │
│ [🍳] [🥗] [🍕] [🍜] [🎉] [❤️]      │
│                                     │
│ Privacy Settings                    │
│ ○ Private (Only you can see)        │
│ ● Shareable (You can share link)    │
│ ○ Public (Discoverable by others)   │
│                                     │
│ Add Items Now?                      │
│ [Skip] [Browse & Add Items]         │
│                                     │
│ [Create List]                       │
└─────────────────────────────────────┘
```

### Quick Add to Favorites (Modal)
```
┌─────────────────────────────────────┐
│ Add to Favorites                 ✕  │
├─────────────────────────────────────┤
│ 📷 Grilled Salmon Bowl              │
│ Green Bowl Kitchen • $18.99         │
│                                     │
│ Add to:                             │
│ ☑️ All Favorites                    │
│ ☑️ Healthy Options                  │
│ ☐ Breakfast Favorites               │
│ ☐ Date Night                        │
│                                     │
│ [+ Create New List]                 │
│                                     │
│ Tags (Optional)                     │
│ ┌─────────────────────────────────┐ │
│ │ high-protein, salmon, healthy   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]              [Add to Lists]│
└─────────────────────────────────────┘
```

## User Interaction Flows

### Flow 1: Save Item to Favorites
1. Customer views meal/restaurant
2. Customer taps heart icon
3. System shows "Add to Favorites" modal
4. Customer selects lists to add to
5. System saves favorite and shows confirmation

### Flow 2: Create Custom List
1. Customer taps "+" in favorites
2. System shows create list form
3. Customer enters name, description, icon
4. Customer sets privacy settings
5. System creates list and navigates to it

### Flow 3: Share Favorite List
1. Customer opens favorite list
2. Customer taps share icon
3. System shows sharing options
4. Customer selects sharing method
5. System generates shareable link/content

### Flow 4: Quick Order from Favorites
1. Customer opens favorites
2. Customer taps quick access item
3. System adds to cart or shows restaurant
4. Customer proceeds with order

### Flow 5: Manage List Items
1. Customer opens favorite list
2. Customer taps menu (⋮) on item
3. System shows options (remove, move, etc.)
4. Customer selects action
5. System updates list

## Technical Specifications

### Data Models
```typescript
interface FavoriteItem {
  id: string;
  customerId: string;
  itemType: 'meal' | 'restaurant' | 'order';
  itemId: string;
  itemData: MealData | RestaurantData | OrderData;
  tags: string[];
  dateAdded: Date;
  lastAccessed?: Date;
  isAvailable: boolean;
}

interface FavoriteList {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  icon: string;
  privacy: 'private' | 'shareable' | 'public';
  items: FavoriteItem[];
  createdAt: Date;
  updatedAt: Date;
  shareToken?: string;
}

interface QuickAccess {
  customerId: string;
  favoriteIds: string[];
  order: number[];
  lastUpdated: Date;
}
```

### API Endpoints
```typescript
// Get customer favorites
GET /api/customers/{customerId}/favorites

// Add item to favorites
POST /api/customers/{customerId}/favorites
Body: { itemType, itemId, listIds?, tags? }

// Create favorite list
POST /api/customers/{customerId}/favorite-lists
Body: { name, description?, icon, privacy }

// Share favorite list
POST /api/customers/{customerId}/favorite-lists/{listId}/share
Response: { shareUrl, shareToken }

// Get shared list (public endpoint)
GET /api/shared/favorite-lists/{shareToken}

// Update quick access order
PUT /api/customers/{customerId}/quick-access
Body: { favoriteIds: string[] }
```

### Performance Requirements
- Favorites load within 1.5 seconds
- Quick access items cached locally
- Offline access to cached favorites
- Real-time availability updates
- Smooth animations for heart interactions

### Accessibility Features
- Screen reader support for all favorite actions
- High contrast heart icons
- Voice commands for adding favorites
- Keyboard navigation for lists
- Alternative text for all images

## Integration Requirements

### Backend Systems
- Menu item availability tracking
- Real-time price updates
- Restaurant status integration
- User preference synchronization
- Analytics for favorite patterns

### Third-Party Services
- Social sharing APIs (Facebook, Twitter, etc.)
- Deep linking for shared lists
- Push notifications for availability
- Image optimization for favorites
- Search indexing for public lists

### Cross-Platform Sync
- Cloud synchronization across devices
- Conflict resolution for simultaneous edits
- Backup and restore functionality
- Migration tools for account transfers

## Success Metrics
- Favorite usage: 70% of customers save at least 5 favorites
- List creation: 40% of customers create custom lists
- Reorder from favorites: 35% of orders come from favorites
- Sharing engagement: 15% of lists are shared
- Quick access usage: 60% of customers use quick access weekly
- Retention impact: Customers with favorites have 40% higher retention
