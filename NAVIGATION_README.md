# 🏨 Demiren Hotel Management System - Navigation

## Overview
A clean and intuitive navigation system for the Demiren Hotel Management System built with React Router.

## Features

### 🧭 Navigation Components
- **Navigation Bar**: Sticky top navigation with active state indicators
- **Layout Component**: Consistent page layout wrapper
- **Home Page**: Dashboard with quick access cards
- **Responsive Design**: Mobile-friendly navigation

### 📱 Navigation Structure
```
🏠 Home                    - Dashboard with quick actions
📋 Booking Charges         - View and manage booking charges  
📝 Booking Requests        - Approve pending booking requests
⚙️ Charges Master          - Manage amenity charges and categories
🧾 Create Invoice          - Create comprehensive invoices
📄 Invoice Sample          - View invoice samples and templates
```

### 🎨 Design Features
- **Modern UI**: Clean, professional design with hotel branding
- **Active States**: Visual indicators for current page
- **Hover Effects**: Smooth transitions and interactions
- **Color Coding**: Each section has its own color theme
- **Icons**: Intuitive emoji icons for quick recognition

### 📱 Responsive Behavior
- **Desktop**: Full navigation with labels and icons
- **Tablet**: Compact navigation with icons
- **Mobile**: Icon-only navigation for space efficiency

## File Structure
```
src/
├── components/
│   ├── Navigation.jsx     - Main navigation component
│   ├── Layout.jsx         - Page layout wrapper
│   └── HomePage.jsx       - Dashboard home page
├── App.js                 - Main app with routing
└── App.css                - Global styles
```

## Usage

### Adding New Routes
1. Add route to `App.js`:
```jsx
<Route path="/NewPage" element={<NewPageComponent />} />
```

2. Add navigation item to `Navigation.jsx`:
```jsx
{
  path: '/NewPage',
  label: 'New Page',
  icon: '🆕'
}
```

### Styling
- Global styles in `App.css`
- Component-specific styles using inline styles
- Responsive breakpoints: 768px, 480px

## Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Dependencies
- React Router DOM
- React (hooks)
- No external UI libraries (pure CSS)

---

**Built with ❤️ for Demiren Hotel Management System**
