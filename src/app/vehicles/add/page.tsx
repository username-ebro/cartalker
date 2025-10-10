import { AddVehicleForm } from '@/components/AddVehicleForm';

export default function AddVehiclePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Vehicle</h1>
        <p className="mt-2 text-gray-600">
          Enter your vehicle's VIN to automatically populate details, then add any additional information.
        </p>
      </div>

      <AddVehicleForm />
    </div>
  );
}