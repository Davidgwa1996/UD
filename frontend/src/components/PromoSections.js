import React, { useRef } from 'react';
import { Link } from 'react-router-dom';

// Sample product data – replace with your actual products or categories
const rows = [
  {
    id: 'electronics',
    title: '⚡ Electronics Deals',
    items: [
      { id: 1, name: 'MacBook Pro 16"', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=150&fit=crop', desc: 'M3 Max, 36GB RAM', link: '/product/2' },
      { id: 2, name: 'iPhone 15 Pro', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&h=150&fit=crop', desc: 'Titanium, A17 Pro', link: '/product/3' },
      { id: 3, name: 'Sony A7RV', image: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=200&h=150&fit=crop', desc: '61MP, 8K video', link: '/product/14' },
      { id: 4, name: 'B&W Wedge', image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&h=150&fit=crop', desc: 'Wireless hi-fi', link: '/product/7' },
      { id: 5, name: 'DJI Air 3', image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=200&h=150&fit=crop', desc: 'Dual cameras', link: '/product/12' },
      { id: 6, name: 'PS5 Pro', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=150&fit=crop', desc: '4K/120fps', link: '/product/15' },
    ]
  },
  {
    id: 'classic-cars',
    title: '🚗 Classic & Electric Cars',
    items: [
      { id: 7, name: 'Tesla Model Y', image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=200&h=150&fit=crop', desc: 'Dual Motor, 303mi', link: '/product/1' },
      { id: 8, name: 'Range Rover Sport', image: 'https://images.unsplash.com/photo-1593941707882-a5bba5338fe2?w=200&h=150&fit=crop', desc: 'PHEV, 542hp', link: '/product/6' },
      { id: 9, name: 'Jaguar I-PACE', image: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=200&h=150&fit=crop', desc: '395hp, 234mi', link: '/product/9' },
      { id: 10, name: 'Xiaomi SU7', image: 'https://images.unsplash.com/photo-1617868186608-87ae5c6f422c?w=200&h=150&fit=crop', desc: '495kW, 800km', link: '/product/10' },
      { id: 11, name: 'Toyota Century', image: 'https://images.unsplash.com/photo-1555212697-194d092e3b8f?w=200&h=150&fit=crop', desc: 'V6 hybrid', link: '/product/13' },
    ]
  },
  {
    id: 'gaming',
    title: '🎮 Gaming & Accessories',
    items: [
      { id: 12, name: 'RTX 4090', image: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=200&h=150&fit=crop', desc: '24GB GDDR6X', link: '/product/4' },
      { id: 13, name: 'Alienware m18', image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200&h=150&fit=crop', desc: 'i9-14900HX, RTX 4090', link: '/product/8' },
      { id: 14, name: 'PS5 Pro', image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=200&h=150&fit=crop', desc: 'Disc Edition', link: '/product/15' },
    ]
  }
];

const PromoRow = ({ title, items }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300;
      if (direction === 'left') {
        current.scrollLeft -= scrollAmount;
      } else {
        current.scrollLeft += scrollAmount;
      }
    }
  };

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white px-4 mb-3">{title}</h2>
      <div className="relative group">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
          aria-label="Scroll left"
        >
          ◀
        </button>

        {/* Scrollable container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 px-4 pb-4 scroll-smooth scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800"
          style={{ scrollbarWidth: 'thin' }}
        >
          {items.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="flex-shrink-0 w-48 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-28 object-cover rounded-lg mb-2"
                onError={(e) => { e.target.src = 'https://placehold.co/200x150/1e293b/94a3b8?text=No+Image'; }}
              />
              <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
              <p className="text-xs text-slate-400 truncate">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
          aria-label="Scroll right"
        >
          ▶
        </button>
      </div>
    </div>
  );
};

const PromoSections = () => {
  return (
    <div className="py-6">
      {rows.map((row) => (
        <PromoRow key={row.id} title={row.title} items={row.items} />
      ))}
    </div>
  );
};

export default PromoSections;