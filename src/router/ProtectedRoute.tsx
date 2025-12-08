import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../redux/store";
import { Logout, SetLoginDetails } from "../redux/slices/UserSlice";
import { getUser } from "../services/UserServices";
import { TOKEN_KEY } from "../services/Payload";

type Props = { children?: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const isLoggedIn = useSelector((state: RootState) => state.users.isLoggedIn);

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          if (mounted) {
            dispatch(Logout());
            setChecking(false);
          }
          return;
        }

        const user = await getUser();
        if (!mounted) return;

        if (user) {
          dispatch(SetLoginDetails(user));
        } else {
          dispatch(Logout());
        }
      } catch (err) {
        dispatch(Logout());
      } finally {
        if (mounted) setChecking(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (checking) {

    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
