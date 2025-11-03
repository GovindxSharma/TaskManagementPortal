export const clients = [
  {
    id: 1,
    name: "Aarav Enterprises",
    site: "Mumbai",
    assignedTo: "Riya Sharma",
    category: "21-50",
    dataStatus: {
      June: "Received",
      July: "In Progress",
      August: "Completed",
    },
    billStatus: {
      June: "Generated",
      July: "Generated",
      August: "Pending",
    },
    clientStatus: "Active",
    suspensionReason: {
      August: "Payment delayed, client suspended until clearance by accountant",
    },
    monthData: {
      June: { noOfWorkers: 25, expectedAmount: 50000, finalAmount: 48000 },
      July: { noOfWorkers: 28, expectedAmount: 52000, finalAmount: 51000 },
      August: { noOfWorkers: 30, expectedAmount: 55000, finalAmount: 0 }, // pending final amount
    },
  },
  {
    id: 2,
    name: "VisionTech",
    site: "Delhi",
    assignedTo: "Amit Verma",
    category: "51-150",
    dataStatus: {
      June: "Not Received",
      July: "Not Received",
      August: "Not Received",
    },
    billStatus: { June: "Overdue", July: "Overdue", August: "Overdue" },
    clientStatus: "Inactive",
    suspensionReason: {
      June: "Multiple overdue bills, temporarily suspended",
      July: "Multiple overdue bills, temporarily suspended",
      August: "Multiple overdue bills, temporarily suspended",
    },
    monthData: {
      June: { noOfWorkers: 60, expectedAmount: 120000, finalAmount: 0 },
      July: { noOfWorkers: 62, expectedAmount: 125000, finalAmount: 0 },
      August: { noOfWorkers: 65, expectedAmount: 130000, finalAmount: 0 },
    },
  },
  {
    id: 3,
    name: "BlueSky Corp",
    site: "Bengaluru",
    assignedTo: "Riya Sharma",
    category: "1-20",
    dataStatus: { June: "Received", July: "In Progress" },
    billStatus: { June: "Generated", July: "Generated" },
    clientStatus: "Active",
    monthData: {
      June: { noOfWorkers: 12, expectedAmount: 20000, finalAmount: 19000 },
      July: { noOfWorkers: 15, expectedAmount: 22000, finalAmount: 21500 },
    },
  },
  {
    id: 4,
    name: "TechNova",
    site: "Chennai",
    assignedTo: "Amit Verma",
    category: "21-50",
    dataStatus: { May: "Completed", June: "Completed", July: "In Progress" },
    billStatus: { May: "Generated", June: "Generated", July: "Pending" },
    clientStatus: "Active",
    monthData: {
      May: { noOfWorkers: 22, expectedAmount: 45000, finalAmount: 45000 },
      June: { noOfWorkers: 24, expectedAmount: 47000, finalAmount: 47000 },
      July: { noOfWorkers: 26, expectedAmount: 49000, finalAmount: 0 },
    },
  },
  {
    id: 5,
    name: "NextGen Solutions",
    site: "Hyderabad",
    assignedTo: "Riya Sharma",
    category: "1-20",
    dataStatus: { July: "Received", August: "Completed" },
    billStatus: { July: "Generated", August: "Generated" },
    clientStatus: "Active",
    monthData: {
      July: { noOfWorkers: 10, expectedAmount: 15000, finalAmount: 15000 },
      August: { noOfWorkers: 12, expectedAmount: 18000, finalAmount: 18000 },
    },
  },
];

export const passwords = [
  {
    id: 1,
    client: "Aarav Enterprises",
    category: "Email",
    username: "admin@aarav.com",
    password: "password123",
  },
  {
    id: 2,
    client: "VisionTech",
    category: "ERP",
    username: "vision_admin",
    password: "v!sion2025",
  },
  {
    id: 3,
    client: "BlueSky Corp",
    category: "Finance",
    username: "bluesky_fin",
    password: "bluesky@2025",
  },
];

export const licenses = [
  {
    id: 1,
    client: "Acme Corp",
    policies: [
      { name: "WC Policy", start: "2025-01-01", end: "2025-12-31" },
      { name: "LL Policy", start: "2025-03-01", end: "2025-09-30" },
      { name: "PO", start: "2025-02-15", end: "2025-08-15" },
    ],
  },
  {
    id: 2,
    client: "GreenLeaf Pvt Ltd",
    policies: [
      { name: "WC Policy", start: "2024-12-01", end: "2025-11-30" },
      { name: "BOCW", start: "2025-04-01", end: "2025-10-01" },
    ],
  },
  {
    id: 3,
    client: "ZenTax Advisors",
    policies: [
      { name: "LL Policy", start: "2025-05-01", end: "2025-12-31" },
      { name: "PO", start: "2025-06-01", end: "2025-11-30" },
      { name: "WC Policy", start: "2025-01-15", end: "2025-07-15" },
    ],
  },
  {
    id: 4,
    client: "BlueWave Solutions",
    policies: [
      { name: "WC Policy", start: "2025-02-01", end: "2025-08-31" },
      { name: "LL Policy", start: "2025-01-10", end: "2025-06-30" },
      { name: "PO", start: "2025-03-01", end: "2025-09-15" },
      { name: "BOCW", start: "2025-04-01", end: "2025-10-01" },
    ],
  },
  {
    id: 5,
    client: "NextGen Enterprises",
    policies: [
      { name: "WC Policy", start: "2025-01-01", end: "2025-12-31" },
      { name: "LL Policy", start: "2025-05-01", end: "2025-12-31" },
      { name: "PO", start: "2025-03-01", end: "2025-09-30" },
      { name: "BOCW", start: "2025-02-15", end: "2025-08-15" },
    ],
  },
  {
    id: 6,
    client: "GlobalTech Ltd",
    policies: [
      { name: "WC Policy", start: "2025-01-01", end: "2025-07-31" },
      { name: "LL Policy", start: "2025-04-01", end: "2025-10-31" },
      { name: "PO", start: "2025-06-01", end: "2025-12-31" },
    ],
  },
];


