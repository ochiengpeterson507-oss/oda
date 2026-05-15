export const MOCK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Industrial Grade Grade 50 Steel Rebar',
    description: 'High-tensile steel reinforcement bars for large-scale infrastructure projects. Sourced from certified Nairobi steel mills.',
    category_id: 'c1',
    categories: { name: 'Construction' },
    images: ['https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'],
    price: 85000,
    unit: 'Ton',
    companies: { name: 'Apex Steel Ltd', logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100' },
    active: true
  },
  {
    id: 'p2',
    name: 'Solar-Powered Irrigation Pump (5HP)',
    description: 'Efficient irrigation solution for large-scale agro-processing farms. Includes 5-year hub warranty.',
    category_id: 'c2',
    categories: { name: 'Agro-processing' },
    images: ['https://images.unsplash.com/photo-1542336391-ae2936d8efe4?auto=format&fit=crop&q=80&w=800'],
    price: 120000,
    unit: 'Unit',
    companies: { name: 'SunCulture Energy', logo_url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=100' },
    active: true
  },
  {
    id: 'p3',
    name: 'Medical Grade Oxygen Concentrator',
    description: 'Portable high-output oxygen concentrators for regional healthcare facilities. WHO certified.',
    category_id: 'c3',
    categories: { name: 'Healthcare' },
    images: ['https://images.unsplash.com/photo-1584032762282-ec474600d7bb?auto=format&fit=crop&q=80&w=800'],
    price: 65000,
    unit: 'Unit',
    companies: { name: 'Pwani Medical Supplies', logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100' },
    active: true
  },
  {
    id: 'p4',
    name: 'Bulk Refined Sunflower Oil (1000L)',
    description: 'Kitchen-ready refined sunflower oil for hospitality and industrial food service.',
    category_id: 'c2',
    categories: { name: 'Agro-processing' },
    images: ['https://images.unsplash.com/photo-1474974913001-50d400177ad4?auto=format&fit=crop&q=80&w=800'],
    price: 180000,
    unit: 'Drum',
    companies: { name: 'Bidco Africa', logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=100' },
    active: true
  },
  {
    id: 'p5',
    name: 'Pre-cast Concrete Drainage Pipes (600mm)',
    description: 'Durable pre-cast concrete solutions for urban drainage systems and highway construction.',
    category_id: 'c1',
    categories: { name: 'Construction' },
    images: ['https://images.unsplash.com/photo-1590001000175-90b4001262cc?auto=format&fit=crop&q=80&w=800'],
    price: 4500,
    unit: 'Piece',
    companies: { name: 'Bamburi Cement', logo_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=100' },
    active: true
  }
];

export const MOCK_CATEGORIES = [
  { id: 'c1', name: 'Construction' },
  { id: 'c2', name: 'Agro-processing' },
  { id: 'c3', name: 'Healthcare' },
  { id: 'c4', name: 'Tech Infrastructure' }
];
