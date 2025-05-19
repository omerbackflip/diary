module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: String,
      phone: String,
      description: String,
      status: String,
      arrivedFrom: String,
      interested: String,
      last_update: Date,
      email: String,
      trackDate: Date,
      trackRemark: String,
      adName: String,
      meeting: Boolean,
    },
    { timestamps: true }
  );

  const Lead = mongoose.model("lead", schema);
  return Lead;
};