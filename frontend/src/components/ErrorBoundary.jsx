import React from 'react';

export default class ErrorBoundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('Page rendering failed:', error); }
  render() {
    if (this.state.failed) return <main className="not-found" role="alert"><p>VIEWFINDER / A MOMENTARY PAUSE</p><h1>Let’s refocus.</h1><p>Something interrupted this page. Reload to try again.</p><button onClick={() => window.location.reload()}>Reload page</button><a href="/">Return home</a></main>;
    return this.props.children;
  }
}
