module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      table_id: Number,
      table_code: Number,
      description: String,
      textValue: String,
      numeric: Number
    },
    { timestamps: true }
  );

  const Table = mongoose.model("table", schema);
  return Table;
};