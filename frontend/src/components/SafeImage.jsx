import React, { useEffect, useState } from 'react';
export default function SafeImage({ src, alt = '', className = '', style, ...props }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  return failed || !src ? <div role="img" aria-label={alt || 'Image unavailable'} className={className} style={{ ...style, background: '#1c1c20', color: '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, textAlign: 'center', fontSize: 12 }}>Image unavailable</div> : <img {...props} src={src} alt={alt} className={className} style={style} onError={() => setFailed(true)} />;
}
