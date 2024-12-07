module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      flatId: String,
      name: String,
      phone: String,
      email: String,
      gDrvPath: String,
      status: String,
      remark: String,
      documents: [{docType: String, description: String, fname: String}],
    },
    { timestamps: true }
  );

  const Holder = mongoose.model("holder", schema);
  return Holder;
};