import { Navigate } from "react-router-dom";

function RoleRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

export default RoleRoute;