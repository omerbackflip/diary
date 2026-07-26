module.exports = mongoose => {
  const schema = mongoose.Schema(
    {
      flatId: {
        type: Number,
        required: true,
        index: true,
        validate: {
          validator: async function(flatId) {
            return Boolean(
              await mongoose.model("holder").exists({ flatId })
            );
          },
          message: props => `No Holder exists with flatId ${props.value}`,
        },
      },
      description: {
        type: String,
        required: true,
        trim: true,
      },
      categoryCode: {
        type: Number,
        required: true,
        index: true,
        validate: {
          validator: async function(categoryCode) {
            return Boolean(
              await mongoose.model("table").exists({
                table_id: 21,
                table_code: categoryCode,
              })
            );
          },
          message: props =>
            `categoryCode ${props.value} does not exist in table_id 21`,
        },
      },
      statusCode: {
        type: Number,
        required: true,
        default: 1,
        index: true,
        validate: {
          validator: async function(statusCode) {
            return Boolean(
              await mongoose.model("table").exists({
                table_id: 20,
                table_code: statusCode,
              })
            );
          },
          message: props =>
            `statusCode ${props.value} does not exist in table_id 20`,
        },
      },
      targetDate: {
        type: Date,
        default: null,
      },
      photos: [
        {
          _id: false,
          fileId: String,
          folderId: String,
          url: String,
          name: String,
          mimeType: String,
          mediaType: String,
          capturedAt: Date,
        },
      ],
    },
    { timestamps: true }
  );

  schema.index({ flatId: 1, statusCode: 1 });
  schema.index({ statusCode: 1, targetDate: 1 });

  const FlatIssue = mongoose.model("flatIssue", schema);
  return FlatIssue;
};
