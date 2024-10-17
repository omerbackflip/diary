module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      name: String,
      phone: String,
      description: String,
      status: String,
      last_update: Date,
    },
    { timestamps: true }
  );

  const Lead = mongoose.model("lead", schema);
  return Lead;
};