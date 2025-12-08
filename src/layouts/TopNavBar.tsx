import NotificationToggle from "../components/NotificationToggle";
import ProfileToggle from "../components/ProfileToggle";
import SearchBar from "../components/SearchBar";

export default function TopNavbar() {
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-sm">
          Infobase
        </button>
      </div>

      {/* Centered search bar */}
      <div className="flex-1 flex justify-center px-6">
        <SearchBar />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <NotificationToggle />
        </div>

        <ProfileToggle
          name="Vivek Napit"
          avatarUrl={null}
          onViewProfile={() => {
            console.log("view profile");
          }}
          onLogout={() => {
            console.log("logout");
          }}
        />
      </div>
    </div>
  );
}