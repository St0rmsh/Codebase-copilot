import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { router } from "./router";
import { store } from "./store";
import { fetchCurrentUser } from "../features/Auth/state/authSlice";
import ToastContainer from "../components/ToastContainer";

const Hydrator = ({ children }) => {
  const dispatch = useDispatch();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrate = async () => {
      await dispatch(fetchCurrentUser());
      setHydrated(true);
    };
    hydrate();
  }, [dispatch]);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-base flex items-center justify-center">
        <p className="font-mono text-xs text-textMuted tracking-widest2 uppercase">
          Establishing Secure Session...
        </p>
      </div>
    );
  }

  return children;
};

function App() {
  return (
    <Provider store={store}>
      <Hydrator>
        <ToastContainer />
        <RouterProvider router={router} />
      </Hydrator>
    </Provider>
  );
}

export default App;