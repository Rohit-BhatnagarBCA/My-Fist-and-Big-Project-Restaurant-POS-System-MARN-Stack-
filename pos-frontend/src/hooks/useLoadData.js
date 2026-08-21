import {
  useDispatch,
} from "react-redux";

import {
  getUserData,
} from "../https";

import {
  useEffect,
  useState,
} from "react";

import {
  removeUser,
  setUser,
} from "../redux/slices/userSlice";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

const PUBLIC_ROUTES = [
  "/auth",
  "/about",
];

const useLoadData = () => {
  const dispatch =
    useDispatch();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  useEffect(() => {
    const currentPath =
      location.pathname;

    // --------------------------------------------------------
    // Public pages do not need auth validation.
    // This prevents unnecessary 401 requests on /auth and /about.
    // --------------------------------------------------------

    if (
      PUBLIC_ROUTES.includes(
        currentPath
      )
    ) {
      setIsLoading(false);
      return;
    }

    const fetchUser =
      async () => {
        try {
          const {
            data,
          } =
            await getUserData();

          const userData =
            data?.data;

          if (!userData) {
            throw new Error(
              "User data not found!"
            );
          }

          const restaurant =
            userData.restaurantId ||
            null;

          const subscription =
            restaurant?.subscription ||
            userData.subscription ||
            null;

          dispatch(
            setUser({
              _id:
                userData._id,

              name:
                userData.name,

              email:
                userData.email,

              phone:
                userData.phone,

              role:
                userData.role,

              restaurantId:
                restaurant?._id ||
                null,

              restaurant,

              subscription,

              isAuth: true,
            })
          );
        } catch (error) {
          dispatch(
            removeUser()
          );

          console.log(
            "Auth Fetch Error:",
            error
          );

          navigate(
            "/auth",
            {
              replace: true,
            }
          );
        } finally {
          setIsLoading(false);
        }
      };

    fetchUser();
  }, [
    dispatch,
    navigate,
    location.pathname,
  ]);

  return isLoading;
};

export default useLoadData;