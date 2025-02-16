module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      topic: String,
      topic_id: Number,
      description: String,
      measure: String,
      price: Number,
    },
    { timestamps: true }
  );

  const Price = mongoose.model("price", schema);
  return Price;
};