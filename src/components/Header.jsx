import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";
import UserActions from "./UserActions";
import SearchBar from "./SearchBar";

export default function Header() {
  const { user } = useContext(UserContext);

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between rtl">
      <div className="flex-shrink-0 order-1 md:order-1">
        <UserActions />
      </div>

      <div className="flex-grow px-4 order-2 md:order-2">
        <SearchBar />
      </div>

      <div className="flex-shrink-0 order-3 md:order-3">
        <a href="/">
          <div
            className="h-10 w-32 bg-center bg-contain bg-no-repeat"
            style={{
              backgroundImage: `url(${process.env.PUBLIC_URL}/assets/logo.png)`,
            }}
            aria-label="Logo"
          />
        </a>
      </div>
    </header>
  );
}
