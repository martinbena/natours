const mongoose = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty!"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour."],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user."],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  } // aby se nám zobrazovaly v outputech hodnoty, které nejsou v DB, ale dají se z jiných hodnot vypočíst
);

// aby 1 user mohl udělat review jen u 1 tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  }); /* .populate({
    path: "tour",
    select: "-guides name",
  }); */

  next();
});

// reviewSchema.pre("save", function (next) {
//   console.log("Will save document...");
//   next();
// });

// reviewSchema.post("save", function (doc, next) {
//   console.log(doc);
//   next();
// });

// průměrné hodnocení tůry
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: "$tour",
        nRatings: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]); // vypočítá počet ratingů a jejich průměr
  // console.log(stats);

  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating,
    }); // přiřadí hodnoty do příslušné tour podle ID z params
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post("save", function () {
  // this points to current review
  this.constructor.calcAverageRatings(this.tour);
  // Review ještě není deklarováno v tento moment, když ho posuneme dolů, tak to nebude fungovat, proto this.contructor --- je důležité udělat toto, až poté, co se záznam uloží do DB, proto post místo pre save
});

// update / delete review se musí projevit v kalkulaci
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  // console.log(this.r);
  // this - current query
  next();
});

// v pre má rating stále stejnou hodnotu, musíme najít tůru, uložit jí a předat jí do post
reviewSchema.post(/^findOneAnd/, async function () {
  // await this.findOne() does NOT work here, query has already executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
