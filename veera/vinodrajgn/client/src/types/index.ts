export interface User {
  id: string;
  username: string;
  role: 'admin' | 'upload' | 'viewer';
}

export interface Vehicle {
  id?: string;
  chassis: string;
  reg?: string;
  depot?: string;
  motor?: string;
  dispatch?: string;
  regDate?: string;
  mfgDate?: string;
  model?: string;
  colour?: string;
  seating?: string;
  motorKw?: string;
}

export interface Complaint {
  id: string;
  chassis: string;
  text: string;
  date: string;
  status: 'open' | 'cleared';
  vehicleReg?: string;
  vehicleDepot?: string;
}

export interface OdometerReading {
  id: string;
  chassis: string;
  value: number;
  date: string;
  vehicleReg?: string;
}

export interface FileUpload {
  id: string;
  name: string;
  content: string;
  chassis: string;
  type: 'sop' | 'retro';
  uploadDate: string;
}

export interface OdometerSummary {
  depot: string;
  totalOdometer: number;
  vehicleCount: number;
  vehicles: Array<{
    reg: string;
    lastReading: number;
    date: string;
  }>;
}