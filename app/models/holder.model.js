module.exports = mongoose => {
  var schema = mongoose.Schema(
    {
      flatId: String,
      name: String,
      phone: String,
      email: String,
      GDParantFolder: String,
      status: String,
      remark: String,
      priority: Number,
      payedFile:{type: Boolean, default: false},
      sendPlans:{type: Boolean, default: false},
      gotOffer:{type: Boolean, default: false},
      payedOffer:{type: Boolean, default: false},
      bniya:    {type: Boolean, default: false},
      hashmal:  {type: Boolean, default: false},
      mitbach:  String,
      senitar:  String,
      documents: [{ docType: String, 
                    description: String, 
                    fname: String, 
                    fid: String, 
                    url: String,
                    amount: Number,
                  }],
    },
    { timestamps: true }
  );

  const Holder = mongoose.model("holder", schema);
  return Holder;
};