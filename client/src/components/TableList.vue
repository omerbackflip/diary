<template>
  <div class="list row">
    <!-- <v-layout row wrap style="padding: 0px"> -->
      <v-flex xs12 md6 mt-5>
        <v-data-table :headers="headers" 
                      :items="tableID"
                      disable-pagination
                      hide-default-footer
                      fixed-header
                      height="70vh"
                      @click:row="filterTbl"
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
              </v-row>
              <export-excel
                :data="tables"
                type="xlsx"
                name="all-tables"
                title="All Tables"
                footer="This is footer">
                <v-btn x-small class="btn btn-danger">
                  <v-icon small>mdi-download</v-icon>
                </v-btn>
              </export-excel>
            </v-toolbar>           
          </template>
          <template v-slot:[`item.actions`]="{ item }"> 
            <!-- <v-icon small @click="editOne(item._id)">mdi-pencil</v-icon> -->
            <div>
              <v-icon small @click="(itemToEdit === item._id) ? updateOne(item) : setEdit(item)">
                {{(itemToEdit === item._id) ? "mdi-floppy" : "mdi-pencil"}}
              </v-icon>
              <v-icon small @click="deleteOne(item._id)">mdi-delete</v-icon>
            </div>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.description"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.description}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_id`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_id"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.table_id}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_code`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_code"
                            :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.table_code}}</span>
            </div>
          </template>
        </v-data-table>
      </v-flex>

      <!-- SECOND TABLE -->
      <v-flex xs12 md6 mt-5>
        <v-data-table :headers="headers" 
                      :items="tableCode"
                      disable-pagination
                      dense
                      :search="search"
                      hide-default-footer
                      fixed-header
                      height="70vh"
                      mobile-breakpoint="0"
                      class="elevation-3 hebrew"
                      loading = "isLoading"
                      loading-text="Loading... Please wait">
          <template v-slot:top>
            <v-toolbar>
              <v-row style="justify-content: center;">
                <v-col cols="6">
                  <v-text-field
                    v-model="search"
                    append-icon="mdi-magnify"
                    label="חיפוש"
                    single-line
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="tableTitle" solo disabled hide-details style="text-align-last: center;">  {{tableTitle}} </v-text-field>
                </v-col>
              </v-row>
            </v-toolbar>           
          </template>
          <template v-slot:[`item.actions`]="{ item }"> 
            <td @click.stop>
              <div>
                <v-icon small @click="(itemToEdit === item._id) ? updateOne(item) : setEdit(item)">
                  {{(itemToEdit === item._id) ? "mdi-floppy" : "mdi-pencil"}}
                </v-icon>
                <v-icon small @click="deleteOne(item._id)">mdi-delete</v-icon>
              </div>
            </td>
          </template>
          <template v-slot:[`item.GDFileId`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.GDFileId" :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.GDFileId}}</span>
            </div>
          </template>
          <template v-slot:[`item.description`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.description" :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.description}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_id`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_id" :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.table_id}}</span>
            </div>
          </template>
          <template v-slot:[`item.table_code`]="{ item }"> 
            <div v-if = "itemToEdit === item._id">
              <v-text-field v-model="item.table_code" :id="`itemEdit-${item._id}`"/>
            </div>
            <div v-else>
              <span> {{item.table_code}}</span>
            </div>
          </template>
        </v-data-table>
      </v-flex>

      <!-- ADD NEW TABLE -->
      <v-flex md8 align-self-center>
        <v-footer color="primary lighten-1" align="center" class="mt-2" elevation="10">
          <v-form ref="form">
            <v-row>
              <v-col >
                <v-text-field v-model="tblFields.table_id" label="ID" :rules="fldRules"></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.table_code" label="Code" required></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.description" label="Description" required></v-text-field>
              </v-col>
              <v-col >
                <v-text-field v-model="tblFields.GDFileId" label="GDFileId" required></v-text-field>
              </v-col>
            </v-row>
            <v-btn @click="addToTable"> -Add- </v-btn>
            <v-btn class="mx-3" @click="clearForm">Clear</v-btn>
          </v-form>
        </v-footer>
      </v-flex>

    <!-- </v-layout> -->
  </div>
</template>



<script>
import { TABLE_MODEL } from '../constants/constants';
import apiService from '../services/apiService';
import excel from "vue-excel-export";
import Vue from "vue";

Vue.use(excel);


export default {
  name: "table-list",
  data() {
    return {
      tables: [],
      tableID: [],
      tableCode: [],
      tableTitle: '',
      search: '',
      headers:[
        { text: "ID", value: "table_id", class: 'success title'},
        { text: "CODE", value: "table_code", class: 'success title'},
        { text: "Description", value: "description", class: 'success title', groupable: false },
        { text: "GDFileId", value: "GDFileId", class: 'success title', groupable: false },
        { text: "Act.", value: "actions", sortable: false, class: 'success title', groupable: false  },
      ],
      isLoading: false,
      itemToEdit: "",
      tblFields: {
        table_id:         "",
        table_code:       "",
        description:"",
      },
      fldRules: [v => !!v || 'Field is required'],
    };
  },

  methods: {
    retrieveTables() {
      apiService.getMany({model: TABLE_MODEL})
        .then((response) => {
          this.tables = response.data;
          this.tableID = response.data.filter(item => item.table_id === 99);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    deleteOne(id) {
      if (window.confirm('Are you sure you want to delete one item ?')){
        apiService.deleteOne({model: TABLE_MODEL ,id})
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
      this.retrieveTables();
    },

    clearForm (){
      this.$refs.form.reset()
    },

    editOne(id) {
      this.$router.push({ name: "table-details", params: { id: id } });
    },

    updateOne(item) {
      apiService.update(item._id, item, {model: TABLE_MODEL})
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

    addToTable() {
      apiService.create(this.tblFields,{ model: TABLE_MODEL})
        .then(response => {
          this.tblFields.id = response.data.id;
          this.refreshList();
          this.clearForm();
        })
        .catch(e => {
          console.log(e);
        });
    },

    filterTbl(row) {
      this.tableCode = this.tables.filter(item => item.table_id === row.table_code)
      this.tableTitle = row.description;
    },

  },

  computed: {

  },

  mounted() {
    this.retrieveTables();
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
</style>
