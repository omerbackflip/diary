module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      date: Date,
      director: Number,
      poalim: Number,
      traktor: Number,
      manitu: Number,
      shufel: Number,
      bagger: Number,
      manof: Number,
      agoran: Number,
      yetzikot: String,
      homarim: String,
      shonot: String,
      description: String,
    },
    { timestamps: true }
  );

  const Diarydata = mongoose.model("diarydata", schema);
  return Diarydata;
};