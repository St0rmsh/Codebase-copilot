import { useSelector, useDispatch } from "react-redux";
import Toast from "./Toast";
import { dismissToast } from "../App/toastSlice";

const ToastContainer = () => {
  const toasts = useSelector((state) => state.toast.toasts);
  const dispatch = useDispatch();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={(id) => dispatch(dismissToast(id))} />
      ))}
    </div>
  );
};

export default ToastContainer;