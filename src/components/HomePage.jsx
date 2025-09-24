import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  const quickActions = [
    {
      title: 'Booking Charges',
      description: 'View and manage booking charges',
      path: '/',
      icon: '📋',
      color: '#3498db'
    },
    {
      title: 'Booking Requests',
      description: 'Approve pending booking requests',
      path: '/BookingListRequest',
      icon: '📝',
      color: '#e74c3c'
    },
    {
      title: 'Charges Master',
      description: 'Manage amenity charges and categories',
      path: '/BookingChargesMaster',
      icon: '⚙️',
      color: '#f39c12'
    },
    {
      title: 'Create Invoice',
      description: 'Create comprehensive invoices',
      path: '/BookingCreateInvoice',
      icon: '🧾',
      color: '#27ae60'
    },
    {
      title: 'Invoice Sample',
      description: 'View invoice samples and templates',
      path: '/BookingDisplayInvoiceSample',
      icon: '📄',
      color: '#9b59b6'
    }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🏨 Demiren Hotel Management System</h1>
        <p style={styles.subtitle}>Welcome to your comprehensive hotel management dashboard</p>
      </div>

      <div style={styles.grid}>
        {quickActions.map((action, index) => (
          <Link key={index} to={action.path} style={styles.cardLink}>
            <div style={{...styles.card, borderTopColor: action.color}}>
              <div style={styles.cardIcon}>{action.icon}</div>
              <h3 style={styles.cardTitle}>{action.title}</h3>
              <p style={styles.cardDescription}>{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div style={styles.footer}>
        <p style={styles.footerText}>
          💡 <strong>Tip:</strong> Use the navigation bar above to quickly access any section of the system.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px 0'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  title: {
    fontSize: '2.5rem',
    color: '#2c3e50',
    margin: '0 0 10px 0',
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#7f8c8d',
    margin: '0'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '40px'
  },
  cardLink: {
    textDecoration: 'none',
    color: 'inherit'
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    borderTop: '4px solid #3498db',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    textAlign: 'center'
  },
  cardIcon: {
    fontSize: '3rem',
    marginBottom: '16px'
  },
  cardTitle: {
    fontSize: '1.4rem',
    color: '#2c3e50',
    margin: '0 0 12px 0',
    fontWeight: '600'
  },
  cardDescription: {
    fontSize: '1rem',
    color: '#7f8c8d',
    margin: '0',
    lineHeight: '1.5'
  },
  footer: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#ecf0f1',
    borderRadius: '8px'
  },
  footerText: {
    margin: '0',
    color: '#2c3e50',
    fontSize: '1rem'
  }
};

export default HomePage;
