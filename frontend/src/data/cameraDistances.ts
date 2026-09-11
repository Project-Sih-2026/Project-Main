// Precomputed Pairwise Distance & Transit Metrics for all 20 Cameras
// Generated automatically based on GPS Coordinates (WGS84 Haversine)

export interface CameraDistanceTarget {
  target_id: string;
  target_name: string;
  distance_meters: number;
  distance_km: number;
  est_transit_mins_30kmh?: number;
  est_transit_mins?: number;
  est_transit_secs: number;
  bearing_deg: number;
  cardinal_direction: string;
}

export interface CameraNodeMeta {
  id: string;
  code: string;
  designation: string;
  district: string;
  sector: string;
  lat: number;
  lng: number;
  direction: string;
}

export interface CameraDistanceData {
  total_cameras: number;
  cameras: CameraNodeMeta[];
  matrix: Record<string, Record<string, any>>;
}

export const CAMERA_DISTANCE_DATA: CameraDistanceData = {
  "total_cameras": 20,
  "cameras": [
    {
      "id": "CAM-GN-01",
      "code": "CAM-GN-01",
      "designation": "Gandhi Nagar Textile Market",
      "district": "Gandhi Nagar",
      "sector": "Pushta Road Gate",
      "lat": 28.6625,
      "lng": 77.269,
      "direction": "Northbound"
    },
    {
      "id": "CAM-GN-02",
      "code": "CAM-GN-02",
      "designation": "Mahila Colony Chowk",
      "district": "Gandhi Nagar",
      "sector": "Central Hub",
      "lat": 28.6595,
      "lng": 77.2665,
      "direction": "Eastbound"
    },
    {
      "id": "CAM-GN-03",
      "code": "CAM-GN-03",
      "designation": "Dharampura T-Point",
      "district": "Gandhi Nagar",
      "sector": "West Hub",
      "lat": 28.664,
      "lng": 77.2635,
      "direction": "Westbound"
    },
    {
      "id": "CAM-GN-04",
      "code": "CAM-GN-04",
      "designation": "Shastri Park Pushta Corridor",
      "district": "Gandhi Nagar",
      "sector": "North Pushta Highway",
      "lat": 28.668,
      "lng": 77.261,
      "direction": "Northbound"
    },
    {
      "id": "CAM-GN-05",
      "code": "CAM-GN-05",
      "designation": "Geeta Colony Flyover Link",
      "district": "Gandhi Nagar",
      "sector": "South Arterial Link",
      "lat": 28.654,
      "lng": 77.271,
      "direction": "Southbound"
    },
    {
      "id": "CAM-GN-06",
      "code": "CAM-GN-06",
      "designation": "Ashok Gali Crossing",
      "district": "Gandhi Nagar",
      "sector": "Market Core",
      "lat": 28.6615,
      "lng": 77.2675,
      "direction": "Northbound"
    },
    {
      "id": "CAM-GN-07",
      "code": "CAM-GN-07",
      "designation": "Raghuvarpura Main Road",
      "district": "Gandhi Nagar",
      "sector": "North-East Hub",
      "lat": 28.6655,
      "lng": 77.267,
      "direction": "Eastbound"
    },
    {
      "id": "CAM-GN-08",
      "code": "CAM-GN-08",
      "designation": "Seelampur Metro Pushta Link",
      "district": "Gandhi Nagar",
      "sector": "North Link",
      "lat": 28.6695,
      "lng": 77.265,
      "direction": "Northbound"
    },
    {
      "id": "CAM-GN-09",
      "code": "CAM-GN-09",
      "designation": "Shanti Mohalla Market Gate",
      "district": "Gandhi Nagar",
      "sector": "East Market Link",
      "lat": 28.6605,
      "lng": 77.2715,
      "direction": "Southbound"
    },
    {
      "id": "CAM-GN-10",
      "code": "CAM-GN-10",
      "designation": "Ramesh Park Pushta Entry",
      "district": "Gandhi Nagar",
      "sector": "South Pushta Link",
      "lat": 28.651,
      "lng": 77.2695,
      "direction": "Southbound"
    },
    {
      "id": "CAM-KN-01",
      "code": "CAM-KN-01",
      "designation": "Lal Quarter Market Chowk",
      "district": "Krishna Nagar",
      "sector": "East Delhi Core",
      "lat": 28.6575,
      "lng": 77.2795,
      "direction": "Northbound"
    },
    {
      "id": "CAM-KN-02",
      "code": "CAM-KN-02",
      "designation": "Vijay Chowk Crossing",
      "district": "Krishna Nagar",
      "sector": "East Delhi Core",
      "lat": 28.655,
      "lng": 77.282,
      "direction": "Eastbound"
    },
    {
      "id": "CAM-KN-03",
      "code": "CAM-KN-03",
      "designation": "Krishna Nagar Metro Station",
      "district": "Krishna Nagar",
      "sector": "Main Vikas Marg Link",
      "lat": 28.6515,
      "lng": 77.2805,
      "direction": "Westbound"
    },
    {
      "id": "CAM-KN-04",
      "code": "CAM-KN-04",
      "designation": "Jheel Khurenja Chowk",
      "district": "Krishna Nagar",
      "sector": "West Corridor",
      "lat": 28.659,
      "lng": 77.2755,
      "direction": "Northbound"
    },
    {
      "id": "CAM-KN-05",
      "code": "CAM-KN-05",
      "designation": "Chander Nagar Junction",
      "district": "Krishna Nagar",
      "sector": "North Corridor",
      "lat": 28.661,
      "lng": 77.2835,
      "direction": "Southbound"
    },
    {
      "id": "CAM-KN-06",
      "code": "CAM-KN-06",
      "designation": "Swarn Cinema Road Intersection",
      "district": "Krishna Nagar",
      "sector": "South Corridor",
      "lat": 28.6535,
      "lng": 77.2765,
      "direction": "Eastbound"
    },
    {
      "id": "CAM-KN-07",
      "code": "CAM-KN-07",
      "designation": "Radhey Puri Main Market",
      "district": "Krishna Nagar",
      "sector": "West Corridor",
      "lat": 28.656,
      "lng": 77.2725,
      "direction": "Westbound"
    },
    {
      "id": "CAM-KN-08",
      "code": "CAM-KN-08",
      "designation": "East Azad Nagar Metro Link",
      "district": "Krishna Nagar",
      "sector": "North-East Link",
      "lat": 28.6645,
      "lng": 77.28,
      "direction": "Northbound"
    },
    {
      "id": "CAM-KN-09",
      "code": "CAM-KN-09",
      "designation": "Kanti Nagar Extension Crossing",
      "district": "Krishna Nagar",
      "sector": "North Corridor",
      "lat": 28.667,
      "lng": 77.278,
      "direction": "Southbound"
    },
    {
      "id": "CAM-KN-10",
      "code": "CAM-KN-10",
      "designation": "Old Anarkali Road Junction",
      "district": "Krishna Nagar",
      "sector": "East Corridor",
      "lat": 28.6585,
      "lng": 77.2865,
      "direction": "Eastbound"
    }
  ],
  "matrix": {
    "CAM-GN-01": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 413.3,
        "distance_km": 0.413,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 50,
        "bearing_deg": 216.2,
        "cardinal_direction": "SW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 561.9,
        "distance_km": 0.562,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 67,
        "bearing_deg": 287.3,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 991.6,
        "distance_km": 0.992,
        "est_transit_mins_30kmh": 2.0,
        "est_transit_secs": 119,
        "bearing_deg": 308.1,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 965.1,
        "distance_km": 0.965,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 116,
        "bearing_deg": 168.3,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 183.8,
        "distance_km": 0.184,
        "est_transit_mins_30kmh": 0.4,
        "est_transit_secs": 22,
        "bearing_deg": 232.8,
        "cardinal_direction": "SW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 386.5,
        "distance_km": 0.387,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 46,
        "bearing_deg": 329.7,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 870.7,
        "distance_km": 0.871,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 105,
        "bearing_deg": 333.4,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 330.1,
        "distance_km": 0.33,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 40,
        "bearing_deg": 132.4,
        "cardinal_direction": "SE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1279.7,
        "distance_km": 1.28,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 154,
        "bearing_deg": 177.8,
        "cardinal_direction": "S"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1165.6,
        "distance_km": 1.166,
        "est_transit_mins_30kmh": 2.3,
        "est_transit_secs": 140,
        "bearing_deg": 118.5,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1518.0,
        "distance_km": 1.518,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 182,
        "bearing_deg": 123.3,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1659.9,
        "distance_km": 1.66,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 199,
        "bearing_deg": 137.5,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 744.1,
        "distance_km": 0.744,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 89,
        "bearing_deg": 121.5,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1424.6,
        "distance_km": 1.425,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 171,
        "bearing_deg": 96.7,
        "cardinal_direction": "E"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1239.8,
        "distance_km": 1.24,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 149,
        "bearing_deg": 143.8,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 799.4,
        "distance_km": 0.799,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 96,
        "bearing_deg": 154.7,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1096.0,
        "distance_km": 1.096,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 132,
        "bearing_deg": 78.3,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1010.7,
        "distance_km": 1.011,
        "est_transit_mins_30kmh": 2.0,
        "est_transit_secs": 121,
        "bearing_deg": 60.3,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1764.5,
        "distance_km": 1.764,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 212,
        "bearing_deg": 104.6,
        "cardinal_direction": "ESE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 183.8,
          "distance_km": 0.184,
          "est_transit_mins_30kmh": 0.4,
          "est_transit_secs": 22,
          "bearing_deg": 232.8,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 330.1,
          "distance_km": 0.33,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 40,
          "bearing_deg": 132.4,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-GN-07",
          "target_name": "Raghuvarpura Main Road",
          "distance_meters": 386.5,
          "distance_km": 0.387,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 46,
          "bearing_deg": 329.7,
          "cardinal_direction": "NNW"
        },
        {
          "target_id": "CAM-GN-02",
          "target_name": "Mahila Colony Chowk",
          "distance_meters": 413.3,
          "distance_km": 0.413,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 50,
          "bearing_deg": 216.2,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-GN-03",
          "target_name": "Dharampura T-Point",
          "distance_meters": 561.9,
          "distance_km": 0.562,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 67,
          "bearing_deg": 287.3,
          "cardinal_direction": "WNW"
        }
      ]
    },
    "CAM-GN-02": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 413.3,
        "distance_km": 0.413,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 50,
        "bearing_deg": 36.2,
        "cardinal_direction": "NE"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 579.7,
        "distance_km": 0.58,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 70,
        "bearing_deg": 329.7,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1086.9,
        "distance_km": 1.087,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 130,
        "bearing_deg": 330.4,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 752.9,
        "distance_km": 0.753,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 90,
        "bearing_deg": 144.3,
        "cardinal_direction": "SE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 242.9,
        "distance_km": 0.243,
        "est_transit_mins_30kmh": 0.5,
        "est_transit_secs": 29,
        "bearing_deg": 23.7,
        "cardinal_direction": "NNE"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 669.0,
        "distance_km": 0.669,
        "est_transit_mins_30kmh": 1.3,
        "est_transit_secs": 80,
        "bearing_deg": 4.2,
        "cardinal_direction": "N"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1121.5,
        "distance_km": 1.121,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 135,
        "bearing_deg": 352.5,
        "cardinal_direction": "N"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 500.4,
        "distance_km": 0.5,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 60,
        "bearing_deg": 77.2,
        "cardinal_direction": "ENE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 989.4,
        "distance_km": 0.989,
        "est_transit_mins_30kmh": 2.0,
        "est_transit_secs": 119,
        "bearing_deg": 162.8,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1287.8,
        "distance_km": 1.288,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 155,
        "bearing_deg": 99.9,
        "cardinal_direction": "E"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1593.0,
        "distance_km": 1.593,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 191,
        "bearing_deg": 108.3,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1630.2,
        "distance_km": 1.63,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 196,
        "bearing_deg": 123.1,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 879.9,
        "distance_km": 0.88,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 106,
        "bearing_deg": 93.6,
        "cardinal_direction": "E"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1667.1,
        "distance_km": 1.667,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 200,
        "bearing_deg": 84.3,
        "cardinal_direction": "E"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1182.0,
        "distance_km": 1.182,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 124.4,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 703.0,
        "distance_km": 0.703,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 84,
        "bearing_deg": 123.6,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1429.7,
        "distance_km": 1.43,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 172,
        "bearing_deg": 67.1,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1398.0,
        "distance_km": 1.398,
        "est_transit_mins_30kmh": 2.8,
        "est_transit_secs": 168,
        "bearing_deg": 53.4,
        "cardinal_direction": "NE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1954.6,
        "distance_km": 1.955,
        "est_transit_mins_30kmh": 3.9,
        "est_transit_secs": 235,
        "bearing_deg": 93.3,
        "cardinal_direction": "E"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 242.9,
          "distance_km": 0.243,
          "est_transit_mins_30kmh": 0.5,
          "est_transit_secs": 29,
          "bearing_deg": 23.7,
          "cardinal_direction": "NNE"
        },
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 413.3,
          "distance_km": 0.413,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 50,
          "bearing_deg": 36.2,
          "cardinal_direction": "NE"
        },
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 500.4,
          "distance_km": 0.5,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 60,
          "bearing_deg": 77.2,
          "cardinal_direction": "ENE"
        },
        {
          "target_id": "CAM-GN-03",
          "target_name": "Dharampura T-Point",
          "distance_meters": 579.7,
          "distance_km": 0.58,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 70,
          "bearing_deg": 329.7,
          "cardinal_direction": "NNW"
        },
        {
          "target_id": "CAM-GN-07",
          "target_name": "Raghuvarpura Main Road",
          "distance_meters": 669.0,
          "distance_km": 0.669,
          "est_transit_mins_30kmh": 1.3,
          "est_transit_secs": 80,
          "bearing_deg": 4.2,
          "cardinal_direction": "N"
        }
      ]
    },
    "CAM-GN-03": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 561.9,
        "distance_km": 0.562,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 67,
        "bearing_deg": 107.3,
        "cardinal_direction": "ESE"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 579.7,
        "distance_km": 0.58,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 70,
        "bearing_deg": 149.7,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 507.3,
        "distance_km": 0.507,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 61,
        "bearing_deg": 331.3,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1331.1,
        "distance_km": 1.331,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 160,
        "bearing_deg": 146.6,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 479.2,
        "distance_km": 0.479,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 58,
        "bearing_deg": 125.5,
        "cardinal_direction": "SE"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 380.0,
        "distance_km": 0.38,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 46,
        "bearing_deg": 64.0,
        "cardinal_direction": "ENE"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 628.8,
        "distance_km": 0.629,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 75,
        "bearing_deg": 13.5,
        "cardinal_direction": "NNE"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 872.2,
        "distance_km": 0.872,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 105,
        "bearing_deg": 116.5,
        "cardinal_direction": "ESE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1559.6,
        "distance_km": 1.56,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 187,
        "bearing_deg": 158.0,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1720.3,
        "distance_km": 1.72,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 207,
        "bearing_deg": 114.8,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 2063.9,
        "distance_km": 2.064,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 248,
        "bearing_deg": 119.0,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 2164.1,
        "distance_km": 2.164,
        "est_transit_mins_30kmh": 4.3,
        "est_transit_secs": 260,
        "bearing_deg": 130.0,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 1296.1,
        "distance_km": 1.296,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 156,
        "bearing_deg": 115.4,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1979.7,
        "distance_km": 1.98,
        "est_transit_mins_30kmh": 4.0,
        "est_transit_secs": 238,
        "bearing_deg": 99.7,
        "cardinal_direction": "E"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1724.0,
        "distance_km": 1.724,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 207,
        "bearing_deg": 132.6,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1250.0,
        "distance_km": 1.25,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 150,
        "bearing_deg": 135.4,
        "cardinal_direction": "SE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1610.8,
        "distance_km": 1.611,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 193,
        "bearing_deg": 88.0,
        "cardinal_direction": "E"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1453.5,
        "distance_km": 1.454,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 174,
        "bearing_deg": 76.7,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 2326.0,
        "distance_km": 2.326,
        "est_transit_mins_30kmh": 4.7,
        "est_transit_secs": 279,
        "bearing_deg": 105.2,
        "cardinal_direction": "ESE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-07",
          "target_name": "Raghuvarpura Main Road",
          "distance_meters": 380.0,
          "distance_km": 0.38,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 46,
          "bearing_deg": 64.0,
          "cardinal_direction": "ENE"
        },
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 479.2,
          "distance_km": 0.479,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 58,
          "bearing_deg": 125.5,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-GN-04",
          "target_name": "Shastri Park Pushta Corridor",
          "distance_meters": 507.3,
          "distance_km": 0.507,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 61,
          "bearing_deg": 331.3,
          "cardinal_direction": "NNW"
        },
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 561.9,
          "distance_km": 0.562,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 67,
          "bearing_deg": 107.3,
          "cardinal_direction": "ESE"
        },
        {
          "target_id": "CAM-GN-02",
          "target_name": "Mahila Colony Chowk",
          "distance_meters": 579.7,
          "distance_km": 0.58,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 70,
          "bearing_deg": 149.7,
          "cardinal_direction": "SSE"
        }
      ]
    },
    "CAM-GN-04": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 991.6,
        "distance_km": 0.992,
        "est_transit_mins_30kmh": 2.0,
        "est_transit_secs": 119,
        "bearing_deg": 128.1,
        "cardinal_direction": "SE"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1086.9,
        "distance_km": 1.087,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 130,
        "bearing_deg": 150.4,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 507.3,
        "distance_km": 0.507,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 61,
        "bearing_deg": 151.3,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1837.2,
        "distance_km": 1.837,
        "est_transit_mins_30kmh": 3.7,
        "est_transit_secs": 221,
        "bearing_deg": 147.9,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 961.6,
        "distance_km": 0.962,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 115,
        "bearing_deg": 138.7,
        "cardinal_direction": "SE"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 648.0,
        "distance_km": 0.648,
        "est_transit_mins_30kmh": 1.3,
        "est_transit_secs": 78,
        "bearing_deg": 115.4,
        "cardinal_direction": "ESE"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 424.4,
        "distance_km": 0.424,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 51,
        "bearing_deg": 66.9,
        "cardinal_direction": "ENE"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1321.0,
        "distance_km": 1.321,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 159,
        "bearing_deg": 129.1,
        "cardinal_direction": "SE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 2064.2,
        "distance_km": 2.064,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 248,
        "bearing_deg": 156.3,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 2149.7,
        "distance_km": 2.15,
        "est_transit_mins_30kmh": 4.3,
        "est_transit_secs": 258,
        "bearing_deg": 122.9,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 2507.6,
        "distance_km": 2.508,
        "est_transit_mins_30kmh": 5.0,
        "est_transit_secs": 301,
        "bearing_deg": 125.2,
        "cardinal_direction": "SE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 2643.2,
        "distance_km": 2.643,
        "est_transit_mins_30kmh": 5.3,
        "est_transit_secs": 317,
        "bearing_deg": 134.0,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 1732.9,
        "distance_km": 1.733,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 208,
        "bearing_deg": 125.3,
        "cardinal_direction": "SE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 2329.2,
        "distance_km": 2.329,
        "est_transit_mins_30kmh": 4.7,
        "est_transit_secs": 280,
        "bearing_deg": 109.5,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 2210.6,
        "distance_km": 2.211,
        "est_transit_mins_30kmh": 4.4,
        "est_transit_secs": 265,
        "bearing_deg": 136.8,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1743.4,
        "distance_km": 1.743,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 209,
        "bearing_deg": 139.9,
        "cardinal_direction": "SE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1894.2,
        "distance_km": 1.894,
        "est_transit_mins_30kmh": 3.8,
        "est_transit_secs": 227,
        "bearing_deg": 101.9,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1662.3,
        "distance_km": 1.662,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 200,
        "bearing_deg": 93.8,
        "cardinal_direction": "E"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 2703.0,
        "distance_km": 2.703,
        "est_transit_mins_30kmh": 5.4,
        "est_transit_secs": 324,
        "bearing_deg": 113.0,
        "cardinal_direction": "ESE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-08",
          "target_name": "Seelampur Metro Pushta Link",
          "distance_meters": 424.4,
          "distance_km": 0.424,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 51,
          "bearing_deg": 66.9,
          "cardinal_direction": "ENE"
        },
        {
          "target_id": "CAM-GN-03",
          "target_name": "Dharampura T-Point",
          "distance_meters": 507.3,
          "distance_km": 0.507,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 61,
          "bearing_deg": 151.3,
          "cardinal_direction": "SSE"
        },
        {
          "target_id": "CAM-GN-07",
          "target_name": "Raghuvarpura Main Road",
          "distance_meters": 648.0,
          "distance_km": 0.648,
          "est_transit_mins_30kmh": 1.3,
          "est_transit_secs": 78,
          "bearing_deg": 115.4,
          "cardinal_direction": "ESE"
        },
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 961.6,
          "distance_km": 0.962,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 115,
          "bearing_deg": 138.7,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 991.6,
          "distance_km": 0.992,
          "est_transit_mins_30kmh": 2.0,
          "est_transit_secs": 119,
          "bearing_deg": 128.1,
          "cardinal_direction": "SE"
        }
      ]
    },
    "CAM-GN-05": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 965.1,
        "distance_km": 0.965,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 116,
        "bearing_deg": 348.3,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 752.9,
        "distance_km": 0.753,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 90,
        "bearing_deg": 324.3,
        "cardinal_direction": "NW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1331.1,
        "distance_km": 1.331,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 160,
        "bearing_deg": 326.7,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1837.2,
        "distance_km": 1.837,
        "est_transit_mins_30kmh": 3.7,
        "est_transit_secs": 221,
        "bearing_deg": 327.9,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 901.2,
        "distance_km": 0.901,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 108,
        "bearing_deg": 337.7,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1337.0,
        "distance_km": 1.337,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 161,
        "bearing_deg": 343.0,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1820.2,
        "distance_km": 1.82,
        "est_transit_mins_30kmh": 3.6,
        "est_transit_secs": 219,
        "bearing_deg": 341.2,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 724.4,
        "distance_km": 0.724,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 87,
        "bearing_deg": 3.9,
        "cardinal_direction": "N"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 364.3,
        "distance_km": 0.364,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 44,
        "bearing_deg": 203.7,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 916.2,
        "distance_km": 0.916,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 110,
        "bearing_deg": 64.9,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1079.1,
        "distance_km": 1.079,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 130,
        "bearing_deg": 84.1,
        "cardinal_direction": "E"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 967.8,
        "distance_km": 0.968,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 116,
        "bearing_deg": 106.7,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 708.5,
        "distance_km": 0.709,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 85,
        "bearing_deg": 38.3,
        "cardinal_direction": "NE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1446.9,
        "distance_km": 1.447,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 174,
        "bearing_deg": 57.5,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 539.5,
        "distance_km": 0.539,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 65,
        "bearing_deg": 95.9,
        "cardinal_direction": "E"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 266.2,
        "distance_km": 0.266,
        "est_transit_mins_30kmh": 0.5,
        "est_transit_secs": 32,
        "bearing_deg": 33.4,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1460.9,
        "distance_km": 1.461,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 175,
        "bearing_deg": 36.9,
        "cardinal_direction": "NE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1598.8,
        "distance_km": 1.599,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 192,
        "bearing_deg": 25.3,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1593.0,
        "distance_km": 1.593,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 191,
        "bearing_deg": 71.7,
        "cardinal_direction": "ENE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-07",
          "target_name": "Radhey Puri Main Market",
          "distance_meters": 266.2,
          "distance_km": 0.266,
          "est_transit_mins_30kmh": 0.5,
          "est_transit_secs": 32,
          "bearing_deg": 33.4,
          "cardinal_direction": "NNE"
        },
        {
          "target_id": "CAM-GN-10",
          "target_name": "Ramesh Park Pushta Entry",
          "distance_meters": 364.3,
          "distance_km": 0.364,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 44,
          "bearing_deg": 203.7,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 539.5,
          "distance_km": 0.539,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 65,
          "bearing_deg": 95.9,
          "cardinal_direction": "E"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 708.5,
          "distance_km": 0.709,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 85,
          "bearing_deg": 38.3,
          "cardinal_direction": "NE"
        },
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 724.4,
          "distance_km": 0.724,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 87,
          "bearing_deg": 3.9,
          "cardinal_direction": "N"
        }
      ]
    },
    "CAM-GN-06": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 183.8,
        "distance_km": 0.184,
        "est_transit_mins_30kmh": 0.4,
        "est_transit_secs": 22,
        "bearing_deg": 52.8,
        "cardinal_direction": "NE"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 242.9,
        "distance_km": 0.243,
        "est_transit_mins_30kmh": 0.5,
        "est_transit_secs": 29,
        "bearing_deg": 203.7,
        "cardinal_direction": "SSW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 479.2,
        "distance_km": 0.479,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 58,
        "bearing_deg": 305.5,
        "cardinal_direction": "NW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 961.6,
        "distance_km": 0.962,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 115,
        "bearing_deg": 318.7,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 901.2,
        "distance_km": 0.901,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 108,
        "bearing_deg": 157.7,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 447.4,
        "distance_km": 0.447,
        "est_transit_mins_30kmh": 0.9,
        "est_transit_secs": 54,
        "bearing_deg": 353.7,
        "cardinal_direction": "N"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 922.4,
        "distance_km": 0.922,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 344.7,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 405.8,
        "distance_km": 0.406,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 49,
        "bearing_deg": 105.9,
        "cardinal_direction": "ESE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1183.7,
        "distance_km": 1.184,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 170.5,
        "cardinal_direction": "S"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1252.5,
        "distance_km": 1.252,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 150,
        "bearing_deg": 110.8,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1588.7,
        "distance_km": 1.589,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 191,
        "bearing_deg": 117.1,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1686.8,
        "distance_km": 1.687,
        "est_transit_mins_30kmh": 3.4,
        "est_transit_secs": 202,
        "bearing_deg": 131.2,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 828.6,
        "distance_km": 0.829,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 99,
        "bearing_deg": 109.6,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1562.1,
        "distance_km": 1.562,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 188,
        "bearing_deg": 92.0,
        "cardinal_direction": "E"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1250.0,
        "distance_km": 1.25,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 150,
        "bearing_deg": 135.4,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 782.3,
        "distance_km": 0.782,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 94,
        "bearing_deg": 141.4,
        "cardinal_direction": "SE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1264.4,
        "distance_km": 1.264,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 152,
        "bearing_deg": 74.7,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1193.1,
        "distance_km": 1.193,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 143,
        "bearing_deg": 59.2,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1883.6,
        "distance_km": 1.884,
        "est_transit_mins_30kmh": 3.8,
        "est_transit_secs": 226,
        "bearing_deg": 100.2,
        "cardinal_direction": "E"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 183.8,
          "distance_km": 0.184,
          "est_transit_mins_30kmh": 0.4,
          "est_transit_secs": 22,
          "bearing_deg": 52.8,
          "cardinal_direction": "NE"
        },
        {
          "target_id": "CAM-GN-02",
          "target_name": "Mahila Colony Chowk",
          "distance_meters": 242.9,
          "distance_km": 0.243,
          "est_transit_mins_30kmh": 0.5,
          "est_transit_secs": 29,
          "bearing_deg": 203.7,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 405.8,
          "distance_km": 0.406,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 49,
          "bearing_deg": 105.9,
          "cardinal_direction": "ESE"
        },
        {
          "target_id": "CAM-GN-07",
          "target_name": "Raghuvarpura Main Road",
          "distance_meters": 447.4,
          "distance_km": 0.447,
          "est_transit_mins_30kmh": 0.9,
          "est_transit_secs": 54,
          "bearing_deg": 353.7,
          "cardinal_direction": "N"
        },
        {
          "target_id": "CAM-GN-03",
          "target_name": "Dharampura T-Point",
          "distance_meters": 479.2,
          "distance_km": 0.479,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 58,
          "bearing_deg": 305.5,
          "cardinal_direction": "NW"
        }
      ]
    },
    "CAM-GN-07": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 386.5,
        "distance_km": 0.387,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 46,
        "bearing_deg": 149.7,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 669.0,
        "distance_km": 0.669,
        "est_transit_mins_30kmh": 1.3,
        "est_transit_secs": 80,
        "bearing_deg": 184.2,
        "cardinal_direction": "S"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 380.0,
        "distance_km": 0.38,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 46,
        "bearing_deg": 244.0,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 648.0,
        "distance_km": 0.648,
        "est_transit_mins_30kmh": 1.3,
        "est_transit_secs": 78,
        "bearing_deg": 295.4,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1337.0,
        "distance_km": 1.337,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 161,
        "bearing_deg": 163.0,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 447.4,
        "distance_km": 0.447,
        "est_transit_mins_30kmh": 0.9,
        "est_transit_secs": 54,
        "bearing_deg": 173.7,
        "cardinal_direction": "S"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 485.7,
        "distance_km": 0.486,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 58,
        "bearing_deg": 336.3,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 708.4,
        "distance_km": 0.708,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 85,
        "bearing_deg": 141.7,
        "cardinal_direction": "SE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1630.7,
        "distance_km": 1.631,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 196,
        "bearing_deg": 171.4,
        "cardinal_direction": "S"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1509.6,
        "distance_km": 1.51,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 181,
        "bearing_deg": 126.1,
        "cardinal_direction": "SE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1872.2,
        "distance_km": 1.872,
        "est_transit_mins_30kmh": 3.8,
        "est_transit_secs": 225,
        "bearing_deg": 128.6,
        "cardinal_direction": "SE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 2039.2,
        "distance_km": 2.039,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 245,
        "bearing_deg": 139.8,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 1100.1,
        "distance_km": 1.1,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 132,
        "bearing_deg": 131.1,
        "cardinal_direction": "SE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1685.8,
        "distance_km": 1.686,
        "est_transit_mins_30kmh": 3.4,
        "est_transit_secs": 202,
        "bearing_deg": 107.3,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1624.7,
        "distance_km": 1.625,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 195,
        "bearing_deg": 145.2,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1184.8,
        "distance_km": 1.185,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 153.1,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1273.2,
        "distance_km": 1.273,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 153,
        "bearing_deg": 95.0,
        "cardinal_direction": "E"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1086.1,
        "distance_km": 1.086,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 130,
        "bearing_deg": 81.2,
        "cardinal_direction": "E"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 2055.7,
        "distance_km": 2.056,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 247,
        "bearing_deg": 112.2,
        "cardinal_direction": "ESE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-03",
          "target_name": "Dharampura T-Point",
          "distance_meters": 380.0,
          "distance_km": 0.38,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 46,
          "bearing_deg": 244.0,
          "cardinal_direction": "WSW"
        },
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 386.5,
          "distance_km": 0.387,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 46,
          "bearing_deg": 149.7,
          "cardinal_direction": "SSE"
        },
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 447.4,
          "distance_km": 0.447,
          "est_transit_mins_30kmh": 0.9,
          "est_transit_secs": 54,
          "bearing_deg": 173.7,
          "cardinal_direction": "S"
        },
        {
          "target_id": "CAM-GN-08",
          "target_name": "Seelampur Metro Pushta Link",
          "distance_meters": 485.7,
          "distance_km": 0.486,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 58,
          "bearing_deg": 336.3,
          "cardinal_direction": "NNW"
        },
        {
          "target_id": "CAM-GN-04",
          "target_name": "Shastri Park Pushta Corridor",
          "distance_meters": 648.0,
          "distance_km": 0.648,
          "est_transit_mins_30kmh": 1.3,
          "est_transit_secs": 78,
          "bearing_deg": 295.4,
          "cardinal_direction": "WNW"
        }
      ]
    },
    "CAM-GN-08": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 870.7,
        "distance_km": 0.871,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 105,
        "bearing_deg": 153.4,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1121.5,
        "distance_km": 1.121,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 135,
        "bearing_deg": 172.5,
        "cardinal_direction": "S"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 628.8,
        "distance_km": 0.629,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 75,
        "bearing_deg": 193.5,
        "cardinal_direction": "SSW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 424.4,
        "distance_km": 0.424,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 51,
        "bearing_deg": 246.9,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1820.2,
        "distance_km": 1.82,
        "est_transit_mins_30kmh": 3.6,
        "est_transit_secs": 219,
        "bearing_deg": 161.2,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 922.4,
        "distance_km": 0.922,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 164.7,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 485.7,
        "distance_km": 0.486,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 58,
        "bearing_deg": 156.3,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1184.8,
        "distance_km": 1.185,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 147.6,
        "cardinal_direction": "SSE"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 2103.4,
        "distance_km": 2.103,
        "est_transit_mins_30kmh": 4.2,
        "est_transit_secs": 253,
        "bearing_deg": 168.0,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1944.7,
        "distance_km": 1.945,
        "est_transit_mins_30kmh": 3.9,
        "est_transit_secs": 233,
        "bearing_deg": 133.3,
        "cardinal_direction": "SE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 2313.2,
        "distance_km": 2.313,
        "est_transit_mins_30kmh": 4.6,
        "est_transit_secs": 278,
        "bearing_deg": 134.2,
        "cardinal_direction": "SE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 2508.6,
        "distance_km": 2.509,
        "est_transit_mins_30kmh": 5.0,
        "est_transit_secs": 301,
        "bearing_deg": 142.9,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 1553.3,
        "distance_km": 1.553,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 186,
        "bearing_deg": 138.7,
        "cardinal_direction": "SE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 2037.5,
        "distance_km": 2.038,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 245,
        "bearing_deg": 117.6,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 2103.4,
        "distance_km": 2.103,
        "est_transit_mins_30kmh": 4.2,
        "est_transit_secs": 253,
        "bearing_deg": 147.8,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1670.0,
        "distance_km": 1.67,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 200,
        "bearing_deg": 154.0,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1565.5,
        "distance_km": 1.565,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 188,
        "bearing_deg": 110.8,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1298.4,
        "distance_km": 1.298,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 156,
        "bearing_deg": 102.4,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 2428.3,
        "distance_km": 2.428,
        "est_transit_mins_30kmh": 4.9,
        "est_transit_secs": 292,
        "bearing_deg": 120.2,
        "cardinal_direction": "ESE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-04",
          "target_name": "Shastri Park Pushta Corridor",
          "distance_meters": 424.4,
          "distance_km": 0.424,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 51,
          "bearing_deg": 246.9,
          "cardinal_direction": "WSW"
        },
        {
          "target_id": "CAM-GN-07",
          "target_name": "Raghuvarpura Main Road",
          "distance_meters": 485.7,
          "distance_km": 0.486,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 58,
          "bearing_deg": 156.3,
          "cardinal_direction": "SSE"
        },
        {
          "target_id": "CAM-GN-03",
          "target_name": "Dharampura T-Point",
          "distance_meters": 628.8,
          "distance_km": 0.629,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 75,
          "bearing_deg": 193.5,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 870.7,
          "distance_km": 0.871,
          "est_transit_mins_30kmh": 1.8,
          "est_transit_secs": 105,
          "bearing_deg": 153.4,
          "cardinal_direction": "SSE"
        },
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 922.4,
          "distance_km": 0.922,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 111,
          "bearing_deg": 164.7,
          "cardinal_direction": "SSE"
        }
      ]
    },
    "CAM-GN-09": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 330.1,
        "distance_km": 0.33,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 40,
        "bearing_deg": 312.4,
        "cardinal_direction": "NW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 500.4,
        "distance_km": 0.5,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 60,
        "bearing_deg": 257.2,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 872.2,
        "distance_km": 0.872,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 105,
        "bearing_deg": 296.5,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1321.0,
        "distance_km": 1.321,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 159,
        "bearing_deg": 309.1,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 724.4,
        "distance_km": 0.724,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 87,
        "bearing_deg": 183.9,
        "cardinal_direction": "S"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 405.8,
        "distance_km": 0.406,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 49,
        "bearing_deg": 285.9,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 708.4,
        "distance_km": 0.708,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 85,
        "bearing_deg": 321.7,
        "cardinal_direction": "NW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1184.8,
        "distance_km": 1.185,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 327.6,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1074.2,
        "distance_km": 1.074,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 190.5,
        "cardinal_direction": "S"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 848.9,
        "distance_km": 0.849,
        "est_transit_mins_30kmh": 1.7,
        "est_transit_secs": 102,
        "bearing_deg": 113.1,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1193.2,
        "distance_km": 1.193,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 143,
        "bearing_deg": 120.8,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1331.4,
        "distance_km": 1.331,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 160,
        "bearing_deg": 138.7,
        "cardinal_direction": "SE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 424.4,
        "distance_km": 0.424,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 51,
        "bearing_deg": 113.1,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1172.2,
        "distance_km": 1.172,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 141,
        "bearing_deg": 87.3,
        "cardinal_direction": "E"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 918.6,
        "distance_km": 0.919,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 110,
        "bearing_deg": 147.9,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 509.8,
        "distance_km": 0.51,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 61,
        "bearing_deg": 169.0,
        "cardinal_direction": "S"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 941.1,
        "distance_km": 0.941,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 113,
        "bearing_deg": 61.8,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 961.6,
        "distance_km": 0.962,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 115,
        "bearing_deg": 41.3,
        "cardinal_direction": "NE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1480.4,
        "distance_km": 1.48,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 178,
        "bearing_deg": 98.6,
        "cardinal_direction": "E"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 330.1,
          "distance_km": 0.33,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 40,
          "bearing_deg": 312.4,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-GN-06",
          "target_name": "Ashok Gali Crossing",
          "distance_meters": 405.8,
          "distance_km": 0.406,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 49,
          "bearing_deg": 285.9,
          "cardinal_direction": "WNW"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 424.4,
          "distance_km": 0.424,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 51,
          "bearing_deg": 113.1,
          "cardinal_direction": "ESE"
        },
        {
          "target_id": "CAM-GN-02",
          "target_name": "Mahila Colony Chowk",
          "distance_meters": 500.4,
          "distance_km": 0.5,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 60,
          "bearing_deg": 257.2,
          "cardinal_direction": "WSW"
        },
        {
          "target_id": "CAM-KN-07",
          "target_name": "Radhey Puri Main Market",
          "distance_meters": 509.8,
          "distance_km": 0.51,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 61,
          "bearing_deg": 169.0,
          "cardinal_direction": "S"
        }
      ]
    },
    "CAM-GN-10": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1279.7,
        "distance_km": 1.28,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 154,
        "bearing_deg": 357.8,
        "cardinal_direction": "N"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 989.4,
        "distance_km": 0.989,
        "est_transit_mins_30kmh": 2.0,
        "est_transit_secs": 119,
        "bearing_deg": 342.8,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1559.6,
        "distance_km": 1.56,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 187,
        "bearing_deg": 338.0,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2064.2,
        "distance_km": 2.064,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 248,
        "bearing_deg": 336.3,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 364.3,
        "distance_km": 0.364,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 44,
        "bearing_deg": 23.7,
        "cardinal_direction": "NNE"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1183.7,
        "distance_km": 1.184,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 350.5,
        "cardinal_direction": "N"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1630.7,
        "distance_km": 1.631,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 196,
        "bearing_deg": 351.4,
        "cardinal_direction": "N"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 2103.4,
        "distance_km": 2.103,
        "est_transit_mins_30kmh": 4.2,
        "est_transit_secs": 253,
        "bearing_deg": 348.0,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1074.2,
        "distance_km": 1.074,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 10.5,
        "cardinal_direction": "N"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1214.3,
        "distance_km": 1.214,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 146,
        "bearing_deg": 53.5,
        "cardinal_direction": "NE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1298.3,
        "distance_km": 1.298,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 156,
        "bearing_deg": 70.0,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1074.8,
        "distance_km": 1.075,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 87.0,
        "cardinal_direction": "E"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 1064.9,
        "distance_km": 1.065,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 128,
        "bearing_deg": 33.3,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1761.4,
        "distance_km": 1.761,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 211,
        "bearing_deg": 50.9,
        "cardinal_direction": "NE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 737.5,
        "distance_km": 0.738,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 89,
        "bearing_deg": 67.9,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 628.3,
        "distance_km": 0.628,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 75,
        "bearing_deg": 27.8,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1817.4,
        "distance_km": 1.817,
        "est_transit_mins_30kmh": 3.6,
        "est_transit_secs": 218,
        "bearing_deg": 34.3,
        "cardinal_direction": "NE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1962.9,
        "distance_km": 1.963,
        "est_transit_mins_30kmh": 3.9,
        "est_transit_secs": 236,
        "bearing_deg": 25.0,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1856.6,
        "distance_km": 1.857,
        "est_transit_mins_30kmh": 3.7,
        "est_transit_secs": 223,
        "bearing_deg": 63.3,
        "cardinal_direction": "ENE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-05",
          "target_name": "Geeta Colony Flyover Link",
          "distance_meters": 364.3,
          "distance_km": 0.364,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 44,
          "bearing_deg": 23.7,
          "cardinal_direction": "NNE"
        },
        {
          "target_id": "CAM-KN-07",
          "target_name": "Radhey Puri Main Market",
          "distance_meters": 628.3,
          "distance_km": 0.628,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 75,
          "bearing_deg": 27.8,
          "cardinal_direction": "NNE"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 737.5,
          "distance_km": 0.738,
          "est_transit_mins_30kmh": 1.5,
          "est_transit_secs": 89,
          "bearing_deg": 67.9,
          "cardinal_direction": "ENE"
        },
        {
          "target_id": "CAM-GN-02",
          "target_name": "Mahila Colony Chowk",
          "distance_meters": 989.4,
          "distance_km": 0.989,
          "est_transit_mins_30kmh": 2.0,
          "est_transit_secs": 119,
          "bearing_deg": 342.8,
          "cardinal_direction": "NNW"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 1064.9,
          "distance_km": 1.065,
          "est_transit_mins_30kmh": 2.1,
          "est_transit_secs": 128,
          "bearing_deg": 33.3,
          "cardinal_direction": "NNE"
        }
      ]
    },
    "CAM-KN-01": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1165.6,
        "distance_km": 1.166,
        "est_transit_mins_30kmh": 2.3,
        "est_transit_secs": 140,
        "bearing_deg": 298.5,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1287.8,
        "distance_km": 1.288,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 155,
        "bearing_deg": 279.9,
        "cardinal_direction": "W"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1720.3,
        "distance_km": 1.72,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 207,
        "bearing_deg": 294.8,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2149.7,
        "distance_km": 2.15,
        "est_transit_mins_30kmh": 4.3,
        "est_transit_secs": 258,
        "bearing_deg": 302.9,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 916.2,
        "distance_km": 0.916,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 110,
        "bearing_deg": 244.9,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1252.5,
        "distance_km": 1.252,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 150,
        "bearing_deg": 290.8,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1509.6,
        "distance_km": 1.51,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 181,
        "bearing_deg": 306.1,
        "cardinal_direction": "NW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1944.7,
        "distance_km": 1.945,
        "est_transit_mins_30kmh": 3.9,
        "est_transit_secs": 233,
        "bearing_deg": 313.3,
        "cardinal_direction": "NW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 848.9,
        "distance_km": 0.849,
        "est_transit_mins_30kmh": 1.7,
        "est_transit_secs": 102,
        "bearing_deg": 293.1,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1214.3,
        "distance_km": 1.214,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 146,
        "bearing_deg": 233.5,
        "cardinal_direction": "SW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 369.8,
        "distance_km": 0.37,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 44,
        "bearing_deg": 138.7,
        "cardinal_direction": "SE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 674.3,
        "distance_km": 0.674,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 81,
        "bearing_deg": 171.7,
        "cardinal_direction": "S"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 424.4,
        "distance_km": 0.424,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 51,
        "bearing_deg": 293.1,
        "cardinal_direction": "WNW"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 551.2,
        "distance_km": 0.551,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 66,
        "bearing_deg": 45.1,
        "cardinal_direction": "NE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 532.5,
        "distance_km": 0.532,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 64,
        "bearing_deg": 213.4,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 703.1,
        "distance_km": 0.703,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 84,
        "bearing_deg": 256.3,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 779.9,
        "distance_km": 0.78,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 94,
        "bearing_deg": 3.6,
        "cardinal_direction": "N"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1066.4,
        "distance_km": 1.066,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 128,
        "bearing_deg": 352.1,
        "cardinal_direction": "N"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 692.0,
        "distance_km": 0.692,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 83,
        "bearing_deg": 80.8,
        "cardinal_direction": "E"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-02",
          "target_name": "Vijay Chowk Crossing",
          "distance_meters": 369.8,
          "distance_km": 0.37,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 44,
          "bearing_deg": 138.7,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 424.4,
          "distance_km": 0.424,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 51,
          "bearing_deg": 293.1,
          "cardinal_direction": "WNW"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 532.5,
          "distance_km": 0.532,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 64,
          "bearing_deg": 213.4,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-KN-05",
          "target_name": "Chander Nagar Junction",
          "distance_meters": 551.2,
          "distance_km": 0.551,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 66,
          "bearing_deg": 45.1,
          "cardinal_direction": "NE"
        },
        {
          "target_id": "CAM-KN-03",
          "target_name": "Krishna Nagar Metro Station",
          "distance_meters": 674.3,
          "distance_km": 0.674,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 81,
          "bearing_deg": 171.7,
          "cardinal_direction": "S"
        }
      ]
    },
    "CAM-KN-02": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1518.0,
        "distance_km": 1.518,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 182,
        "bearing_deg": 303.3,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1593.0,
        "distance_km": 1.593,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 191,
        "bearing_deg": 288.3,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 2063.9,
        "distance_km": 2.064,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 248,
        "bearing_deg": 299.0,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2507.6,
        "distance_km": 2.508,
        "est_transit_mins_30kmh": 5.0,
        "est_transit_secs": 301,
        "bearing_deg": 305.2,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1079.1,
        "distance_km": 1.079,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 130,
        "bearing_deg": 264.1,
        "cardinal_direction": "W"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1588.7,
        "distance_km": 1.589,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 191,
        "bearing_deg": 297.1,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1872.2,
        "distance_km": 1.872,
        "est_transit_mins_30kmh": 3.8,
        "est_transit_secs": 225,
        "bearing_deg": 308.6,
        "cardinal_direction": "NW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 2313.2,
        "distance_km": 2.313,
        "est_transit_mins_30kmh": 4.6,
        "est_transit_secs": 278,
        "bearing_deg": 314.2,
        "cardinal_direction": "NW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1193.2,
        "distance_km": 1.193,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 143,
        "bearing_deg": 300.8,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1298.3,
        "distance_km": 1.298,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 156,
        "bearing_deg": 250.0,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 369.8,
        "distance_km": 0.37,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 44,
        "bearing_deg": 318.7,
        "cardinal_direction": "NW"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 415.8,
        "distance_km": 0.416,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 50,
        "bearing_deg": 200.6,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 774.6,
        "distance_km": 0.775,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 93,
        "bearing_deg": 305.0,
        "cardinal_direction": "NW"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 683.0,
        "distance_km": 0.683,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 82,
        "bearing_deg": 12.4,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 562.0,
        "distance_km": 0.562,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 67,
        "bearing_deg": 252.7,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 933.6,
        "distance_km": 0.934,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 112,
        "bearing_deg": 276.8,
        "cardinal_direction": "W"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1074.2,
        "distance_km": 1.074,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 349.5,
        "cardinal_direction": "N"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1390.2,
        "distance_km": 1.39,
        "est_transit_mins_30kmh": 2.8,
        "est_transit_secs": 167,
        "bearing_deg": 343.7,
        "cardinal_direction": "NNW"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 586.7,
        "distance_km": 0.587,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 70,
        "bearing_deg": 48.4,
        "cardinal_direction": "NE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 369.8,
          "distance_km": 0.37,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 44,
          "bearing_deg": 318.7,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-KN-03",
          "target_name": "Krishna Nagar Metro Station",
          "distance_meters": 415.8,
          "distance_km": 0.416,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 50,
          "bearing_deg": 200.6,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 562.0,
          "distance_km": 0.562,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 67,
          "bearing_deg": 252.7,
          "cardinal_direction": "WSW"
        },
        {
          "target_id": "CAM-KN-10",
          "target_name": "Old Anarkali Road Junction",
          "distance_meters": 586.7,
          "distance_km": 0.587,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 70,
          "bearing_deg": 48.4,
          "cardinal_direction": "NE"
        },
        {
          "target_id": "CAM-KN-05",
          "target_name": "Chander Nagar Junction",
          "distance_meters": 683.0,
          "distance_km": 0.683,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 82,
          "bearing_deg": 12.4,
          "cardinal_direction": "NNE"
        }
      ]
    },
    "CAM-KN-03": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1659.9,
        "distance_km": 1.66,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 199,
        "bearing_deg": 317.5,
        "cardinal_direction": "NW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1630.2,
        "distance_km": 1.63,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 196,
        "bearing_deg": 303.1,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 2164.1,
        "distance_km": 2.164,
        "est_transit_mins_30kmh": 4.3,
        "est_transit_secs": 260,
        "bearing_deg": 310.0,
        "cardinal_direction": "NW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2643.2,
        "distance_km": 2.643,
        "est_transit_mins_30kmh": 5.3,
        "est_transit_secs": 317,
        "bearing_deg": 314.0,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 967.8,
        "distance_km": 0.968,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 116,
        "bearing_deg": 286.7,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1686.8,
        "distance_km": 1.687,
        "est_transit_mins_30kmh": 3.4,
        "est_transit_secs": 202,
        "bearing_deg": 311.2,
        "cardinal_direction": "NW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 2039.2,
        "distance_km": 2.039,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 245,
        "bearing_deg": 319.8,
        "cardinal_direction": "NW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 2508.6,
        "distance_km": 2.509,
        "est_transit_mins_30kmh": 5.0,
        "est_transit_secs": 301,
        "bearing_deg": 322.9,
        "cardinal_direction": "NW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1331.4,
        "distance_km": 1.331,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 160,
        "bearing_deg": 318.7,
        "cardinal_direction": "NW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1074.8,
        "distance_km": 1.075,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 267.0,
        "cardinal_direction": "W"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 674.3,
        "distance_km": 0.674,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 81,
        "bearing_deg": 351.7,
        "cardinal_direction": "N"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 415.8,
        "distance_km": 0.416,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 50,
        "bearing_deg": 20.6,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 966.2,
        "distance_km": 0.966,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 116,
        "bearing_deg": 329.7,
        "cardinal_direction": "NNW"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1096.2,
        "distance_km": 1.096,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 132,
        "bearing_deg": 15.5,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 449.2,
        "distance_km": 0.449,
        "est_transit_mins_30kmh": 0.9,
        "est_transit_secs": 54,
        "bearing_deg": 299.7,
        "cardinal_direction": "WNW"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 927.2,
        "distance_km": 0.927,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 302.7,
        "cardinal_direction": "WNW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1446.4,
        "distance_km": 1.446,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 174,
        "bearing_deg": 358.1,
        "cardinal_direction": "N"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1740.7,
        "distance_km": 1.741,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 209,
        "bearing_deg": 351.9,
        "cardinal_direction": "N"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 974.0,
        "distance_km": 0.974,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 117,
        "bearing_deg": 36.9,
        "cardinal_direction": "NE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-02",
          "target_name": "Vijay Chowk Crossing",
          "distance_meters": 415.8,
          "distance_km": 0.416,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 50,
          "bearing_deg": 20.6,
          "cardinal_direction": "NNE"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 449.2,
          "distance_km": 0.449,
          "est_transit_mins_30kmh": 0.9,
          "est_transit_secs": 54,
          "bearing_deg": 299.7,
          "cardinal_direction": "WNW"
        },
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 674.3,
          "distance_km": 0.674,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 81,
          "bearing_deg": 351.7,
          "cardinal_direction": "N"
        },
        {
          "target_id": "CAM-KN-07",
          "target_name": "Radhey Puri Main Market",
          "distance_meters": 927.2,
          "distance_km": 0.927,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 111,
          "bearing_deg": 302.7,
          "cardinal_direction": "WNW"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 966.2,
          "distance_km": 0.966,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 116,
          "bearing_deg": 329.7,
          "cardinal_direction": "NNW"
        }
      ]
    },
    "CAM-KN-04": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 744.1,
        "distance_km": 0.744,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 89,
        "bearing_deg": 301.5,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 879.9,
        "distance_km": 0.88,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 106,
        "bearing_deg": 273.6,
        "cardinal_direction": "W"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1296.1,
        "distance_km": 1.296,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 156,
        "bearing_deg": 295.4,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1732.9,
        "distance_km": 1.733,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 208,
        "bearing_deg": 305.3,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 708.5,
        "distance_km": 0.709,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 85,
        "bearing_deg": 218.3,
        "cardinal_direction": "SW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 828.6,
        "distance_km": 0.829,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 99,
        "bearing_deg": 289.6,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1100.1,
        "distance_km": 1.1,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 132,
        "bearing_deg": 311.1,
        "cardinal_direction": "NW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1553.3,
        "distance_km": 1.553,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 186,
        "bearing_deg": 318.7,
        "cardinal_direction": "NW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 424.4,
        "distance_km": 0.424,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 51,
        "bearing_deg": 293.1,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1064.9,
        "distance_km": 1.065,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 128,
        "bearing_deg": 213.4,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 424.4,
        "distance_km": 0.424,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 51,
        "bearing_deg": 113.1,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 774.6,
        "distance_km": 0.775,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 93,
        "bearing_deg": 125.0,
        "cardinal_direction": "SE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 966.2,
        "distance_km": 0.966,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 116,
        "bearing_deg": 149.7,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 811.6,
        "distance_km": 0.812,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 97,
        "bearing_deg": 74.1,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 619.3,
        "distance_km": 0.619,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 74,
        "bearing_deg": 170.9,
        "cardinal_direction": "S"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 443.8,
        "distance_km": 0.444,
        "est_transit_mins_30kmh": 0.9,
        "est_transit_secs": 53,
        "bearing_deg": 221.3,
        "cardinal_direction": "SW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 752.9,
        "distance_km": 0.753,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 90,
        "bearing_deg": 35.7,
        "cardinal_direction": "NE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 922.4,
        "distance_km": 0.922,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 15.3,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1074.7,
        "distance_km": 1.075,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 93.0,
        "cardinal_direction": "E"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 424.4,
          "distance_km": 0.424,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 51,
          "bearing_deg": 293.1,
          "cardinal_direction": "WNW"
        },
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 424.4,
          "distance_km": 0.424,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 51,
          "bearing_deg": 113.1,
          "cardinal_direction": "ESE"
        },
        {
          "target_id": "CAM-KN-07",
          "target_name": "Radhey Puri Main Market",
          "distance_meters": 443.8,
          "distance_km": 0.444,
          "est_transit_mins_30kmh": 0.9,
          "est_transit_secs": 53,
          "bearing_deg": 221.3,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 619.3,
          "distance_km": 0.619,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 74,
          "bearing_deg": 170.9,
          "cardinal_direction": "S"
        },
        {
          "target_id": "CAM-GN-05",
          "target_name": "Geeta Colony Flyover Link",
          "distance_meters": 708.5,
          "distance_km": 0.709,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 85,
          "bearing_deg": 218.3,
          "cardinal_direction": "SW"
        }
      ]
    },
    "CAM-KN-05": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1424.6,
        "distance_km": 1.425,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 171,
        "bearing_deg": 276.7,
        "cardinal_direction": "W"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1667.1,
        "distance_km": 1.667,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 200,
        "bearing_deg": 264.3,
        "cardinal_direction": "W"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1979.7,
        "distance_km": 1.98,
        "est_transit_mins_30kmh": 4.0,
        "est_transit_secs": 238,
        "bearing_deg": 279.7,
        "cardinal_direction": "W"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2329.2,
        "distance_km": 2.329,
        "est_transit_mins_30kmh": 4.7,
        "est_transit_secs": 280,
        "bearing_deg": 289.5,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1446.9,
        "distance_km": 1.447,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 174,
        "bearing_deg": 237.5,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1562.1,
        "distance_km": 1.562,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 188,
        "bearing_deg": 272.0,
        "cardinal_direction": "W"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1685.8,
        "distance_km": 1.686,
        "est_transit_mins_30kmh": 3.4,
        "est_transit_secs": 202,
        "bearing_deg": 287.3,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 2037.5,
        "distance_km": 2.038,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 245,
        "bearing_deg": 297.6,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1172.2,
        "distance_km": 1.172,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 141,
        "bearing_deg": 267.3,
        "cardinal_direction": "W"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1761.4,
        "distance_km": 1.761,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 211,
        "bearing_deg": 230.9,
        "cardinal_direction": "SW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 551.2,
        "distance_km": 0.551,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 66,
        "bearing_deg": 225.1,
        "cardinal_direction": "SW"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 683.0,
        "distance_km": 0.683,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 82,
        "bearing_deg": 192.4,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1096.2,
        "distance_km": 1.096,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 132,
        "bearing_deg": 195.5,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 811.6,
        "distance_km": 0.812,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 97,
        "bearing_deg": 254.1,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1078.0,
        "distance_km": 1.078,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 219.3,
        "cardinal_direction": "SW"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1208.8,
        "distance_km": 1.209,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 145,
        "bearing_deg": 242.6,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 517.8,
        "distance_km": 0.518,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 62,
        "bearing_deg": 318.7,
        "cardinal_direction": "NW"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 856.2,
        "distance_km": 0.856,
        "est_transit_mins_30kmh": 1.7,
        "est_transit_secs": 103,
        "bearing_deg": 321.2,
        "cardinal_direction": "NW"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 403.7,
        "distance_km": 0.404,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 48,
        "bearing_deg": 133.5,
        "cardinal_direction": "SE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-10",
          "target_name": "Old Anarkali Road Junction",
          "distance_meters": 403.7,
          "distance_km": 0.404,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 48,
          "bearing_deg": 133.5,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-KN-08",
          "target_name": "East Azad Nagar Metro Link",
          "distance_meters": 517.8,
          "distance_km": 0.518,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 62,
          "bearing_deg": 318.7,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 551.2,
          "distance_km": 0.551,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 66,
          "bearing_deg": 225.1,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-KN-02",
          "target_name": "Vijay Chowk Crossing",
          "distance_meters": 683.0,
          "distance_km": 0.683,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 82,
          "bearing_deg": 192.4,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 811.6,
          "distance_km": 0.812,
          "est_transit_mins_30kmh": 1.6,
          "est_transit_secs": 97,
          "bearing_deg": 254.1,
          "cardinal_direction": "WSW"
        }
      ]
    },
    "CAM-KN-06": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1239.8,
        "distance_km": 1.24,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 149,
        "bearing_deg": 323.8,
        "cardinal_direction": "NW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1182.0,
        "distance_km": 1.182,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 304.4,
        "cardinal_direction": "NW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1724.0,
        "distance_km": 1.724,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 207,
        "bearing_deg": 312.6,
        "cardinal_direction": "NW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2210.6,
        "distance_km": 2.211,
        "est_transit_mins_30kmh": 4.4,
        "est_transit_secs": 265,
        "bearing_deg": 316.8,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 539.5,
        "distance_km": 0.539,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 65,
        "bearing_deg": 275.9,
        "cardinal_direction": "W"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1250.0,
        "distance_km": 1.25,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 150,
        "bearing_deg": 315.4,
        "cardinal_direction": "NW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1624.7,
        "distance_km": 1.625,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 195,
        "bearing_deg": 325.2,
        "cardinal_direction": "NW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 2103.4,
        "distance_km": 2.103,
        "est_transit_mins_30kmh": 4.2,
        "est_transit_secs": 253,
        "bearing_deg": 327.8,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 918.6,
        "distance_km": 0.919,
        "est_transit_mins_30kmh": 1.8,
        "est_transit_secs": 110,
        "bearing_deg": 327.9,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 737.5,
        "distance_km": 0.738,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 89,
        "bearing_deg": 247.9,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 532.5,
        "distance_km": 0.532,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 64,
        "bearing_deg": 33.3,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 562.0,
        "distance_km": 0.562,
        "est_transit_mins_30kmh": 1.1,
        "est_transit_secs": 67,
        "bearing_deg": 72.7,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 449.2,
        "distance_km": 0.449,
        "est_transit_mins_30kmh": 0.9,
        "est_transit_secs": 54,
        "bearing_deg": 119.7,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 619.3,
        "distance_km": 0.619,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 74,
        "bearing_deg": 350.9,
        "cardinal_direction": "N"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1078.0,
        "distance_km": 1.078,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 39.3,
        "cardinal_direction": "NE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 479.2,
        "distance_km": 0.479,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 58,
        "bearing_deg": 305.5,
        "cardinal_direction": "NW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1269.9,
        "distance_km": 1.27,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 152,
        "bearing_deg": 15.6,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1508.2,
        "distance_km": 1.508,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 181,
        "bearing_deg": 5.6,
        "cardinal_direction": "N"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1123.0,
        "distance_km": 1.123,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 135,
        "bearing_deg": 60.3,
        "cardinal_direction": "ENE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-03",
          "target_name": "Krishna Nagar Metro Station",
          "distance_meters": 449.2,
          "distance_km": 0.449,
          "est_transit_mins_30kmh": 0.9,
          "est_transit_secs": 54,
          "bearing_deg": 119.7,
          "cardinal_direction": "ESE"
        },
        {
          "target_id": "CAM-KN-07",
          "target_name": "Radhey Puri Main Market",
          "distance_meters": 479.2,
          "distance_km": 0.479,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 58,
          "bearing_deg": 305.5,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 532.5,
          "distance_km": 0.532,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 64,
          "bearing_deg": 33.3,
          "cardinal_direction": "NNE"
        },
        {
          "target_id": "CAM-GN-05",
          "target_name": "Geeta Colony Flyover Link",
          "distance_meters": 539.5,
          "distance_km": 0.539,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 65,
          "bearing_deg": 275.9,
          "cardinal_direction": "W"
        },
        {
          "target_id": "CAM-KN-02",
          "target_name": "Vijay Chowk Crossing",
          "distance_meters": 562.0,
          "distance_km": 0.562,
          "est_transit_mins_30kmh": 1.1,
          "est_transit_secs": 67,
          "bearing_deg": 72.7,
          "cardinal_direction": "ENE"
        }
      ]
    },
    "CAM-KN-07": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 799.4,
        "distance_km": 0.799,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 96,
        "bearing_deg": 334.7,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 703.0,
        "distance_km": 0.703,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 84,
        "bearing_deg": 303.6,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1250.0,
        "distance_km": 1.25,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 150,
        "bearing_deg": 315.4,
        "cardinal_direction": "NW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1743.4,
        "distance_km": 1.743,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 209,
        "bearing_deg": 319.9,
        "cardinal_direction": "NW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 266.2,
        "distance_km": 0.266,
        "est_transit_mins_30kmh": 0.5,
        "est_transit_secs": 32,
        "bearing_deg": 213.4,
        "cardinal_direction": "SSW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 782.3,
        "distance_km": 0.782,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 94,
        "bearing_deg": 321.4,
        "cardinal_direction": "NW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1184.8,
        "distance_km": 1.185,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 142,
        "bearing_deg": 333.1,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1670.0,
        "distance_km": 1.67,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 200,
        "bearing_deg": 334.0,
        "cardinal_direction": "NNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 509.8,
        "distance_km": 0.51,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 61,
        "bearing_deg": 349.0,
        "cardinal_direction": "N"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 628.3,
        "distance_km": 0.628,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 75,
        "bearing_deg": 207.8,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 703.1,
        "distance_km": 0.703,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 84,
        "bearing_deg": 76.3,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 933.6,
        "distance_km": 0.934,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 112,
        "bearing_deg": 96.8,
        "cardinal_direction": "E"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 927.2,
        "distance_km": 0.927,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 122.7,
        "cardinal_direction": "ESE"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 443.8,
        "distance_km": 0.444,
        "est_transit_mins_30kmh": 0.9,
        "est_transit_secs": 53,
        "bearing_deg": 41.3,
        "cardinal_direction": "NE"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 1208.8,
        "distance_km": 1.209,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 145,
        "bearing_deg": 62.6,
        "cardinal_direction": "ENE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 479.2,
        "distance_km": 0.479,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 58,
        "bearing_deg": 125.5,
        "cardinal_direction": "SE"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 1195.3,
        "distance_km": 1.195,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 143,
        "bearing_deg": 37.7,
        "cardinal_direction": "NE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1335.7,
        "distance_km": 1.336,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 160,
        "bearing_deg": 23.7,
        "cardinal_direction": "NNE"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1394.0,
        "distance_km": 1.394,
        "est_transit_mins_30kmh": 2.8,
        "est_transit_secs": 167,
        "bearing_deg": 78.5,
        "cardinal_direction": "ENE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-GN-05",
          "target_name": "Geeta Colony Flyover Link",
          "distance_meters": 266.2,
          "distance_km": 0.266,
          "est_transit_mins_30kmh": 0.5,
          "est_transit_secs": 32,
          "bearing_deg": 213.4,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 443.8,
          "distance_km": 0.444,
          "est_transit_mins_30kmh": 0.9,
          "est_transit_secs": 53,
          "bearing_deg": 41.3,
          "cardinal_direction": "NE"
        },
        {
          "target_id": "CAM-KN-06",
          "target_name": "Swarn Cinema Road Intersection",
          "distance_meters": 479.2,
          "distance_km": 0.479,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 58,
          "bearing_deg": 125.5,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 509.8,
          "distance_km": 0.51,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 61,
          "bearing_deg": 349.0,
          "cardinal_direction": "N"
        },
        {
          "target_id": "CAM-GN-10",
          "target_name": "Ramesh Park Pushta Entry",
          "distance_meters": 628.3,
          "distance_km": 0.628,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 75,
          "bearing_deg": 207.8,
          "cardinal_direction": "SSW"
        }
      ]
    },
    "CAM-KN-08": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1096.0,
        "distance_km": 1.096,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 132,
        "bearing_deg": 258.3,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1429.7,
        "distance_km": 1.43,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 172,
        "bearing_deg": 247.1,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1610.8,
        "distance_km": 1.611,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 193,
        "bearing_deg": 268.0,
        "cardinal_direction": "W"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1894.2,
        "distance_km": 1.894,
        "est_transit_mins_30kmh": 3.8,
        "est_transit_secs": 227,
        "bearing_deg": 281.9,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1460.9,
        "distance_km": 1.461,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 175,
        "bearing_deg": 217.0,
        "cardinal_direction": "SW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1264.4,
        "distance_km": 1.264,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 152,
        "bearing_deg": 254.7,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1273.2,
        "distance_km": 1.273,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 153,
        "bearing_deg": 275.0,
        "cardinal_direction": "W"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1565.5,
        "distance_km": 1.565,
        "est_transit_mins_30kmh": 3.1,
        "est_transit_secs": 188,
        "bearing_deg": 290.8,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 941.1,
        "distance_km": 0.941,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 113,
        "bearing_deg": 241.8,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1817.4,
        "distance_km": 1.817,
        "est_transit_mins_30kmh": 3.6,
        "est_transit_secs": 218,
        "bearing_deg": 214.3,
        "cardinal_direction": "SW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 779.9,
        "distance_km": 0.78,
        "est_transit_mins_30kmh": 1.6,
        "est_transit_secs": 94,
        "bearing_deg": 183.6,
        "cardinal_direction": "S"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1074.2,
        "distance_km": 1.074,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 169.5,
        "cardinal_direction": "S"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1446.4,
        "distance_km": 1.446,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 174,
        "bearing_deg": 178.1,
        "cardinal_direction": "S"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 752.9,
        "distance_km": 0.753,
        "est_transit_mins_30kmh": 1.5,
        "est_transit_secs": 90,
        "bearing_deg": 215.7,
        "cardinal_direction": "SW"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 517.8,
        "distance_km": 0.518,
        "est_transit_mins_30kmh": 1.0,
        "est_transit_secs": 62,
        "bearing_deg": 138.7,
        "cardinal_direction": "SE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1269.9,
        "distance_km": 1.27,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 152,
        "bearing_deg": 195.6,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1195.3,
        "distance_km": 1.195,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 143,
        "bearing_deg": 217.8,
        "cardinal_direction": "SW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 339.6,
        "distance_km": 0.34,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 41,
        "bearing_deg": 324.9,
        "cardinal_direction": "NW"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 920.5,
        "distance_km": 0.92,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 136.4,
        "cardinal_direction": "SE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-09",
          "target_name": "Kanti Nagar Extension Crossing",
          "distance_meters": 339.6,
          "distance_km": 0.34,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 41,
          "bearing_deg": 324.9,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-KN-05",
          "target_name": "Chander Nagar Junction",
          "distance_meters": 517.8,
          "distance_km": 0.518,
          "est_transit_mins_30kmh": 1.0,
          "est_transit_secs": 62,
          "bearing_deg": 138.7,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 752.9,
          "distance_km": 0.753,
          "est_transit_mins_30kmh": 1.5,
          "est_transit_secs": 90,
          "bearing_deg": 215.7,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 779.9,
          "distance_km": 0.78,
          "est_transit_mins_30kmh": 1.6,
          "est_transit_secs": 94,
          "bearing_deg": 183.6,
          "cardinal_direction": "S"
        },
        {
          "target_id": "CAM-KN-10",
          "target_name": "Old Anarkali Road Junction",
          "distance_meters": 920.5,
          "distance_km": 0.92,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 111,
          "bearing_deg": 136.4,
          "cardinal_direction": "SE"
        }
      ]
    },
    "CAM-KN-09": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1010.7,
        "distance_km": 1.011,
        "est_transit_mins_30kmh": 2.0,
        "est_transit_secs": 121,
        "bearing_deg": 240.3,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1398.0,
        "distance_km": 1.398,
        "est_transit_mins_30kmh": 2.8,
        "est_transit_secs": 168,
        "bearing_deg": 233.4,
        "cardinal_direction": "SW"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 1453.5,
        "distance_km": 1.454,
        "est_transit_mins_30kmh": 2.9,
        "est_transit_secs": 174,
        "bearing_deg": 256.7,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 1662.3,
        "distance_km": 1.662,
        "est_transit_mins_30kmh": 3.3,
        "est_transit_secs": 200,
        "bearing_deg": 273.8,
        "cardinal_direction": "W"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1598.8,
        "distance_km": 1.599,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 192,
        "bearing_deg": 205.3,
        "cardinal_direction": "SSW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1193.1,
        "distance_km": 1.193,
        "est_transit_mins_30kmh": 2.4,
        "est_transit_secs": 143,
        "bearing_deg": 239.2,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 1086.1,
        "distance_km": 1.086,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 130,
        "bearing_deg": 261.2,
        "cardinal_direction": "W"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 1298.4,
        "distance_km": 1.298,
        "est_transit_mins_30kmh": 2.6,
        "est_transit_secs": 156,
        "bearing_deg": 282.4,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 961.6,
        "distance_km": 0.962,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 115,
        "bearing_deg": 221.3,
        "cardinal_direction": "SW"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1962.9,
        "distance_km": 1.963,
        "est_transit_mins_30kmh": 3.9,
        "est_transit_secs": 236,
        "bearing_deg": 205.0,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 1066.4,
        "distance_km": 1.066,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 128,
        "bearing_deg": 172.1,
        "cardinal_direction": "S"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 1390.2,
        "distance_km": 1.39,
        "est_transit_mins_30kmh": 2.8,
        "est_transit_secs": 167,
        "bearing_deg": 163.7,
        "cardinal_direction": "SSE"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 1740.7,
        "distance_km": 1.741,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 209,
        "bearing_deg": 171.9,
        "cardinal_direction": "S"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 922.4,
        "distance_km": 0.922,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 195.3,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 856.2,
        "distance_km": 0.856,
        "est_transit_mins_30kmh": 1.7,
        "est_transit_secs": 103,
        "bearing_deg": 141.2,
        "cardinal_direction": "SE"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1508.2,
        "distance_km": 1.508,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 181,
        "bearing_deg": 185.6,
        "cardinal_direction": "S"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1335.7,
        "distance_km": 1.336,
        "est_transit_mins_30kmh": 2.7,
        "est_transit_secs": 160,
        "bearing_deg": 203.7,
        "cardinal_direction": "SSW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 339.6,
        "distance_km": 0.34,
        "est_transit_mins_30kmh": 0.7,
        "est_transit_secs": 41,
        "bearing_deg": 144.9,
        "cardinal_direction": "SE"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 1257.4,
        "distance_km": 1.257,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 151,
        "bearing_deg": 138.7,
        "cardinal_direction": "SE"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-08",
          "target_name": "East Azad Nagar Metro Link",
          "distance_meters": 339.6,
          "distance_km": 0.34,
          "est_transit_mins_30kmh": 0.7,
          "est_transit_secs": 41,
          "bearing_deg": 144.9,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-KN-05",
          "target_name": "Chander Nagar Junction",
          "distance_meters": 856.2,
          "distance_km": 0.856,
          "est_transit_mins_30kmh": 1.7,
          "est_transit_secs": 103,
          "bearing_deg": 141.2,
          "cardinal_direction": "SE"
        },
        {
          "target_id": "CAM-KN-04",
          "target_name": "Jheel Khurenja Chowk",
          "distance_meters": 922.4,
          "distance_km": 0.922,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 111,
          "bearing_deg": 195.3,
          "cardinal_direction": "SSW"
        },
        {
          "target_id": "CAM-GN-09",
          "target_name": "Shanti Mohalla Market Gate",
          "distance_meters": 961.6,
          "distance_km": 0.962,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 115,
          "bearing_deg": 221.3,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-GN-01",
          "target_name": "Gandhi Nagar Textile Market",
          "distance_meters": 1010.7,
          "distance_km": 1.011,
          "est_transit_mins_30kmh": 2.0,
          "est_transit_secs": 121,
          "bearing_deg": 240.3,
          "cardinal_direction": "WSW"
        }
      ]
    },
    "CAM-KN-10": {
      "CAM-GN-01": {
        "target_id": "CAM-GN-01",
        "target_name": "Gandhi Nagar Textile Market",
        "distance_meters": 1764.5,
        "distance_km": 1.764,
        "est_transit_mins_30kmh": 3.5,
        "est_transit_secs": 212,
        "bearing_deg": 284.6,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-02": {
        "target_id": "CAM-GN-02",
        "target_name": "Mahila Colony Chowk",
        "distance_meters": 1954.6,
        "distance_km": 1.955,
        "est_transit_mins_30kmh": 3.9,
        "est_transit_secs": 235,
        "bearing_deg": 273.3,
        "cardinal_direction": "W"
      },
      "CAM-GN-03": {
        "target_id": "CAM-GN-03",
        "target_name": "Dharampura T-Point",
        "distance_meters": 2326.0,
        "distance_km": 2.326,
        "est_transit_mins_30kmh": 4.7,
        "est_transit_secs": 279,
        "bearing_deg": 285.2,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-04": {
        "target_id": "CAM-GN-04",
        "target_name": "Shastri Park Pushta Corridor",
        "distance_meters": 2703.0,
        "distance_km": 2.703,
        "est_transit_mins_30kmh": 5.4,
        "est_transit_secs": 324,
        "bearing_deg": 293.0,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-05": {
        "target_id": "CAM-GN-05",
        "target_name": "Geeta Colony Flyover Link",
        "distance_meters": 1593.0,
        "distance_km": 1.593,
        "est_transit_mins_30kmh": 3.2,
        "est_transit_secs": 191,
        "bearing_deg": 251.7,
        "cardinal_direction": "WSW"
      },
      "CAM-GN-06": {
        "target_id": "CAM-GN-06",
        "target_name": "Ashok Gali Crossing",
        "distance_meters": 1883.6,
        "distance_km": 1.884,
        "est_transit_mins_30kmh": 3.8,
        "est_transit_secs": 226,
        "bearing_deg": 280.2,
        "cardinal_direction": "W"
      },
      "CAM-GN-07": {
        "target_id": "CAM-GN-07",
        "target_name": "Raghuvarpura Main Road",
        "distance_meters": 2055.7,
        "distance_km": 2.056,
        "est_transit_mins_30kmh": 4.1,
        "est_transit_secs": 247,
        "bearing_deg": 292.3,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-08": {
        "target_id": "CAM-GN-08",
        "target_name": "Seelampur Metro Pushta Link",
        "distance_meters": 2428.3,
        "distance_km": 2.428,
        "est_transit_mins_30kmh": 4.9,
        "est_transit_secs": 292,
        "bearing_deg": 300.3,
        "cardinal_direction": "WNW"
      },
      "CAM-GN-09": {
        "target_id": "CAM-GN-09",
        "target_name": "Shanti Mohalla Market Gate",
        "distance_meters": 1480.4,
        "distance_km": 1.48,
        "est_transit_mins_30kmh": 3.0,
        "est_transit_secs": 178,
        "bearing_deg": 278.6,
        "cardinal_direction": "W"
      },
      "CAM-GN-10": {
        "target_id": "CAM-GN-10",
        "target_name": "Ramesh Park Pushta Entry",
        "distance_meters": 1856.6,
        "distance_km": 1.857,
        "est_transit_mins_30kmh": 3.7,
        "est_transit_secs": 223,
        "bearing_deg": 243.3,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-01": {
        "target_id": "CAM-KN-01",
        "target_name": "Lal Quarter Market Chowk",
        "distance_meters": 692.0,
        "distance_km": 0.692,
        "est_transit_mins_30kmh": 1.4,
        "est_transit_secs": 83,
        "bearing_deg": 260.8,
        "cardinal_direction": "W"
      },
      "CAM-KN-02": {
        "target_id": "CAM-KN-02",
        "target_name": "Vijay Chowk Crossing",
        "distance_meters": 586.7,
        "distance_km": 0.587,
        "est_transit_mins_30kmh": 1.2,
        "est_transit_secs": 70,
        "bearing_deg": 228.4,
        "cardinal_direction": "SW"
      },
      "CAM-KN-03": {
        "target_id": "CAM-KN-03",
        "target_name": "Krishna Nagar Metro Station",
        "distance_meters": 974.0,
        "distance_km": 0.974,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 117,
        "bearing_deg": 217.0,
        "cardinal_direction": "SW"
      },
      "CAM-KN-04": {
        "target_id": "CAM-KN-04",
        "target_name": "Jheel Khurenja Chowk",
        "distance_meters": 1074.7,
        "distance_km": 1.075,
        "est_transit_mins_30kmh": 2.1,
        "est_transit_secs": 129,
        "bearing_deg": 273.0,
        "cardinal_direction": "W"
      },
      "CAM-KN-05": {
        "target_id": "CAM-KN-05",
        "target_name": "Chander Nagar Junction",
        "distance_meters": 403.7,
        "distance_km": 0.404,
        "est_transit_mins_30kmh": 0.8,
        "est_transit_secs": 48,
        "bearing_deg": 313.5,
        "cardinal_direction": "NW"
      },
      "CAM-KN-06": {
        "target_id": "CAM-KN-06",
        "target_name": "Swarn Cinema Road Intersection",
        "distance_meters": 1123.0,
        "distance_km": 1.123,
        "est_transit_mins_30kmh": 2.2,
        "est_transit_secs": 135,
        "bearing_deg": 240.3,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-07": {
        "target_id": "CAM-KN-07",
        "target_name": "Radhey Puri Main Market",
        "distance_meters": 1394.0,
        "distance_km": 1.394,
        "est_transit_mins_30kmh": 2.8,
        "est_transit_secs": 167,
        "bearing_deg": 258.5,
        "cardinal_direction": "WSW"
      },
      "CAM-KN-08": {
        "target_id": "CAM-KN-08",
        "target_name": "East Azad Nagar Metro Link",
        "distance_meters": 920.5,
        "distance_km": 0.92,
        "est_transit_mins_30kmh": 1.9,
        "est_transit_secs": 111,
        "bearing_deg": 316.5,
        "cardinal_direction": "NW"
      },
      "CAM-KN-09": {
        "target_id": "CAM-KN-09",
        "target_name": "Kanti Nagar Extension Crossing",
        "distance_meters": 1257.4,
        "distance_km": 1.257,
        "est_transit_mins_30kmh": 2.5,
        "est_transit_secs": 151,
        "bearing_deg": 318.7,
        "cardinal_direction": "NW"
      },
      "CAM-KN-10": {
        "target_id": "CAM-KN-10",
        "target_name": "Old Anarkali Road Junction",
        "distance_meters": 0.0,
        "distance_km": 0.0,
        "est_transit_mins_30kmh": 0.0,
        "est_transit_secs": 0,
        "bearing_deg": 0,
        "cardinal_direction": "-"
      },
      "_nearest_neighbors": [
        {
          "target_id": "CAM-KN-05",
          "target_name": "Chander Nagar Junction",
          "distance_meters": 403.7,
          "distance_km": 0.404,
          "est_transit_mins_30kmh": 0.8,
          "est_transit_secs": 48,
          "bearing_deg": 313.5,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-KN-02",
          "target_name": "Vijay Chowk Crossing",
          "distance_meters": 586.7,
          "distance_km": 0.587,
          "est_transit_mins_30kmh": 1.2,
          "est_transit_secs": 70,
          "bearing_deg": 228.4,
          "cardinal_direction": "SW"
        },
        {
          "target_id": "CAM-KN-01",
          "target_name": "Lal Quarter Market Chowk",
          "distance_meters": 692.0,
          "distance_km": 0.692,
          "est_transit_mins_30kmh": 1.4,
          "est_transit_secs": 83,
          "bearing_deg": 260.8,
          "cardinal_direction": "W"
        },
        {
          "target_id": "CAM-KN-08",
          "target_name": "East Azad Nagar Metro Link",
          "distance_meters": 920.5,
          "distance_km": 0.92,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 111,
          "bearing_deg": 316.5,
          "cardinal_direction": "NW"
        },
        {
          "target_id": "CAM-KN-03",
          "target_name": "Krishna Nagar Metro Station",
          "distance_meters": 974.0,
          "distance_km": 0.974,
          "est_transit_mins_30kmh": 1.9,
          "est_transit_secs": 117,
          "bearing_deg": 217.0,
          "cardinal_direction": "SW"
        }
      ]
    }
  }
};

export function getCameraDistance(fromCamId: string, toCamId: string): CameraDistanceTarget | null {
  const normFrom = fromCamId.startsWith('c') && !fromCamId.startsWith('CAM') ? ('CAM-KN-' + fromCamId.replace('c','').padStart(2, '0')) : fromCamId;
  const normTo = toCamId.startsWith('c') && !toCamId.startsWith('CAM') ? ('CAM-KN-' + toCamId.replace('c','').padStart(2, '0')) : toCamId;
  const fromMatrix = CAMERA_DISTANCE_DATA.matrix[fromCamId] || CAMERA_DISTANCE_DATA.matrix[normFrom];
  if (!fromMatrix) return null;
  const target = fromMatrix[toCamId] || fromMatrix[normTo];
  return (target && !Array.isArray(target)) ? (target as CameraDistanceTarget) : null;
}

export function getNearestCameras(camId: string, topN: number = 5): CameraDistanceTarget[] {
  const norm = camId.startsWith('c') && !camId.startsWith('CAM') ? ('CAM-KN-' + camId.replace('c','').padStart(2, '0')) : camId;
  const node = CAMERA_DISTANCE_DATA.matrix[camId] || CAMERA_DISTANCE_DATA.matrix[norm];
  if (!node || !node._nearest_neighbors) return [];
  return (node._nearest_neighbors as CameraDistanceTarget[]).slice(0, topN);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return Math.round(meters) + ' m';
  return (meters / 1000).toFixed(2) + ' km';
}
