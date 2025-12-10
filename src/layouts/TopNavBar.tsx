
import { Search } from "lucide-react";
import NotificationToggle from "../components/NotificationToggle";
import ProfileToggle from "../components/ProfileToggle";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../redux/store";
import type { User } from "../redux/types";
import { TOKEN_KEY } from "../services/Payload";
import { Logout } from "../redux/slices/UserSlice";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";

export default function TopNavbar() {
  const user= useSelector<RootState>((state) => state.users.user) as User;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const handleLogOut = () => {
    window.localStorage.removeItem(TOKEN_KEY);
    dispatch(Logout());
    navigate("/login", {replace: true});
  }
  return (
    <div className="w-full flex items-center justify-between px-4 py-3 bg-white shadow-sm border-b">
      <div className="flex items-center gap-2">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-sm cursor-pointer" onClick={() => {navigate('/')}}>
          Infobase
        </button>
      </div>

      <div className="flex-1 flex justify-center px-6">
        
          {/* <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full bg-transparent outline-none text-gray-700"
          /> */}
          <SearchBar/>
        
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <NotificationToggle />
        {/* <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span> */}
        </div>

        <ProfileToggle
          name={user.name}
          avatarUrl={null}
          onViewProfile={() => {
            console.log("view profile");
          }}
        onLogout={handleLogOut}
      />
      </div>
    </div>
  );
}
