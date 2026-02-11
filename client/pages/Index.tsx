import { Navigate } from "react-router-dom";

export default function Index() {
  // Redirect to landing page
  return <Navigate to="/" replace />;
}
