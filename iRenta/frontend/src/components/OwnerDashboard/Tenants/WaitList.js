import { moveToRenterList } from "../../../global/api/Reservations";
export const Waitlist = ({ reservations }) => (
  <div>
    <h2>Waitlist</h2>
    {reservations.map((reservation) => (
      <div key={reservation?._id}>
        <p>{reservation?.seekerId?.info?.firstName}</p>
        <button
          onClick={() => moveToRenterList(reservation.seekerId)}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Move to Renter
        </button>
      </div>
    ))}
  </div>
);
