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

const useLoadData =
  () => {
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
      const fetchUser =
        async () => {
          try {
            const {
              data,
            } =
              await getUserData();

            const userData =
              data.data;

            if (!userData) {
              throw new Error(
                "User data not found!"
              );
            }

            const restaurant =
              userData.restaurantId;

            const restaurantSubscription =
              restaurant
                ?.subscription ||
              null;

            const subscription =
              restaurantSubscription ||
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
                  userData.restaurantId ||
                  null,

                restaurant,

                subscription,
              })
            );
          } catch (error) {
            dispatch(
              removeUser()
            );

            const publicRoutes =
              [
                "/auth",
                "/about",
              ];

            if (
              !publicRoutes.includes(
                location.pathname
              )
            ) {
              navigate(
                "/auth",
                {
                  replace: true,
                }
              );
            }

            console.log(
              "Auth Fetch Error:",
              error
            );
          } finally {
            setIsLoading(
              false
            );
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