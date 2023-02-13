const Review = require("../models/reviewModel");
const AppError = require("../utils/appError.js");
const catchAsync = require("../utils/catchAsync");
const factory = require("./handlerFactory");

exports.getAllReviews = factory.getAll(Review);

exports.setTourUserIds = (req, res, next) => {
  // Allow nested routes --> without allowing anyone to add review as someone else
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  // req.body.user bude přepsán na req.user.id ---> nikdo nemůže postovat za někoho jiného
  next();
};

exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
