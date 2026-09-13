export interface CongestionNode {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  congestionIndex: number; // 0 - 100
  severity: 'critical' | 'heavy' | 'moderate' | 'fluid';
  volumeVehPerHour: number;
  avgSpeedKmh: number;
  delayMins: number;
  radiusMeters: number;
  coreRadiusMeters: number;
  bottleneckReason: string;
  recommendedDetour: string;
  corridorLinks: string[];
}

export interface CongestedArtery {
  id: string;
  name: string;
  severity: 'critical' | 'heavy' | 'moderate';
  congestionIndex: number;
  points: [number, number][];
  avgSpeedKmh: number;
  delayMins: number;
  statusLabel: string;
}

export const CONGESTION_NODES: CongestionNode[] = [
  {
    id: 'cg-anand-vihar',
    name: 'Anand Vihar ISBT & Terminal Border Gate',
    district: 'Anand Vihar / UP Border',
    lat: 28.6465,
    lng: 77.3155,
    congestionIndex: 91,
    severity: 'critical',
    volumeVehPerHour: 3120,
    avgSpeedKmh: 10,
    delayMins: 22,
    radiusMeters: 850,
    coreRadiusMeters: 280,
    bottleneckReason: 'Interstate bus terminal arrivals & interstate commercial toll check queues',
    recommendedDetour: 'Reroute via Surya Nagar Underpass & Master Plan Road towards Preet Vihar',
    corridorLinks: ['Vikas Marg Arterial', 'Kaushambi Link Road', 'NH-24 Bypass'],
  },
  {
    id: 'cg-laxmi-nagar',
    name: 'Laxmi Nagar Metro & Shakarpur Hub',
    district: 'Laxmi Nagar',
    lat: 28.6305,
    lng: 77.2770,
    congestionIndex: 88,
    severity: 'critical',
    volumeVehPerHour: 2850,
    avgSpeedKmh: 12,
    delayMins: 16,
    radiusMeters: 800,
    coreRadiusMeters: 250,
    bottleneckReason: 'Vikas Marg arterial merge, commercial retail loading & dense metro pedestrian drop-offs',
    recommendedDetour: 'Bypass west via Shakarpur Marginal Bandh or Geeta Colony Bridge Ramp',
    corridorLinks: ['Vikas Marg Arterial', 'Shakarpur Main Road', 'ITO Chungi Corridor'],
  },
  {
    id: 'cg-akshardham',
    name: 'Akshardham Flyover & NH-24 Merge',
    district: 'Akshardham',
    lat: 28.6180,
    lng: 77.2790,
    congestionIndex: 84,
    severity: 'critical',
    volumeVehPerHour: 2720,
    avgSpeedKmh: 18,
    delayMins: 14,
    radiusMeters: 750,
    coreRadiusMeters: 240,
    bottleneckReason: 'Delhi-Meerut Expressway high-speed merging weave into local service lanes',
    recommendedDetour: 'Divert eastbound traffic through Noida Link Road via Mayur Vihar Phase-1',
    corridorLinks: ['NH-24 Expressway', 'Noida Link Road', 'Kalyanvas Arterial'],
  },
  {
    id: 'cg-ghazipur',
    name: 'Ghazipur Border & Flower Market Corridor',
    district: 'Ghazipur',
    lat: 28.6240,
    lng: 77.3340,
    congestionIndex: 78,
    severity: 'heavy',
    volumeVehPerHour: 2140,
    avgSpeedKmh: 20,
    delayMins: 11,
    radiusMeters: 700,
    coreRadiusMeters: 220,
    bottleneckReason: 'Heavy freight truck weigh-in queues & morning wholesale market convergence',
    recommendedDetour: 'Use Kondli Canal Road or Mayur Vihar Phase-3 bypass',
    corridorLinks: ['NH-24 Delhi-UP Arterial', 'Kondli Canal Road'],
  },
  {
    id: 'cg-gandhi-nagar',
    name: 'Gandhi Nagar Textile Market & Pushta Link',
    district: 'Gandhi Nagar',
    lat: 28.6615,
    lng: 77.2655,
    congestionIndex: 74,
    severity: 'heavy',
    volumeVehPerHour: 1960,
    avgSpeedKmh: 16,
    delayMins: 9,
    radiusMeters: 650,
    coreRadiusMeters: 200,
    bottleneckReason: 'Wholesale textile freight logistics, narrow curb loading & e-rickshaw clusters',
    recommendedDetour: 'Use Shastri Park Pushta Highway for through-traffic towards Kashmiri Gate',
    corridorLinks: ['Pushta Road Arterial', 'Shastri Park Link'],
  },
  {
    id: 'cg-seelampur',
    name: 'Seelampur Metro & Welcome Interchange',
    district: 'Seelampur',
    lat: 28.6685,
    lng: 77.2720,
    congestionIndex: 72,
    severity: 'heavy',
    volumeVehPerHour: 1940,
    avgSpeedKmh: 19,
    delayMins: 8,
    radiusMeters: 620,
    coreRadiusMeters: 190,
    bottleneckReason: 'Metro line feeder convergence & Grand Trunk Road bottle junction',
    recommendedDetour: 'Divert south through Geeta Colony Riverfront link',
    corridorLinks: ['Grand Trunk Road', 'Welcome Flyover Ramp'],
  },
  {
    id: 'cg-apsara',
    name: 'Apsara Border & GT Road Checkpoint',
    district: 'Shahdara',
    lat: 28.6790,
    lng: 77.3275,
    congestionIndex: 69,
    severity: 'heavy',
    volumeVehPerHour: 1890,
    avgSpeedKmh: 21,
    delayMins: 8,
    radiusMeters: 600,
    coreRadiusMeters: 180,
    bottleneckReason: 'Interstate commercial border checks & road widening construction segment',
    recommendedDetour: 'Divert through Dilshad Garden GT Road underpass',
    corridorLinks: ['GT Road Interstate Artery'],
  },
  {
    id: 'cg-shahdara',
    name: 'Shahdara Flyover & Railway Station Crossing',
    district: 'Shahdara',
    lat: 28.6725,
    lng: 77.2915,
    congestionIndex: 68,
    severity: 'heavy',
    volumeVehPerHour: 1740,
    avgSpeedKmh: 22,
    delayMins: 7,
    radiusMeters: 580,
    coreRadiusMeters: 170,
    bottleneckReason: 'Station drop-off bottlenecks & flyover descent merge with local market lanes',
    recommendedDetour: 'Take Vivek Vihar Northern Arterial towards Surya Nagar',
    corridorLinks: ['Old Rohtak Road', 'GT Road Flyover'],
  },
  {
    id: 'cg-preet-vihar',
    name: 'Preet Vihar Vikas Marg Junction',
    district: 'Preet Vihar',
    lat: 28.6415,
    lng: 77.2950,
    congestionIndex: 65,
    severity: 'moderate',
    volumeVehPerHour: 1820,
    avgSpeedKmh: 24,
    delayMins: 6,
    radiusMeters: 550,
    coreRadiusMeters: 160,
    bottleneckReason: 'Signal timing transition & metro station commercial traffic',
    recommendedDetour: 'Use Institutional Area Road via Karkardooma Court',
    corridorLinks: ['Vikas Marg', 'Patparganj Road'],
  },
  {
    id: 'cg-karkardooma',
    name: 'Karkardooma Court & CBD Ground Junction',
    district: 'Karkardooma',
    lat: 28.6485,
    lng: 77.3045,
    congestionIndex: 54,
    severity: 'moderate',
    volumeVehPerHour: 1320,
    avgSpeedKmh: 28,
    delayMins: 4,
    radiusMeters: 500,
    coreRadiusMeters: 150,
    bottleneckReason: 'Judicial complex peak visitor hours & institutional bus parking',
    recommendedDetour: 'Flow is steady; follow Master Plan Road North',
    corridorLinks: ['Master Plan Road', 'Surajmal Vihar Link'],
  },
  {
    id: 'cg-mayur-vihar',
    name: 'Mayur Vihar Phase-1 Pocket-1 Chowk',
    district: 'Mayur Vihar',
    lat: 28.6045,
    lng: 77.2915,
    congestionIndex: 48,
    severity: 'fluid',
    volumeVehPerHour: 1180,
    avgSpeedKmh: 34,
    delayMins: 2,
    radiusMeters: 450,
    coreRadiusMeters: 130,
    bottleneckReason: 'Residential morning peak disperse; steady flow baseline',
    recommendedDetour: 'Normal transit corridor active',
    corridorLinks: ['Noida Link Road', 'Trilokpuri Link'],
  },
  {
    id: 'cg-dilshad-garden',
    name: 'Dilshad Garden Metro & GTB Hospital Chowk',
    district: 'Dilshad Garden',
    lat: 28.6815,
    lng: 77.3120,
    congestionIndex: 58,
    severity: 'moderate',
    volumeVehPerHour: 1410,
    avgSpeedKmh: 26,
    delayMins: 4,
    radiusMeters: 520,
    coreRadiusMeters: 150,
    bottleneckReason: 'Hospital emergency corridor and metro feeder drop-off interchange',
    recommendedDetour: 'Emergency ambulances prioritize Tahirpur Road green corridor',
    corridorLinks: ['Tahirpur Road', 'GTB Enclave Chowk'],
  },
];

export const CONGESTED_ARTERIES: CongestedArtery[] = [
  {
    id: 'art-vikas-marg',
    name: 'Vikas Marg Arterial Corridor (Laxmi Nagar ➔ Preet Vihar ➔ Karkardooma)',
    severity: 'critical',
    congestionIndex: 88,
    points: [
      [28.6305, 77.2770],
      [28.6360, 77.2860],
      [28.6415, 77.2950],
      [28.6485, 77.3045],
    ],
    avgSpeedKmh: 14,
    delayMins: 16,
    statusLabel: 'CRITICAL GRIDLOCK (88%)',
  },
  {
    id: 'art-nh24-expressway',
    name: 'Delhi-Meerut Expressway & NH-24 Merge Corridor',
    severity: 'critical',
    congestionIndex: 84,
    points: [
      [28.6180, 77.2790],
      [28.6160, 77.3080],
      [28.6240, 77.3340],
    ],
    avgSpeedKmh: 18,
    delayMins: 14,
    statusLabel: 'EXPRESSWAY WEAVE DELAY (84%)',
  },
  {
    id: 'art-anand-ghazipur',
    name: 'Anand Vihar ➔ Ghazipur Border Arterial',
    severity: 'critical',
    congestionIndex: 91,
    points: [
      [28.6465, 77.3155],
      [28.6350, 77.3240],
      [28.6240, 77.3340],
    ],
    avgSpeedKmh: 11,
    delayMins: 22,
    statusLabel: 'BORDER QUEUES (91%)',
  },
  {
    id: 'art-pushta-road',
    name: 'Gandhi Nagar ➔ Shastri Park Pushta Highway',
    severity: 'heavy',
    congestionIndex: 74,
    points: [
      [28.6495, 77.2675],
      [28.6615, 77.2655],
      [28.6690, 77.2560],
    ],
    avgSpeedKmh: 17,
    delayMins: 9,
    statusLabel: 'HEAVY CORRIDOR FLOW (74%)',
  },
  {
    id: 'art-gt-road',
    name: 'Grand Trunk (GT) Road / Shahdara Flyover Corridor',
    severity: 'heavy',
    congestionIndex: 72,
    points: [
      [28.6685, 77.2720],
      [28.6725, 77.2915],
      [28.6790, 77.3275],
    ],
    avgSpeedKmh: 20,
    delayMins: 8,
    statusLabel: 'INTERSTATE FREIGHT QUEUE (72%)',
  },
  {
    id: 'art-patparganj-arterial',
    name: 'Patparganj IP Extension Arterial (Hospital Route)',
    severity: 'moderate',
    congestionIndex: 62,
    points: [
      [28.6415, 77.2950],
      [28.6295, 77.3090],
      [28.6292, 77.3094],
    ],
    avgSpeedKmh: 26,
    delayMins: 5,
    statusLabel: 'MODERATE TRANSIT (62%)',
  },
];

export function getCongestionColor(index: number): {
  core: string;
  glow: string;
  border: string;
  badge: string;
  text: string;
} {
  if (index >= 85) {
    return {
      core: '#9333EA', // Purple/Violet gridlock
      glow: '#EF4444', // Crimson Red
      border: '#DC2626',
      badge: 'bg-red-500 text-white',
      text: 'text-red-400',
    };
  }
  if (index >= 70) {
    return {
      core: '#EF4444', // Crimson Red
      glow: '#F97316', // Orange
      border: '#EA580C',
      badge: 'bg-orange-500 text-white',
      text: 'text-orange-400',
    };
  }
  if (index >= 50) {
    return {
      core: '#F97316', // Orange
      glow: '#EAB308', // Amber/Yellow
      border: '#CA8A04',
      badge: 'bg-amber-500 text-white',
      text: 'text-amber-400',
    };
  }
  return {
    core: '#10B981', // Emerald
    glow: '#06B6D4', // Cyan
    border: '#059669',
    badge: 'bg-emerald-500 text-white',
    text: 'text-emerald-400',
  };
}
