import { employeesCss } from './styles';

/* Loads the Employees tile's own styles, and nothing else's. */
export default function EmployeesLayout({ children }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: employeesCss }} />
      {children}
    </>
  );
}
