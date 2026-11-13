const ARTS = ['ember', 'dusk', 'aurora', 'glacier', 'verdant'];
function text(value, label, max, required = false) {
  if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error(`${label} ${required ? 'is required and ' : ''}must be at most ${max} characters.`);
  return value.trim();
}
function httpsUrl(value, drive = false) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' && !u.username && !u.password && (!drive || ['drive.google.com', 'docs.google.com'].includes(u.hostname));
  } catch { return false; }
}
function eventData(body = {}) {
  const { section = 'events', title, date, description = '', tags = '', driveUrl, published = false, pinned = false, pinOrder = 0, art = 'ember' } = body || {};
  if (!['events', 'chitrakala'].includes(section)) throw new Error('Choose Events or Chitraka as the destination.');
  const cleanTitle = text(title, 'Event title', 120, true);
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('Choose a valid calendar date.');
  if (!httpsUrl(driveUrl, true)) throw new Error('Use an HTTPS link from drive.google.com or docs.google.com.');
  if (typeof published !== 'boolean' || typeof pinned !== 'boolean' || !Number.isInteger(pinOrder) || Math.abs(pinOrder) > 10000 || !ARTS.includes(art)) throw new Error('Check publication settings, artwork, and pin order (a whole number from -10000 to 10000).');
  return { section, title: cleanTitle, date, description: text(description, 'Description', 1500), tags: text(tags, 'Tags', 300), driveUrl: driveUrl.trim(), published, pinned, pinOrder, art };
}
function walkData(body = {}, slot) {
  if (!Number.isInteger(slot) || slot < 0 || slot > 7) throw new Error('Choose one of the eight photo walk slots.');
  const { title, url, link, location = '', date = '' } = body || {};
  if (!httpsUrl(url) || !httpsUrl(link)) throw new Error('Thumbnail and destination must be valid HTTPS links.');
  return { slot, title: text(title, 'Title', 120, true), url: url.trim(), link: link.trim(), location: text(location, 'Location', 120), date: text(date, 'Date label', 80) };
}
module.exports = { eventData, walkData, httpsUrl };
