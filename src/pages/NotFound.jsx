import { Link } from "react-router-dom";
import ErrorPage from "../components/ErrorPage"
export default function NotFound() {
  return (
        <ErrorPage
        status={404}
        message="העמוד שחיפשת לא קיים."
        actionText="חזור לדף הראשי"
        actionLink="/"
      />
  );
}
