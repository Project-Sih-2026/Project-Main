import { OFFICIAL_SAVED_AMBULANCE, type OfficialAmbulance } from './officialAmbulance';

export type RandomizedAmbulance = OfficialAmbulance & {
  nearestHospitalResult: {
    hospital: typeof OFFICIAL_SAVED_AMBULANCE.destinationHospital;
    distanceMeters: number;
    etaMinutes: number;
    isTraumaReady: boolean;
  };
  emergencyPriority: 'CRITICAL' | 'HIGH';
};

/**
 * Returns the permanent, saved official emergency ambulance (DL-01-AMB-9911)
 * with its fixed corridor to Max Super Speciality Hospital, Patparganj.
 */
export function generateRandomAmbulance(): RandomizedAmbulance {
  return {
    ...OFFICIAL_SAVED_AMBULANCE,
    nearestHospitalResult: {
      hospital: OFFICIAL_SAVED_AMBULANCE.destinationHospital,
      distanceMeters: OFFICIAL_SAVED_AMBULANCE.distanceMeters,
      etaMinutes: OFFICIAL_SAVED_AMBULANCE.etaMinutes,
      isTraumaReady: true,
    },
    emergencyPriority: 'CRITICAL',
  };
}
