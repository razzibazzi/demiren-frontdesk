import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: '🏠'
    },
    {
      path: '/BookingChargesList',
      label: 'Booking Charges',
      icon: '📋'
    },
    {
      path: '/BookingListRequest',
      label: 'Booking Requests',
      icon: '📝'
    },
    {
      path: '/BookingChargesMaster',
      label: 'Charges Master',
      icon: '⚙️'
    },
    {
      path: '/BookingCreateInvoice',
      label: 'Create Invoice',
      icon: '🧾'
    },
    {
      path: '/BookingDisplayInvoiceSample',
      label: 'Invoice Sample',
      icon: '📄'
    },
    {
      path: '/APITest',
      label: 'API Test',
      icon: '🔧'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.navContainer}>
        <div style={styles.logo}>
          <h2 style={styles.logoText}>🏨 Demiren Hotel</h2>
        </div>
        
        <ul style={styles.navList}>
          {navItems.map((item) => (
            <li key={item.path} style={styles.navItem}>
              <Link
                to={item.path}
                style={{
                  ...styles.navLink,
                  ...(isActive(item.path) ? styles.navLinkActive : {})
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    backgroundColor: '#2c3e50',
    padding: '0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  navContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px'
  },
  logo: {
    flex: '0 0 auto'
  },
  logoText: {
    color: '#ecf0f1',
    margin: '0',
    fontSize: '1.5rem',
    fontWeight: 'bold'
  },
  navList: {
    display: 'flex',
    listStyle: 'none',
    margin: '0',
    padding: '0',
    gap: '10px'
  },
  navItem: {
    margin: '0'
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    color: '#bdc3c7',
    textDecoration: 'none',
    borderRadius: '6px',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500'
  },
  navLinkActive: {
    backgroundColor: '#3498db',
    color: '#ffffff'
  },
  navIcon: {
    marginRight: '8px',
    fontSize: '16px'
  },
  navLabel: {
    whiteSpace: 'nowrap'
  }
};

export default Navigation;
