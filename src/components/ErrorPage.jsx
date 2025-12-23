import { Link, useNavigate } from "react-router-dom";
import { Home, RefreshCcw, Undo2 } from "lucide-react";

export default function ErrorPage({
  status = 500,
  message = "אירעה שגיאה בלתי צפויה.",
  details = "",
  actionText = "חזרה לדף הבית",
  actionLink = "/",
}) {
  const navigate = useNavigate();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex justify-center items-center p-10" dir="rtl">
      <div className="w-full max-w-xl bg-red-50 border border-red-300 rounded-2xl p-8 shadow-md">
        <h1 className="text-6xl font-bold text-red-700">{status}</h1>

        <p className="text-xl mt-4 text-red-800">{message}</p>
        {details && <p className="text-red-600 mt-2">{details}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-sm">


          <Link
            to={actionLink}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            <Home size={18} />
            {actionText}
          </Link>

          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            <RefreshCcw size={18} />
            נסה שנית
          </button>

          <button
            onClick={handleGoBack}
            className="flex items-center justify-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
          >
            <Undo2 size={18} />
            חזרה אחורה
          </button>

        </div>
      </div>
    </div>
  );
}
