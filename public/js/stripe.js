import axios from "axios";
import { showAlert } from "./alerts";

export const bookTour = async tourId => {
  const stripe = Stripe(
    "pk_test_51MZs2QHxNNVQR7fCme6sa4m9UmD8R39HYIyuX6WwWnKHuRNdNSatVjN0vFjJj4jNDS5yz4l7W7ZThRDDmtISvCyA00NZNGsNPe"
  );

  try {
    // 1) Get chcecout session from API
    // const session = await axios(
    //   `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
    // );
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
