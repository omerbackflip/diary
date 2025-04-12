<template>
  <v-dialog v-model="dialogBillForm" max-width="80%" attach="body"> <!-- attach="body" ensures it behaves as a modal overlay without restrictions of parent component -->
    <v-card>
      <v-data-table :headers=getHeaders() 
                    :items="billItems"
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
              <v-col style="font-size: 1.25rem; font-weight: bold;">
                {{ holder.name }} - דירה {{ holder.flatId.substring(4,6) }} 
                                  - בניין {{ holder.flatId.substring(0,1) === 'N' ? 'צפוני' : 'דרומי' }}
                                  - קומה {{ holder.flatId.substring(1,2) }}
              </v-col>
              <v-col style="text-align-last: left;">
                <v-btn @click="addRow(holder)" small><v-icon>mdi-plus-circle</v-icon></v-btn>
              </v-col>
            </v-row>
          </v-toolbar>           
        </template>
        <template v-slot:[`item.actions`]="{ item }"> 
          <div>
            <v-icon small @click="removeRow(item.line)">mdi-delete</v-icon>
          </div>
        </template>
        <template v-slot:[`item.topic_id`]="{ item }">
        <v-select v-model="item.topic_id" :items="topic_ids" item-value="topic_id" @change="updateItemDetails(item)" dense hide-details flat solo>
          <template v-slot:selection="{ item }">
            <div class="combobox-item">
              <div class="right">
                <span>{{ item.topic_id }} - {{ item.description }}</span>
              </div>
              <span class="left">{{ item.price ? item.price.toLocaleString() : '' }}</span>
            </div>
          </template>
          <template v-slot:item="{ item }">
            <div v-if="item" class="combobox-item">
              <div class="right">
                <span>{{ item.topic_id }}</span>
                <span> - </span>
                <span>{{ item.description }}</span>
              </div>
              <span class="left">{{ item.price ? item.price.toLocaleString() : '' }}</span>
            </div>
          </template>
        </v-select>
        </template>
        <template v-slot:[`item.amount`]="{ item }">
          <v-text-field v-model="item.amount" @input="updateTotal(item)" dense hide-details flat solo/>
        </template>
        <template v-slot:[`item.remark`]="{ item }">
          <v-text-field v-model="item.remark" dense hide-details flat solo/>
        </template>
        <template v-slot:[`item.tprice`]="{ item }">
          <span>{{ item.tprice ? item.tprice.toLocaleString() : ''}}</span>
        </template>
        <template v-slot:[`item.charge_type`]="{ item }">
          <v-select v-model="item.charge_type" @change="updateTotal(item)" :items="payCode" dense hide-details flat solo></v-select>
        </template>
      </v-data-table>
      <v-card-actions>
        <v-chip @click="dialogBillForm=false">בטל</v-chip>
        <v-chip style="margin-left: 5px;" @click="writeBillData">עדכן</v-chip>
        <v-spacer></v-spacer>
        <v-chip>סה"כ חשבון : {{ totaltPrice.toLocaleString() }}</v-chip>
        <v-spacer></v-spacer>
        <v-chip>סה"כ לתשלום : {{ totalToPay.toLocaleString() }}</v-chip>
      </v-card-actions>
     </v-card>
  </v-dialog>
</template>



<script>
import { BILL_MODEL, NEW_BILL, BILL_HEADERS, PRICE_MODEL, loadTable, isMobile } from '../constants/constants';
import apiService from '../services/apiService';
import specificServiceEndPoints from '../services/specificServiceEndPoints';
export default {
  name: "bill-form",
  data() {
    return {
      billItems: [],
      isLoading: false,
      itemToEdit: "",
      topic_ids: [],
      editingField: null,
      payCode: [],
      dialogBillForm: false,
			holder: {},
      bill_id: 1,
    };
  },

  methods: {
    getHeaders() {
			if (isMobile()) {
				return BILL_HEADERS;
			} else {
				return BILL_HEADERS;
			}
		},
    retrieveBills() {
      let flatId = this.holder.flatId.substring(4, 6)
      apiService.getMany({model: BILL_MODEL,flatId})
        .then(async(response) => {
          this.billItems = response.data.sort((a, b) => a.line - b.line);
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

      apiService.getMany({model: PRICE_MODEL}) // get data for dropdown list
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

    async writeBillData() {
      this.isLoading = true
      try {
        this.billItems.map((item) => {
          delete item.description;
          delete item.measure;
          delete item.price;
        })
        let response = await specificServiceEndPoints.bulkWriteApi(this.billItems, {model: BILL_MODEL});
        if (response) {
          this.resolve(true);
        }
      } catch (error) {
        this.msg = JSON.stringify(error.message);
        setTimeout(() => {
          this.msg = "";
        }, 3000);
        console.log(error);
      }
      this.isLoading = false
      this.dialogBillForm = false
    },
    
    updateTotal(item){
      item.tprice = item.price * item.amount
      item.charge_type === 'רגיל' ? (item.toPay = item.price * item.amount) : (item.toPay = 0)
    },

    addRow(holder) {
      let newBill = NEW_BILL
      newBill.flatId = Number(holder.flatId.substring(4, 6))
      newBill.bill_id = this.bill_id
      newBill.line = this.billItems.length+1
      newBill.charge_type = 'רגיל'
      this.billItems.push(Object.assign({}, newBill))
    },

    removeRow(line) {
      if (window.confirm('Are you sure you want to delete item '+line+' ?')){
        this.billItems = this.billItems.filter(item => item.line !== line);
      }
    },

    updateItemDetails(item) {
      const selectedTopic = this.topic_ids.find(t => t.topic_id === item.topic_id);
      if (selectedTopic) {
        item.description = selectedTopic.description;
        item.measure = selectedTopic.measure;
        item.price = selectedTopic.price;
      }
      this.updateTotal(item)
    }
  },

  async mounted() {
    this.payCode = (await loadTable(10)).map((code) => code.description);
  },

  watch: {

  },

  computed: {
    totaltPrice() {
      return this.billItems.reduce((sum, item) => sum + (item.tprice || 0), 0);
    },
    totalToPay() {
      return this.billItems.reduce((sum, item) => sum + (item.toPay || 0), 0);
    }
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
