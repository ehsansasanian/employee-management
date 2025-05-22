export interface Employee {
  id: string; // Or number
  fullName: string;
  address: string;
  phoneNumber: string;
  email: string;
  departmentId: string | null; // Or number, null if unassigned
}
