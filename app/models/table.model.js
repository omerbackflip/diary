module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      table_id: Number,
      table_code: Number,
      description: String,
    },
    { timestamps: true }
  );

  const Table = mongoose.model("table", schema);
  return Table;
};