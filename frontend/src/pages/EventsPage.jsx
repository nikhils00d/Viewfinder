import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const mockEvents = [
  {
    id: 1,
    name: "Winter Orientation Photowalk",
    date: "2026-10-15",
    venue: "Main Campus Square",
    description: "Welcome to the new members! We covered the orientation week opening ceremony and the subsequent photowalk around campus.",
    driveLink: "https://drive.google.com/drive/folders/mock1"
  },
  {
    id: 2,
    name: "Annual Tech Symposium",
    date: "2026-11-02",
    venue: "Auditorium Complex",
    description: "Full day coverage of the keynote speakers, project exhibitions, and the evening award ceremony.",
    driveLink: "https://drive.google.com/drive/folders/mock2"
  },
  {
    id: 3,
    name: "Portrait Photography Workshop",
    date: "2026-11-20",
    venue: "Studio Room 104",
    description: "Hands-on session on studio lighting, reflectors, and directing subjects. Includes behind-the-scenes photos.",
    driveLink: "https://drive.google.com/drive/folders/mock3"
  }
];

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEvents = mockEvents.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8" style={{ fontFamily: '"Inter", sans-serif' }}>
      {/* Navigation */}
      <nav className="flex justify-between items-center mb-12 border-b border-white/10 pb-6">
        <Link to="/" className="text-2xl italic hover:opacity-80 transition-opacity" style={{ fontFamily: '"Playfair Display", serif' }}>
          ViewFinder
        </Link>
        <div className="text-sm tracking-widest uppercase text-white/50" style={{ fontFamily: '"DM Mono", monospace' }}>
          Public Archives
        </div>
      </nav>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl md:text-5xl mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>Event Archives</h1>
        <p className="text-[#888888] mb-12 max-w-2xl leading-relaxed">
          Access high-resolution event coverage from Confluenz. 
          Use the search bar to find a specific event and access its raw media files via Google Drive.
        </p>

        {/* Search */}
        <div className="mb-12 relative">
          <input
            type="text"
            placeholder="Search by event name..."
            className="w-full bg-transparent border-b border-white/20 pb-4 text-xl outline-none focus:border-white transition-colors placeholder:text-white/20"
            style={{ fontFamily: '"DM Mono", monospace' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Event Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredEvents.map(event => (
            <div key={event.id} className="border border-white/10 p-6 hover:border-white/30 transition-colors group relative overflow-hidden flex flex-col bg-black/40">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8202A]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl group-hover:text-[#E8202A] transition-colors" style={{ fontFamily: '"Playfair Display", serif' }}>{event.name}</h2>
                <span className="text-xs text-white/40 tracking-widest mt-1" style={{ fontFamily: '"DM Mono", monospace' }}>
                  {event.date}
                </span>
              </div>
              
              <div className="text-xs tracking-wider text-white/60 mb-4 uppercase" style={{ fontFamily: '"DM Mono", monospace' }}>
                {event.venue}
              </div>
              
              <p className="text-[#888888] text-sm leading-relaxed mb-8 flex-grow">
                {event.description}
              </p>

              <a 
                href={event.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-sm tracking-widest uppercase hover:text-[#E8202A] transition-colors w-fit"
                style={{ fontFamily: '"DM Mono", monospace' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                Access Drive
              </a>
            </div>
          ))}
          
          {filteredEvents.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-12 text-white/40" style={{ fontFamily: '"DM Mono", monospace' }}>
              No events found matching "{searchTerm}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
