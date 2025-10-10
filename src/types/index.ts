export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  nickname?: string;
  mileage?: number;
  vin: string;
}

export interface MaintenanceRecord {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  totalCost?: number;
  mileage?: number;
  date: string;
  vehicleId: string;
  vehicle: Pick<Vehicle, 'id' | 'nickname' | 'make' | 'model' | 'year'>;
}

export interface ServiceTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  estimatedCost: number;
  estimatedTime: string;
  commonDetails?: any;
  defaultDetails?: any;
  intervalMiles?: number;
  intervalMonths?: number;
}

export type ServiceRecord = MaintenanceRecord;

// Recall API Types
export interface RecallInfo {
  recallId: string;
  componentAffected: string;
  description: string;
  safetyRisk: string;
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  remedyAvailable: string;
  dateInitiated: string;
  manufacturer: string;
  parkVehicle?: boolean;
  parkOutside?: boolean;
}

export interface RecallAPIResponse {
  success: boolean;
  data?: {
    vin: string;
    vehicle: {
      year: number;
      make: string;
      model: string;
      trim?: string;
    };
    recallCount: number;
    lastChecked: string;
    recalls: RecallInfo[];
    dataSource: string;
    cacheStatus: 'hit' | 'miss';
  };
  error?: string;
  details?: string;
}