import { useDispatch } from "react-redux";
import { getUserData } from "../https";
import { useEffect, useState } from "react";
import { removeUser, setUser } from "../redux/slices/userSlice";
import { useNavigate, useLocation } from "react-router-dom";

const useLoadData = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await getUserData();
        const userData = data.data;

        // 🟢 BYPASS: Hamesha Dummy Active Subscription assign karein
        const dummySubscription = {
          status: "active",
          planName: "Pro Business (Unlimited)",
          // Aaj se 1 saal aage ki expiry date
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };

        dispatch(
          setUser({
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            role: userData.role,
            // Original subscription ki jagah active plan bhej dein
            subscription: userData.subscription || dummySubscription
          })
        );
      } catch (error) {
        dispatch(removeUser());

        const publicRoutes = ["/auth", "/about"];
        if (!publicRoutes.includes(location.pathname)) {
          navigate("/auth");
        }
        console.log("Auth Fetch Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [dispatch, navigate, location.pathname]);

  return isLoading;
};

export default useLoadData;