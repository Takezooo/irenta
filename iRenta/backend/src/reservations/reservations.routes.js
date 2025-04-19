router.get("/get-user-reservations/:userId", reservationsController.getUserReservations);
router.get("/check-user-reservation", reservationsController.CheckUserReservation); 