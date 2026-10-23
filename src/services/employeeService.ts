import {
  findAllEmployees,
  findEmployeeById,
  findEmployeeApplications,
} from "../models/employeeModel.js";

export async function getAllEmployees() {
  return findAllEmployees();
}

export async function getEmployeeById(id: string) {
  return findEmployeeById(id);
}

export async function getEmployeeApplications(id: string) {
  const employee = await findEmployeeById(id);

  if (!employee) {
    return null;
  }

  const applications = await findEmployeeApplications(id);

  return {
    employee: employee.name,
    applications,
  };
}
