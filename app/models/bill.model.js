module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      flatId: Number,
      bill_id: Number,
      date: Date,
      line: Number,
      topic_id: Number,
      amount: Number,
      tprice: Number,
      charge_type: String,
      toPay: Number,
      remark: String,
    },
    { timestamps: true }
  );

  const Bill = mongoose.model("bill", schema);
  return Bill;
};