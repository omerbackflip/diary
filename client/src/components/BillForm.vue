<template>
  <v-dialog v-model="showBill" width="1200">
    <div class="list row">
      <v-flex xs12 mt-5>
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
                  <v-btn @click="addRow">+</v-btn>
                </v-col>
                {{ holder.name }} - {{ holder.flatId }}
              </v-row>
            </v-toolbar>           
          </template>
          <template v-slot:[`item.topic_id`]="{ item }">
          <v-select v-model="item.topic_id" :items="topic_ids" item-value="topic_id" dense hide-details flat solo>
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
            <v-text-field
              v-model="item.amount"
              dense
              hide-details
              flat solo
              @input="updateTotal(item)"
            >
            </v-text-field>
          </template>
          <template v-slot:[`item.charge_type`]="{ item }">
            <v-select v-model="item.charge_type" :items="payCode" dense hide-details flat solo></v-select>
          </template>

        </v-data-table>
      </v-flex>
    </div>
  </v-dialog>
</template>



<script>
import { BILL_MODEL, NEW_BILL, PRICE_MODEL, loadTable } from '../constants/constants';
import apiService from '../services/apiService';
export default {
  name: "bill-form",
  props: ['holder','showBill'],
  data() {
    return {
      billItems: [],
      search: '',
      headers:[
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
      ],
      isLoading: false,
      itemToEdit: "",
      fldRules: [v => !!v || 'Field is required'],
      topic_ids: [],
      editingField: null,
      payCode: [],
    };
  },

  methods: {
    retrieveBills() {
      apiService.getMany({model: BILL_MODEL})
        .then(async(response) => {
          this.billItems = response.data.filter((item) => {
            return item.flatId == this.holder.flatId.substring(4, 6)
          });
          // Using a loop (instead of map) to handle the async logic properly
          for (let i = 0; i < this.billItems.length; i++) {
            let item = this.billItems[i];
            let priceTag = await apiService.getMany({ model: PRICE_MODEL, topic_id: item.topic_id });
            this.billItems[i].description = priceTag.data[0].description;
            this.billItems[i].measure = priceTag.data[0].measure;
            this.billItems[i].price = priceTag.data[0].price;
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

    refreshList() {
      this.retrieveBills();
    },

    clearForm (){
      this.$refs.form.reset()
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

    setEdit(item) {
      this.itemToEdit = item._id;
      setTimeout( () => {
        document.getElementById(`itemEdit-${item._id}`).focus()
      }, 1 );
    },

    updateTotal(item){
      console.log(item)
      item.tprice = item.price * item.amount
    },

    addRow() {
      this.billItems.push(NEW_BILL)
    }
  },

  async mounted() {
    this.payCode = (await loadTable(9)).map((code) => code.description);
    // this.retrieveBills();
  },

  watch: {
    holder() {
      this.retrieveBills();
    },
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
