module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      flatId: Number,
      floor: Number,
      directions: String,
      rooms: Number,
      warehouseId: Number,
      warehouseArea: Number,
      parkingId: Number,
      flatArea: Number,
      balconyArea: Number,
      equivalentArea: Number,
      flatPrice: Number,
      status: String,
      flatChart: String,
    },
    { timestamps: true }
  );

  const PriceList = mongoose.model("priceList", schema);
  return PriceList;
};