<template>
  <v-dialog v-model="dialogBillForm" max-width="80%" attach="body"> <!-- attach="body" ensures it behaves as a modal overlay without restrictions of parent component -->
    <card>
      <v-data-table :headers="headers" 
                    :items="billItems"
                    :search="search"
                    disable-pagination
                    hide-default-footer
                    fixed-header
                    height="70vh"
                    dense
                    mobile-breakpoint="0"
                    class="elevation-3 hebrew"
                    loading = "isLoading"
                    loading-text="Loading... Please wait">
        <template v-slot:top>
          <v-toolbar>
            <v-row style="justify-content: center;">
              <v-col cols="5">
                <v-text-field
                  v-model="search"
                  append-icon="mdi-magnify"
                  label="חיפוש"
                  single-line
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col>
                <v-btn @click="addRow(holder)">+</v-btn>
              </v-col>
              {{ holder.name }} - {{ holder.flatId }}
            </v-row>
          </v-toolbar>           
        </template>
        <!-- <template v-slot:[`item.actions`]="{ item }"> 
          <div>
            <v-icon small @click="(itemToEdit === item._id) ? updateOne(item) : setEdit(item)">
              {{(itemToEdit === item._id) ? "mdi-floppy" : "mdi-pencil"}}
            </v-icon>
            <v-icon small @click="(itemToEdit === item._id) ? itemToEdit ='' : deleteOne(item._id)"> 
              {{(itemToEdit === item._id) ? "mdi-close-box" : "mdi-delete"}}</v-icon>
          </div>
        </template> -->
        <template v-slot:[`item.topic_id`]="{ item }">
        <v-select v-model="item.topic_id" :items="topic_ids" item-value="topic_id" @change="updateItemDetails(item)" dense hide-details flat solo>
          <template v-slot:selection="{ item }">
            <span>{{ item.topic_id }}</span>
          </template>
          <template v-slot:item="{ item }">
            <div v-if="item" class="combobox-item">
              <div class="right">
                <span>{{ item.topic_id }}</span>
                <span> - </span>
                <span>{{ item.description }}</span>
              </div>
              <span class="left">{{ item.price }}</span>
            </div>
          </template>
        </v-select>
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          <v-text-field v-model="item.amount" @input="updateTotal(item)" dense hide-details flat solo/>
        </template>
        <template v-slot:[`item.charge_type`]="{ item }">
          <v-select v-model="item.charge_type" :items="payCode" dense hide-details flat solo></v-select>
        </template>
      </v-data-table>
      <v-card-actions>
        <v-btn @click="createMany">עדכן</v-btn>
      </v-card-actions>
     </card>
  </v-dialog>
</template>



<script>
import { BILL_MODEL, NEW_BILL, PRICE_MODEL, loadTable } from '../constants/constants';
import apiService from '../services/apiService';
export default {
  name: "bill-form",
  data() {
    return {
      billItems: [],
      search: '',
      headers:[
        { text: "line", value: "line", class: 'success title'},
        { text: "flatId", value: "flatId", class: 'success title'},
        { text: "bill_id", value: "bill_id", class: 'success title'},
        { text: "topic_id", value: "topic_id", class: 'success title', groupable: false },
        { text: "description", value: "description", class: 'success title', groupable: false },
        { text: "measure", value: "measure", class: 'success title', groupable: false },
        { text: "price", value: "price", class: 'success title', groupable: false },
        { text: "amount", value: "amount", class: 'success title', groupable: false },
        { text: "tprice", value: "tprice", sortable: false, class: 'success title', groupable: false  },
        { text: "charge_type", value: "charge_type", sortable: false, class: 'success title', groupable: false  },
        { text: "toPay", value: "toPay", sortable: false, class: 'success title', groupable: false  },
        { text: "remark", value: "remark", sortable: false, class: 'success title', groupable: false  },
        // { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: false,
      itemToEdit: "",
      fldRules: [v => !!v || 'Field is required'],
      topic_ids: [],
      editingField: null,
      payCode: [],
      dialogBillForm: false,
			holder: {},
      bill_id: 1,
      // isModified: false,
    };
  },

  methods: {
    retrieveBills() {
      let flatId = this.holder.flatId.substring(4, 6)
      apiService.getMany({model: BILL_MODEL,flatId})
        .then(async(response) => {
          this.billItems = response.data
          // this.billItems = response.data.map((item,line) =>{
          //   return {...item, line: line+1}
          // })
          // Using a loop (instead of map) to handle the async logic properly
          for (let i = 0; i < this.billItems.length; i++) {
            if (this.billItems[i].topic_id) {
              let topic_id = this.billItems[i].topic_id;
              let priceTag = await apiService.getMany({ model: PRICE_MODEL, topic_id});
              this.billItems = this.billItems.map((item, index) =>
                index === i
                  ? { ...item,
                      description: priceTag.data[0].description,
                      measure: priceTag.data[0].measure,
                      price: priceTag.data[0].price,
                    }
                  : item
              );
            }
          }
        })
        .catch((e) => {
          console.log(e);
        });

      apiService.getMany({model: PRICE_MODEL})
      .then((response) => {
        this.topic_ids = response.data.map((item) => {
          return {topic_id:item.topic_id, description:item.description, price:item.price}
        });
      })
      .catch((e) => {
        console.log(e);
      });
    },

    open(holder, isNewHolder) {
      this.isNewHolder = isNewHolder;
      this.holder = holder || {}; // Ensure holder is always an object
      this.retrieveBills();
      this.dialogBillForm = true;
      return new Promise((resolve) => {
        this.resolve = resolve;
      });
    },

    updateOne(item) {
      apiService.update(item._id, item, {model: BILL_MODEL})
        .then(response => {
          console.log(response.data);
          this.message = 'The updateOne() updated successfully!';
        })
        .catch(e => {
          console.log(e);
        });
        this.itemToEdit = '';
    },

    async createMany() {
        try {
          this.isLoading = true
          this.billItems.map((item) => {
            delete item.description;
            delete item.measure;
            delete item.price;
          })
          console.log(this.billItems)
          const result = Object.values(this.billItems)
          console.log (result)
          let response = await apiService.create(result, {model: BILL_MODEL});

          if (response) {
            this.resolve(true);
          }
        } catch (error) {
          this.msg = JSON.stringify(error.message);
          setTimeout(() => {
            this.msg = "";
          }, 3000);
          console.log(error);
          this.isLoading = false
        }
      },

    setEdit(item) {
      this.itemToEdit = item._id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item._id}`).focus()
      }, 1 );
    },

    updateTotal(item){
      item.tprice = item.price * item.amount
    },

    addRow(item) {
      let newBill = NEW_BILL
      newBill.flatId = Number(item.flatId.substring(4, 6))
      newBill.bill_id = this.bill_id
      newBill.line = this.billItems.length+1
      this.billItems.push(Object.assign({}, newBill))
      console.log(this.billItems)
      // this.billItems.unshift(newBill);
      // this.createOne(newBill);
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        apiService.deleteOne({model: BILL_MODEL ,id})
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    updateItemDetails(item) {
      const selectedTopic = this.topic_ids.find(t => t.topic_id === item.topic_id);
      if (selectedTopic) {
        item.description = selectedTopic.description;
        item.measure = selectedTopic.measure;
        item.price = selectedTopic.price;
      }
    }
  },

  async mounted() {
    this.payCode = (await loadTable(10)).map((code) => code.description);
  },

  watch: {

  },

  computed: {

  },

};

</script>

<style>
.list {
  text-align: left;
  max-width: auto;
  margin: auto;
  justify-content: center;
}
.title {
border: 3px solid blue;
text-align: center;
font-weight: bold;
font-size: 16px;
}
.hebrew {
  direction: rtl;
  text-align-last: right !important
}
.v-toolbar__content {
  justify-content: center;
}
.v-list-item {
  direction: rtl;
  justify-content: right;
}
/* .v-text-field {
  border-bottom: none !important;
}
.v-text-field.show-underline {
  border-bottom: 1px solid var(--v-theme-primary);
} */
.combobox-item {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.left {
  font-weight: bold;
}
.right {
  text-align: right;
}
</style>
