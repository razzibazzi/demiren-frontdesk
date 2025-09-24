import React from 'react';
import Navigation from './Navigation';

function Layout({ children }) {
  return (
    <div style={styles.layout}>
      <Navigation />
      <main style={styles.main}>
        <div style={styles.container}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  layout: {
    minHeight: '100vh',
    backgroundColor: '#f8f9fa'
  },
  main: {
    padding: '20px 0'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px'
  }
};

export default Layout;
