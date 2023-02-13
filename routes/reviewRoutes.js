const express = require("express");
const reviewController = require("../controllers/reviewController");
const authController = require("../controllers/authController");

const router = express.Router({ mergeParams: true });

// POST /tour/scnscnasknc/reviews
// POST /reviews
// mergeParams zajistí, že obě cesty skončí na stejné cestě ("/"), v controlleru je filter a když se chceme podívat na reviews u 1 tour, dostaneme je podle tour ID

router.use(authController.protect);

router
  .route("/")
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo("user"),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route("/:id")
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo("user", "admin"),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo("user", "admin"),
    reviewController.deleteReview
  );
module.exports = router;
