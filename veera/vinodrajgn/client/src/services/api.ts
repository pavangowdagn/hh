import { supabase } from '../supabaseClient';
import { Vehicle, Complaint, OdometerReading, FileUpload, OdometerSummary } from '../types';

class ApiService {
  // VEHICLES
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const { data: vehicleData, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('registration_number');

      if (error) {
        console.error('Error fetching vehicles:', error);
        return [];
      }

      if (!vehicleData) {
        return [];
      }

      // Process and map vehicle data
      const processedVehicles = vehicleData.map((vehicle: any) => ({
        id: vehicle.id,
        chassis: vehicle.chassis_number || vehicle.vehicle_number,
        reg: vehicle.registration_number,
        depot: vehicle.depot,
        motor: vehicle.motor_number,
        dispatch: vehicle.dispatch_date,
        regDate: vehicle.registration_date,
        mfgDate: vehicle.manufacturing_date,
        model: vehicle.model,
        colour: vehicle.colour,
        seating: vehicle.seating_capacity?.toString(),
        motorKw: vehicle.motor_power_kw?.toString()
      }));

      return processedVehicles;
    } catch (error) {
      console.error('Error in getVehicles:', error);
      return [];
    }
  }

  async addVehicle(vehicle: {
    chassis: string;
    reg: string;
    depot: string;
    motor: string;
    dispatch: string;
    regDate: string;
    mfgDate: string;
    model: string;
    colour: string;
    seating: string;
    motorKw: string;
  }): Promise<Vehicle | null> {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert({
          chassis_number: vehicle.chassis,
          registration_number: vehicle.reg,
          depot: vehicle.depot,
          motor_number: vehicle.motor,
          dispatch_date: vehicle.dispatch,
          registration_date: vehicle.regDate,
          manufacturing_date: vehicle.mfgDate,
          model: vehicle.model,
          colour: vehicle.colour,
          seating_capacity: parseInt(vehicle.seating),
          motor_power_kw: parseInt(vehicle.motorKw)
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding vehicle:', error);
        return null;
      }

      return {
        id: data.id,
        chassis: data.chassis_number,
        reg: data.registration_number,
        depot: data.depot,
        motor: data.motor_number,
        dispatch: data.dispatch_date,
        regDate: data.registration_date,
        mfgDate: data.manufacturing_date,
        model: data.model,
        colour: data.colour,
        seating: data.seating_capacity?.toString(),
        motorKw: data.motor_power_kw?.toString()
      };
    } catch (error) {
      console.error('Error in addVehicle:', error);
      return null;
    }
  }

  // COMPLAINTS
  async getComplaints(): Promise<Complaint[]> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          vehicles!inner(registration_number, depot)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints:', error);
        return [];
      }

      return data?.map((complaint: any) => ({
        id: complaint.id,
        chassis: complaint.chassis_number,
        text: complaint.description,
        date: complaint.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: complaint.status as 'open' | 'cleared',
        vehicleReg: complaint.vehicles?.registration_number,
        vehicleDepot: complaint.vehicles?.depot
      })) || [];
    } catch (error) {
      console.error('Error in getComplaints:', error);
      return [];
    }
  }

  async getComplaintsByVehicle(chassisNumber: string): Promise<Complaint[]> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          vehicles!inner(registration_number, depot)
        `)
        .eq('chassis_number', chassisNumber)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching complaints by vehicle:', error);
        return [];
      }

      return data?.map((complaint: any) => ({
        id: complaint.id,
        chassis: complaint.chassis_number,
        text: complaint.description,
        date: complaint.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: complaint.status as 'open' | 'cleared',
        vehicleReg: complaint.vehicles?.registration_number,
        vehicleDepot: complaint.vehicles?.depot
      })) || [];
    } catch (error) {
      console.error('Error in getComplaintsByVehicle:', error);
      return [];
    }
  }

  async addComplaint(complaint: { chassis: string; text: string; status: string; date: string }): Promise<Complaint | null> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .insert({
          chassis_number: complaint.chassis,
          description: complaint.text,
          status: complaint.status,
          created_at: new Date().toISOString()
        })
        .select(`
          *,
          vehicles!inner(registration_number, depot)
        `)
        .single();

      if (error) {
        console.error('Error adding complaint:', error);
        return null;
      }

      return {
        id: data.id,
        chassis: data.chassis_number,
        text: data.description,
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: data.status as 'open' | 'cleared',
        vehicleReg: data.vehicles?.registration_number,
        vehicleDepot: data.vehicles?.depot
      };
    } catch (error) {
      console.error('Error in addComplaint:', error);
      return null;
    }
  }

  async updateComplaint(id: string, updates: { status: string }): Promise<Complaint | null> {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          vehicles!inner(registration_number, depot)
        `)
        .single();

      if (error) {
        console.error('Error updating complaint:', error);
        return null;
      }

      return {
        id: data.id,
        chassis: data.chassis_number,
        text: data.description,
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        status: data.status as 'open' | 'cleared',
        vehicleReg: data.vehicles?.registration_number,
        vehicleDepot: data.vehicles?.depot
      };
    } catch (error) {
      console.error('Error in updateComplaint:', error);
      return null;
    }
  }

  // ODOMETER READINGS
  async getOdometers(): Promise<OdometerReading[]> {
    try {
      const { data, error } = await supabase
        .from('odometer_readings')
        .select(`
          *,
          vehicles!inner(registration_number)
        `)
        .order('reading_date', { ascending: false });

      if (error) {
        console.error('Error fetching odometer readings:', error);
        return [];
      }

      return data?.map((reading: any) => ({
        id: reading.id,
        chassis: reading.chassis_number,
        value: reading.reading_value,
        date: reading.reading_date,
        vehicleReg: reading.vehicles?.registration_number
      })) || [];
    } catch (error) {
      console.error('Error in getOdometers:', error);
      return [];
    }
  }

  async getOdometersByVehicle(chassisNumber: string): Promise<OdometerReading[]> {
    try {
      const { data, error } = await supabase
        .from('odometer_readings')
        .select(`
          *,
          vehicles!inner(registration_number)
        `)
        .eq('chassis_number', chassisNumber)
        .order('reading_date', { ascending: false });

      if (error) {
        console.error('Error fetching odometer readings by vehicle:', error);
        return [];
      }

      return data?.map((reading: any) => ({
        id: reading.id,
        chassis: reading.chassis_number,
        value: reading.reading_value,
        date: reading.reading_date,
        vehicleReg: reading.vehicles?.registration_number
      })) || [];
    } catch (error) {
      console.error('Error in getOdometersByVehicle:', error);
      return [];
    }
  }

  async addOdometer(reading: { chassis: string; value: number; date: string }): Promise<OdometerReading | null> {
    try {
      const { data, error } = await supabase
        .from('odometer_readings')
        .insert({
          chassis_number: reading.chassis,
          reading_value: reading.value,
          reading_date: reading.date
        })
        .select(`
          *,
          vehicles!inner(registration_number)
        `)
        .single();

      if (error) {
        console.error('Error adding odometer reading:', error);
        return null;
      }

      return {
        id: data.id,
        chassis: data.chassis_number,
        value: data.reading_value,
        date: data.reading_date,
        vehicleReg: data.vehicles?.registration_number
      };
    } catch (error) {
      console.error('Error in addOdometer:', error);
      return null;
    }
  }

  // FILE UPLOADS
  async uploadFile(file: { name: string; content: string; chassis: string; type: 'sop' | 'retro' }): Promise<FileUpload | null> {
    try {
      const { data, error } = await supabase
        .from('file_uploads')
        .insert({
          file_name: file.name,
          file_content: file.content,
          chassis_number: file.chassis,
          file_type: file.type,
          uploaded_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error uploading file:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.file_name,
        content: data.file_content,
        chassis: data.chassis_number,
        type: data.file_type as 'sop' | 'retro',
        uploadDate: data.uploaded_at
      };
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return null;
    }
  }

  async getFilesByType(type: 'sop' | 'retro', chassisNumber?: string): Promise<FileUpload[]> {
    try {
      let query = supabase
        .from('file_uploads')
        .select('*')
        .eq('file_type', type)
        .order('uploaded_at', { ascending: false });

      if (chassisNumber) {
        query = query.eq('chassis_number', chassisNumber);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching files:', error);
        return [];
      }

      return data?.map((file: any) => ({
        id: file.id,
        name: file.file_name,
        content: file.file_content,
        chassis: file.chassis_number,
        type: file.file_type as 'sop' | 'retro',
        uploadDate: file.uploaded_at
      })) || [];
    } catch (error) {
      console.error('Error in getFilesByType:', error);
      return [];
    }
  }

  // ODOMETER SUMMARY
  async getOdometerSummary(): Promise<OdometerSummary[]> {
    try {
      const { data: vehicles, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*');

      const { data: readings, error: readingError } = await supabase
        .from('odometer_readings')
        .select('*')
        .order('reading_date', { ascending: false });

      if (vehicleError || readingError) {
        console.error('Error fetching odometer summary data:', vehicleError || readingError);
        return [];
      }

      // Group vehicles by depot
      const depotGroups: { [key: string]: any[] } = {};
      vehicles?.forEach((vehicle: any) => {
        const depot = vehicle.depot || 'Unknown Depot';
        if (!depotGroups[depot]) {
          depotGroups[depot] = [];
        }
        depotGroups[depot].push(vehicle);
      });

      // Calculate summary for each depot
      const summary: OdometerSummary[] = Object.entries(depotGroups).map(([depot, depotVehicles]) => {
        const vehicleDetails = depotVehicles.map((vehicle: any) => {
          const vehicleReadings = readings?.filter((r: any) => r.chassis_number === vehicle.chassis_number) || [];
          const lastReading = vehicleReadings[0];
          
          return {
            reg: vehicle.registration_number || 'N/A',
            lastReading: lastReading?.reading_value || 0,
            date: lastReading?.reading_date || 'No readings'
          };
        });

        return {
          depot,
          totalOdometer: vehicleDetails.reduce((sum, v) => sum + v.lastReading, 0),
          vehicleCount: vehicleDetails.length,
          vehicles: vehicleDetails
        };
      });

      return summary;
    } catch (error) {
      console.error('Error in getOdometerSummary:', error);
      return [];
    }
  }
}

export const apiService = new ApiService();