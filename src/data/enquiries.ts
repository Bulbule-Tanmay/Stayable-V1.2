export type Enquiry = {
  id: string;
  listingId: string;
  listingName: string;
  sentAt: string;
  status: "replied" | "pending" | "scheduled";
  lastMessage: string;
  phone: string;
  waMessage: string;
  image: string;
};

export const enquiries: Enquiry[] = [
  {
    id: "enq-1",
    listingId: "sunrise-pg",
    listingName: "Sunrise Premium Student PG",
    sentAt: "Today, 10:32 AM",
    status: "replied",
    lastMessage: "Yes, we have a double-sharing room available from Oct 1st. Please visit between 4–7 PM.",
    phone: "+919876543210",
    waMessage: "Hi%2C%20following%20up%20on%20Sunrise%20PG%20enquiry",
    image: "https://images.unsplash.com/photo-1702295297205-700e205030d0?w=120&h=80&fit=crop",
  },
  {
    id: "enq-2",
    listingId: "greenfield-girls",
    listingName: "Greenfield Luxury PG for Girls",
    sentAt: "Yesterday, 6:15 PM",
    status: "scheduled",
    lastMessage: "Your visit is confirmed for Saturday 14 Sep at 11 AM. We will send location pin.",
    phone: "+919876543211",
    waMessage: "Hi%2C%20following%20up%20on%20Greenfield%20PG%20visit",
    image: "https://images.unsplash.com/photo-1628827365572-59aed2ca044c?w=120&h=80&fit=crop",
  },
  {
    id: "enq-3",
    listingId: "paud-road-2bhk",
    listingName: "Cozy 2 BHK at Paud Road",
    sentAt: "2 days ago",
    status: "pending",
    lastMessage: "You enquired about this flat. Waiting for owner response.",
    phone: "+919876543214",
    waMessage: "Hi%2C%20following%20up%20on%20Paud%20Road%202BHK%20enquiry",
    image: "https://images.unsplash.com/photo-1785402231092-859d0a6c4397?w=120&h=80&fit=crop",
  },
];
