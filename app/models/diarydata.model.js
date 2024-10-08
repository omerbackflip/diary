module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      date: Date,
      director: Number,
      poalim: Number,
      traktor: Number,
      manitu: Number,
      shufel: Number,
      pipe: Number,
      bagger: Number,
      manof: Number,
      agoran: Number,
      yetzikot: String,
      homarim: String,
      shonot: String,
      description: String,
      medias: [{filename: String, uploadAt: Date}],
      pics: [String]
    },
    { timestamps: true }
  );

  const Diarydata = mongoose.model("diarydata", schema);
  return Diarydata;
};