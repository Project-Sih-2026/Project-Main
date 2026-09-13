export interface Hospital {
  id: string;
  name: string;
  type: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  emergencyPhone: string;
  totalBeds: number;
  hasTraumaCenter: boolean;
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'HOSP-ED-01',
    name: 'Guru Teg Bahadur (GTB) Hospital & UCMS',
    type: 'Government Teaching Hospital',
    district: 'Shahdara / Dilshad Garden',
    address: 'Taharpur Road, Dilshad Garden, Delhi - 110095',
    lat: 28.6835,
    lng: 77.3115,
    emergencyPhone: '+91-11-22586262',
    totalBeds: 1500,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-02',
    name: 'Max Super Speciality Hospital, Patparganj',
    type: 'Private Super Speciality',
    district: 'Patparganj',
    address: '108A, IP Extension, Patparganj, Delhi - 110092',
    lat: 28.6292,
    lng: 77.3094,
    emergencyPhone: '+91-11-43033333',
    totalBeds: 400,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-03',
    name: 'Lal Bahadur Shastri Hospital (LBS Hospital)',
    type: 'Government District Hospital',
    district: 'Mayur Vihar',
    address: 'Khichripur, Mayur Vihar Phase-II, Delhi - 110091',
    lat: 28.6186,
    lng: 77.3108,
    emergencyPhone: '+91-11-22774145',
    totalBeds: 350,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-04',
    name: 'Dr. Hedgewar Arogya Sansthan',
    type: 'Government Multi Speciality',
    district: 'Karkardooma',
    address: 'CBD Grounds, Karkardooma, Delhi - 110032',
    lat: 28.6536,
    lng: 77.3005,
    emergencyPhone: '+91-11-22308000',
    totalBeds: 300,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-05',
    name: 'Rajiv Gandhi Super Speciality Hospital',
    type: 'Government Autonomous Institute',
    district: 'Dilshad Garden',
    address: 'Tahirpur, Dilshad Garden, Delhi - 110093',
    lat: 28.6868,
    lng: 77.3175,
    emergencyPhone: '+91-11-22890000',
    totalBeds: 650,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-06',
    name: 'Chacha Nehru Bal Chikitsalaya',
    type: 'Government Pediatric Hospital',
    district: 'Geeta Colony',
    address: 'Geeta Colony, East Delhi - 110031',
    lat: 28.6508,
    lng: 77.2718,
    emergencyPhone: '+91-11-22044811',
    totalBeds: 220,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-07',
    name: 'Institute of Human Behaviour & Allied Sciences (IHBAS)',
    type: 'Government Neuro-Psychiatric',
    district: 'Dilshad Garden',
    address: 'GT Road, Dilshad Garden, Delhi - 110095',
    lat: 28.6795,
    lng: 77.3160,
    emergencyPhone: '+91-11-22597777',
    totalBeds: 500,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-08',
    name: 'Swami Dayanand Hospital (SDNH)',
    type: 'Municipal Multi Speciality',
    district: 'Shahdara',
    address: 'Dilshad Garden Road, Shahdara, Delhi - 110095',
    lat: 28.6775,
    lng: 77.3060,
    emergencyPhone: '+91-11-22588383',
    totalBeds: 370,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-09',
    name: 'Dharamshila Narayana Superspeciality Hospital',
    type: 'Private Oncology & Multi Speciality',
    district: 'Vasundhara Enclave',
    address: 'Vasundhara Enclave, Near New Ashok Nagar Metro, Delhi - 110096',
    lat: 28.6015,
    lng: 77.3245,
    emergencyPhone: '+91-11-43066666',
    totalBeds: 350,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-10',
    name: 'Kailash Deepak Memorial Hospital',
    type: 'Private Super Speciality',
    district: 'Karkardooma',
    address: 'Institutional Area, Vikas Marg Ext II, Delhi - 110092',
    lat: 28.6475,
    lng: 77.2990,
    emergencyPhone: '+91-11-22144444',
    totalBeds: 200,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-11',
    name: 'Metro Multispeciality Hospital',
    type: 'Private Multi Speciality',
    district: 'Preet Vihar',
    address: '21 Community Centre, Preet Vihar, Delhi - 110092',
    lat: 28.6420,
    lng: 77.2940,
    emergencyPhone: '+91-11-42421000',
    totalBeds: 150,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-12',
    name: 'Shanti Mukand Hospital',
    type: 'Charitable Trust Multi Speciality',
    district: 'Karkardooma',
    address: '2 Institutional Area, Vikas Marg Ext, Delhi - 110092',
    lat: 28.6480,
    lng: 77.3030,
    emergencyPhone: '+91-11-47276600',
    totalBeds: 200,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-13',
    name: 'Goyal Hospital & Urology Centre',
    type: 'Private Speciality Hospital',
    district: 'Krishna Nagar',
    address: 'E-4/8, Krishna Nagar, Delhi - 110051',
    lat: 28.6558,
    lng: 77.2785,
    emergencyPhone: '+91-11-22093333',
    totalBeds: 80,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-14',
    name: 'Makkar Multispeciality Hospital',
    type: 'Private Multi Speciality',
    district: 'Laxmi Nagar',
    address: 'A-1 Priyadarshini Vihar, Vikas Marg, Delhi - 110092',
    lat: 28.6360,
    lng: 77.2845,
    emergencyPhone: '+91-11-22521111',
    totalBeds: 100,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-15',
    name: 'Suraksha Multi Speciality Hospital',
    type: 'Private Multi Speciality',
    district: 'Vivek Vihar',
    address: '1/1 Surya Nagar Border, Vivek Vihar, Delhi - 110095',
    lat: 28.6655,
    lng: 77.3150,
    emergencyPhone: '+91-11-22158888',
    totalBeds: 100,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-16',
    name: 'Jeevan Anmol Hospital',
    type: 'Private Multi Speciality',
    district: 'Mayur Vihar',
    address: 'Pocket-1, Mayur Vihar Phase-I, Delhi - 110091',
    lat: 28.6030,
    lng: 77.2955,
    emergencyPhone: '+91-11-47355555',
    totalBeds: 100,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-17',
    name: 'East Delhi Medical Centre',
    type: 'Private Multi Speciality',
    district: 'Shahdara',
    address: '1/550 Mansarovar Park, GT Road, Shahdara, Delhi - 110032',
    lat: 28.6750,
    lng: 77.2980,
    emergencyPhone: '+91-11-22119999',
    totalBeds: 120,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-18',
    name: 'Jag Pravesh Chandra Hospital',
    type: 'Government Multi Speciality',
    district: 'Shastri Park',
    address: 'Pushta Road, Shastri Park, Delhi - 110053',
    lat: 28.6710,
    lng: 77.2585,
    emergencyPhone: '+91-11-22184453',
    totalBeds: 200,
    hasTraumaCenter: true,
  },
  {
    id: 'HOSP-ED-19',
    name: 'Dr. B.R. Sur Medical Institution & Hospital',
    type: 'Government Homeopathic & General Hospital',
    district: 'Laxmi Nagar',
    address: 'Nanak Chand Block, Shakarpur / Laxmi Nagar, Delhi - 110092',
    lat: 28.6320,
    lng: 77.2790,
    emergencyPhone: '+91-11-22441234',
    totalBeds: 90,
    hasTraumaCenter: false,
  },
  {
    id: 'HOSP-ED-20',
    name: 'Ghazipur Community Health Center',
    type: 'Government Community Health Center',
    district: 'Ghazipur',
    address: 'Main Ghazipur Dairy Farm Road, Ghazipur, Delhi - 110096',
    lat: 28.6225,
    lng: 77.3315,
    emergencyPhone: '+91-11-22789012',
    totalBeds: 80,
    hasTraumaCenter: true,
  },
];

export interface NearestHospitalResult {
  hospital: Hospital;
  distanceMeters: number;
  etaMinutes: number;
}

/**
 * Finds the closest hospital to a given geographic coordinate.
 * Prioritizes hospitals with full 24/7 Trauma Centers.
 */
export function findNearestHospital(
  lat: number,
  lng: number,
  preferTraumaCenter: boolean = true
): NearestHospitalResult {
  const pool = preferTraumaCenter
    ? HOSPITALS.filter((h) => h.hasTraumaCenter)
    : HOSPITALS;
  const targetPool = pool.length > 0 ? pool : HOSPITALS;

  let best = targetPool[0];
  let minDistance = Infinity;

  for (const h of targetPool) {
    const dLat = (h.lat - lat) * 111000;
    const dLng = (h.lng - lng) * 111000 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.hypot(dLat, dLng);
    if (dist < minDistance) {
      minDistance = dist;
      best = h;
    }
  }

  // Calculate realistic emergency transit ETA with green signal preemption (avg speed 46 km/h)
  const etaMinutes = Math.max(1, Math.round((minDistance / 1000 / 46) * 60));

  return {
    hospital: best,
    distanceMeters: Math.round(minDistance),
    etaMinutes,
  };
}
