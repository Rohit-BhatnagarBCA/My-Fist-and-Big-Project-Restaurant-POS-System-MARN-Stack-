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
  "/verify-email",
];

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
      const currentPath =
        location.pathname;

      /*
        Public routes do not need a session fetch.
      */
      if (
        PUBLIC_ROUTES.includes(
          currentPath
        )
      ) {
        setIsLoading(false);

        return;
      }

      /*
        IMPORTANT:
        When changing from /auth -> /,
        start loading BEFORE the old Redux state
        can be used by ProtectedRoutes.
      */
      setIsLoading(true);

      let cancelled =
        false;

      const fetchUser =
        async () => {
          try {
            const {
              data,
            } =
              await getUserData();

            if (
              cancelled
            ) {
              return;
            }

            const userData =
              data?.data;

            if (!userData) {
              throw new Error(
                "User data not found!"
              );
            }

            const restaurant =
              userData
                .restaurantId ||
              null;

            /*
              Restaurant subscription is primary.
              User subscription is fallback for legacy accounts.
            */
            const restaurantSubscription =
              restaurant
                ?.subscription;

            const userSubscription =
              userData.subscription;

            const subscription =
              restaurantSubscription &&
              (
                restaurantSubscription
                  .startDate ||
                restaurantSubscription
                  .expiryDate ||
                restaurantSubscription
                  .plan
              )
                ? restaurantSubscription
                : userSubscription ||
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

                isAuth:
                  true,
              })
            );
          } catch (error) {
            if (
              cancelled
            ) {
              return;
            }

            dispatch(
              removeUser()
            );

            console.error(
              "Auth Fetch Error:",
              error
            );

            navigate(
              "/auth",
              {
                replace:
                  true,
              }
            );
          } finally {
            if (
              !cancelled
            ) {
              setIsLoading(
                false
              );
            }
          }
        };

      fetchUser();

      return () => {
        cancelled =
          true;
      };
    }, [
      dispatch,
      navigate,
      location.pathname,
    ]);

    return isLoading;
  };

export default useLoadData;