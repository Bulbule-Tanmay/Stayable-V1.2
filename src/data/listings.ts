export type Tier = { label: string; price: number };
export type Amenity = { icon: string; label: string };

export type Listing = {
  id: string;
  name: string;
  type: "pg" | "flat";
  gender: "boys" | "girls" | "coed" | "unisex";
  genderLabel: string;
  distance: string;
  walkTime: string;
  priceFrom: number;
  priceSuffix: string;
  tiers: Tier[];
  amenities: Amenity[];
  badge: string;
  badgeColor: string;
  rating: number;
  reviewCount: number;
  instant: boolean;
  deposit: string;
  images: string[];
  phone: string;
  waMessage: string;
  address: string;
  pinX: number;
  pinY: number;
  highlights: string[];
};

export const listings: Listing[] = [
  {
    id: "sunrise-pg",
    name: "Sunrise Premium Student PG",
    type: "pg",
    gender: "coed",
    genderLabel: "Boys & Co-ed Wings",
    distance: "450m from GH Raisoni Pune",
    walkTime: "6 min walk",
    priceFrom: 7500,
    priceSuffix: "/month",
    tiers: [
      { label: "Triple", price: 7500 },
      { label: "Double", price: 9200 },
      { label: "Single", price: 13500 },
    ],
    amenities: [
      { icon: "restaurant", label: "Food 3x Included" },
      { icon: "wifi", label: "High-Speed Wi-Fi" },
      { icon: "ac_unit", label: "AC Available" },
      { icon: "cleaning_services", label: "Daily Maid" },
      { icon: "local_laundry_service", label: "Laundry" },
      { icon: "videocam", label: "CCTV Security" },
    ],
    badge: "Instant Confirmation",
    badgeColor: "text-green-600",
    rating: 4.8,
    reviewCount: 124,
    instant: true,
    deposit: "₹10,000 Refundable Deposit",
    images: [
      "https://images.unsplash.com/photo-1702295297205-700e205030d0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1628827365572-59aed2ca044c?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1555930112-0159bcdc3fe5?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1629737273704-5c96a46f63e6?w=800&h=500&fit=crop",
    ],
    phone: "+919876543210",
    waMessage: "Hi%2C%20I%20saw%20Sunrise%20Premium%20Student%20PG%20on%20Stayable%20for%20GH%20Raisoni%20Pune",
    address: "Near Ideal Colony, Paud Road, Kothrud",
    pinX: 32,
    pinY: 65,
    highlights: ["Warden on-site", "RO Water", "Power Backup", "Parking Available"],
  },
  {
    id: "greenfield-girls",
    name: "Greenfield Luxury PG for Girls",
    type: "pg",
    gender: "girls",
    genderLabel: "Girls Only PG",
    distance: "850m from GH Raisoni Pune",
    walkTime: "10 min walk",
    priceFrom: 8800,
    priceSuffix: "/mo onwards",
    tiers: [
      { label: "Double", price: 8800 },
      { label: "Single", price: 12000 },
    ],
    amenities: [
      { icon: "videocam", label: "CCTV & Biometric" },
      { icon: "soup_kitchen", label: "Homemade Meals" },
      { icon: "mop", label: "Daily Housekeeping" },
      { icon: "wifi", label: "Fibre Wi-Fi" },
      { icon: "local_pharmacy", label: "In-house Nurse" },
    ],
    badge: "Girls Exclusive",
    badgeColor: "text-pink-700",
    rating: 4.9,
    reviewCount: 86,
    instant: false,
    deposit: "Includes 3 Meals & High-Speed Net",
    images: [
      "https://images.unsplash.com/photo-1628827365572-59aed2ca044c?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1702295297205-700e205030d0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1785402231092-859d0a6c4397?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1627460751404-bb10f9c23dcf?w=800&h=500&fit=crop",
    ],
    phone: "+919876543211",
    waMessage: "Hi%2C%20inquiring%20about%20Greenfield%20Girls%20PG%20near%20GH%20Raisoni%20Pune",
    address: "Rambaug Colony, Kothrud, Pune",
    pinX: 66,
    pinY: 27,
    highlights: ["24/7 Female Warden", "Gated Community", "North & South Food", "Study Room"],
  },
  {
    id: "colive-ivy",
    name: "CoLive Ivy Residences",
    type: "pg",
    gender: "unisex",
    genderLabel: "Co-Living / Unisex",
    distance: "1.1 km from GH Raisoni Pune",
    walkTime: "14 min walk • 4 min bike",
    priceFrom: 10500,
    priceSuffix: "/mo",
    tiers: [
      { label: "Shared", price: 10500 },
      { label: "Private", price: 15000 },
    ],
    amenities: [
      { icon: "fitness_center", label: "Gym + Gaming Lounge" },
      { icon: "local_laundry_service", label: "Bi-Weekly Laundry" },
      { icon: "battery_charging_full", label: "100% Power Backup" },
      { icon: "sports_esports", label: "Gaming Zone" },
      { icon: "directions_bike", label: "Bike Parking" },
    ],
    badge: "Managed by CoLive",
    badgeColor: "text-blue-600",
    rating: 4.7,
    reviewCount: 210,
    instant: true,
    deposit: "Free Bi-Weekly Laundry",
    images: [
      "https://images.unsplash.com/photo-1629737273704-5c96a46f63e6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1785402231092-859d0a6c4397?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1702295297205-700e205030d0?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1628827365572-59aed2ca044c?w=800&h=500&fit=crop",
    ],
    phone: "+919876543212",
    waMessage: "Hi%2C%20inquiring%20about%20CoLive%20Ivy%20GH%20Raisoni%20Pune",
    address: "Paud Road Extension, Kothrud",
    pinX: 77,
    pinY: 56,
    highlights: ["Rooftop Terrace", "Community Events", "Netflix Lounge", "Smart Door Locks"],
  },
  {
    id: "shanti-pg",
    name: "Shanti Boys PG",
    type: "pg",
    gender: "boys",
    genderLabel: "Boys Only",
    distance: "300m from GH Raisoni Pune",
    walkTime: "4 min walk",
    priceFrom: 6200,
    priceSuffix: "/mo",
    tiers: [
      { label: "Triple", price: 6200 },
      { label: "Double", price: 7800 },
    ],
    amenities: [
      { icon: "restaurant", label: "Homestyle Food" },
      { icon: "wifi", label: "Wi-Fi Included" },
      { icon: "local_parking", label: "Bike Parking" },
      { icon: "water_drop", label: "RO Drinking Water" },
    ],
    badge: "Budget Friendly",
    badgeColor: "text-emerald-600",
    rating: 4.3,
    reviewCount: 58,
    instant: false,
    deposit: "₹6,000 Deposit",
    images: [
      "https://images.unsplash.com/photo-1555930112-0159bcdc3fe5?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1702295297205-700e205030d0?w=800&h=500&fit=crop",
    ],
    phone: "+919876543213",
    waMessage: "Hi%2C%20inquiring%20about%20Shanti%20Boys%20PG%20near%20GH%20Raisoni%20Pune",
    address: "Vitthal Nagar, Kothrud, Pune",
    pinX: 16,
    pinY: 40,
    highlights: ["Nearest to Campus", "Strict Curfew Policy", "Monthly Rent", "Mess Optional"],
  },
  {
    id: "paud-road-2bhk",
    name: "Cozy 2 BHK at Paud Road",
    type: "flat",
    gender: "coed",
    genderLabel: "For Groups / Families",
    distance: "1.2 km from GH Raisoni Pune",
    walkTime: "15 min walk • 5 min auto",
    priceFrom: 22000,
    priceSuffix: "/mo",
    tiers: [
      { label: "Whole Flat", price: 22000 },
      { label: "Per Person (4)", price: 5500 },
    ],
    amenities: [
      { icon: "kitchen", label: "Modular Kitchen" },
      { icon: "balcony", label: "Balcony View" },
      { icon: "ac_unit", label: "AC in Bedrooms" },
      { icon: "local_parking", label: "Covered Parking" },
      { icon: "wifi", label: "Fibre Broadband" },
    ],
    badge: "2 BHK Furnished",
    badgeColor: "text-purple-600",
    rating: 4.6,
    reviewCount: 32,
    instant: false,
    deposit: "₹44,000 Deposit (2 months)",
    images: [
      "https://images.unsplash.com/photo-1785402231092-859d0a6c4397?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1629737273704-5c96a46f63e6?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1627460751404-bb10f9c23dcf?w=800&h=500&fit=crop",
    ],
    phone: "+919876543214",
    waMessage: "Hi%2C%20inquiring%20about%20Paud%20Road%202BHK%20near%20GH%20Raisoni%20Pune",
    address: "Paud Road, Near Chandani Chowk, Pune",
    pinX: 61,
    pinY: 79,
    highlights: ["Fully Furnished", "Society Amenities", "Water 24x7", "No Brokerage"],
  },
  {
    id: "karve-nagar-3bhk",
    name: "Spacious 3 BHK — Karve Nagar",
    type: "flat",
    gender: "coed",
    genderLabel: "For Groups",
    distance: "1.8 km from GH Raisoni Pune",
    walkTime: "22 min walk • 7 min auto",
    priceFrom: 28000,
    priceSuffix: "/mo",
    tiers: [
      { label: "Whole Flat", price: 28000 },
      { label: "Per Person (6)", price: 4700 },
    ],
    amenities: [
      { icon: "pool", label: "Society Pool" },
      { icon: "fitness_center", label: "Gym Access" },
      { icon: "kitchen", label: "Semi-furnished Kitchen" },
      { icon: "security", label: "24/7 Security Guard" },
    ],
    badge: "3 BHK Semi-Furnished",
    badgeColor: "text-orange-600",
    rating: 4.4,
    reviewCount: 19,
    instant: false,
    deposit: "₹56,000 Deposit",
    images: [
      "https://images.unsplash.com/photo-1627460751404-bb10f9c23dcf?w=800&h=500&fit=crop",
      "https://images.unsplash.com/photo-1785402231092-859d0a6c4397?w=800&h=500&fit=crop",
    ],
    phone: "+919876543215",
    waMessage: "Hi%2C%20inquiring%20about%20Karve%20Nagar%203BHK%20near%20GH%20Raisoni%20Pune",
    address: "Karve Nagar, Pune 411052",
    pinX: 84,
    pinY: 42,
    highlights: ["Premium Society", "Pets Allowed", "Video Doorbell", "EV Charging"],
  },
];
