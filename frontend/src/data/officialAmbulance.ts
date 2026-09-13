import type { Vehicle, JourneyEvent } from './mock';
import type { Hospital } from './hospitals';

export interface OfficialAmbulanceJourneyEvent extends JourneyEvent {
  evidenceImage?: string;
  plateCrop?: string;
}

export interface OfficialAmbulance extends Vehicle {
  journey: OfficialAmbulanceJourneyEvent[];
  destinationHospital: Hospital;
  etaMinutes: number;
  distanceMeters: number;
  patientCondition: string;
  driverName: string;
  evidenceImage: string;
  plateCrop: string;
  detectionConfidence: number;
}

export const OFFICIAL_AMBULANCE_HOSPITAL: Hospital = {
  id: 'HOSP-ED-02',
  name: 'Max Super Speciality Hospital, Patparganj',
  type: 'Private Super Speciality Hospital',
  district: 'Patparganj',
  address: '108A, IP Extension, Patparganj, Delhi - 110092',
  lat: 28.6292,
  lng: 77.3094,
  emergencyPhone: '+91-11-43033333',
  totalBeds: 400,
  hasTraumaCenter: true,
};

/**
 * Permanent, official saved ambulance record (DL-01-AMB-9911).
 * Originates from the user's verified CCTV detection upload and traces the real-world
 * emergency green corridor to Max Super Speciality Hospital, Patparganj.
 */
export const OFFICIAL_SAVED_AMBULANCE: OfficialAmbulance = {
  id: 'det-seed-dl01amb9911-3',
  plate: 'DL-01-AMB-9911',
  make: 'Tata Motors',
  model: 'Winger Advance Life Support ICU Ambulance',
  color: 'Emergency White/Red',
  type: 'Ambulance',
  owner: 'Delhi Emergency Medical Services (CATS Division - Unit 4)',
  driverName: 'Rajesh Kumar (CATS Pilot Unit 4)',
  license: 'DL-REG-AMB-9911',
  status: 'flagged',
  flaggedReason: 'Priority Emergency Green Corridor: Code Red Critical Transit to Hospital',
  patientCondition: 'Acute Cardiac Emergency (Golden Hour Protocol)',
  detectionConfidence: 0.984,
  speed: 58,
  lastCam: 'CAM-KN-08',
  lastSeen: 'just now',
  kmToday: 38,
  evidenceImage: '/static/evidence/frame_CAM-KN-08_ac25fcfada60_0.jpg',
  plateCrop: '/static/evidence/plate_CAM-KN-08_ac25fcfada60_0.jpg',
  tags: ['live-database', 'yolov8-anpr', 'ambulance-corridor', 'uploaded-evidence', 'saved-route'],
  journey: [
    {
      t: '08:41',
      cam: 'CAM-KN-03',
      loc: 'Laxmi Nagar Metro & Shakarpur Hub',
      speed: 52,
      dir: 'Westbound',
      evidenceImage: '/static/evidence/frame_CAM-KN-03_2f2eab9db28d_0.jpg',
      plateCrop: '/static/evidence/plate_CAM-KN-03_2f2eab9db28d_0.jpg',
      note: 'AI CCTV Upload: Conf 98% · Emergency Beacon Active',
    },
    {
      t: '08:49',
      cam: 'CAM-KN-02',
      loc: 'Preet Vihar Vikas Marg Junction',
      speed: 56,
      dir: 'Eastbound',
      evidenceImage: '/static/evidence/frame_CAM-KN-02_d4f97abe3fa8_0.jpg',
      plateCrop: '/static/evidence/plate_CAM-KN-02_d4f97abe3fa8_0.jpg',
      note: 'AI Correlated Checkpoint: Preet Vihar Signal Preempted (Green)',
    },
    {
      t: '08:58',
      cam: 'CAM-KN-08',
      loc: 'Patparganj Industrial Area / Max Hospital',
      speed: 48,
      dir: 'Northbound',
      evidenceImage: '/static/evidence/frame_CAM-KN-08_ac25fcfada60_0.jpg',
      plateCrop: '/static/evidence/plate_CAM-KN-08_ac25fcfada60_0.jpg',
      note: 'Terminal CCTV Sighting: Approaching Max Super Speciality Hospital Entrance',
    },
  ],
  road: 0,
  prog: 0.88,
  dir: 1,
  destinationHospital: OFFICIAL_AMBULANCE_HOSPITAL,
  etaMinutes: 3,
  distanceMeters: 1420,
};
