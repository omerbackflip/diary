<template>
  <div class="list row">
    <v-layout row wrap>
      <v-flex xs12 md3>
        <v-text-field
          v-model="search"
          append-icon="mdi-magnify"
          label="חיפוש"
          single-line
          hide-details
        ></v-text-field>
        <v-data-table
          :headers="headers"
          :items="tableID"
          :search="search"
          disable-pagination
          hide-default-footer
          fixed-header
          height="75vh"
          @click:row="filterTbl"
          dense
          class="elevation-3"
          loading="isLoading"
          loading-text="Loading... Please wait"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <!-- <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon> -->
            <div>
              <v-icon
                small
                @click="
                  itemToEdit === item.id ? updateOne(item) : setEdit(item)
                "
              >
                {{ itemToEdit === item.id ? "mdi-floppy" : "mdi-pencil" }}
              </v-icon>
              <v-icon small @click="deleteOne(item.id)">mdi-delete</v-icon>
            </div>
          </template>
          <template v-slot:[`item.description`]="{ item }">
            <div v-if="itemToEdit === item.id">
              <v-text-field
                v-model="item.description"
                :id="`itemEdit-${item.id}`"
              />
            </div>
            <!-- <div v-else @click="setEdit(item)"> -->
            <div v-else @click="setEdit(item)">
              <span> {{ item.description }}</span>
            </div>
          </template>
          <template v-slot:[`item.table_id`]="{ item }">
            <div v-if="itemToEdit === item.id">
              <v-text-field
                v-model="item.table_id"
                :id="`itemEdit-${item.id}`"
              />
              <!-- @blur="updateOne(item)"/> -->
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{ item.table_id }}</span>
            </div>
          </template>
          <template v-slot:[`item.table_code`]="{ item }">
            <div v-if="itemToEdit === item.id">
              <v-text-field
                v-model="item.table_code"
                :id="`itemEdit-${item.id}`"
              />
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{ item.table_code }}</span>
            </div>
          </template>
        </v-data-table>
      </v-flex>
      <v-flex xs12 md4 mt-3>
        <div class="title">{{ tableTitle ? tableTitle : "Title" }}</div>
        <v-data-table
          :headers="headers"
          :items="tableCode"
          disable-pagination
          dense
          hide-default-footer
          fixed-header
          height="75vh"
          class="elevation-3"
          loading="isLoading"
          loading-text="Loading... Please wait"
        >
          <template v-slot:[`item.actions`]="{ item }">
            <!-- <v-icon small @click="editOne(item.id)">mdi-pencil</v-icon> -->
            <div>
              <v-icon
                small
                @click="
                  itemToEdit === item.id ? updateOne(item) : setEdit(item)
                "
              >
                {{ itemToEdit === item.id ? "mdi-floppy" : "mdi-pencil" }}
              </v-icon>
              <v-icon small @click="deleteOne(item.id)">mdi-delete</v-icon>
            </div>
          </template>
          <template v-slot:[`item.description`]="{ item }">
            <div v-if="itemToEdit === item.id">
              <v-text-field
                v-model="item.description"
                :id="`itemEdit-${item.id}`"
              />
            </div>
            <!-- <div v-else @click="setEdit(item)"> -->
            <div v-else @click="setEdit(item)">
              <span> {{ item.description }}</span>
            </div>
          </template>
          <template v-slot:[`item.table_id`]="{ item }">
            <div v-if="itemToEdit === item.id">
              <v-text-field
                v-model="item.table_id"
                :id="`itemEdit-${item.id}`"
              />
              <!-- @blur="updateOne(item)"/> -->
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{ item.table_id }}</span>
            </div>
          </template>
          <template v-slot:[`item.table_code`]="{ item }">
            <div v-if="itemToEdit === item.id">
              <v-text-field
                v-model="item.table_code"
                :id="`itemEdit-${item.id}`"
              />
            </div>
            <div v-else @click="setEdit(item)">
              <span> {{ item.table_code }}</span>
            </div>
          </template>
        </v-data-table>
      </v-flex>

      <v-flex md10>
        <v-footer
          color="primary lighten-1"
          align="center"
          class="mt-2"
          elevation="10"
        >
          <v-form ref="form">
            <v-row>
              <v-col>
                <v-text-field
                  v-model="tblFields.id"
                  label="ID"
                  :rules="fldRules"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="tblFields.code"
                  label="Code"
                  required
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="tblFields.description"
                  label="Description"
                  required
                ></v-text-field>
              </v-col>
            </v-row>
            <v-btn @click="addToTable"> -Add- </v-btn>
            <v-btn class="mx-3" @click="clearForm">Clear</v-btn>
          </v-form>
        </v-footer>
      </v-flex>
    </v-layout>
  </div>
</template>



<script>
import { TABLE_MODEL } from "../constants/constants";
import apiService from "../services/apiService";

export default {
  name: "table-list",
  data() {
    return {
      tables: [],
      tableID: [],
      tableCode: [],
      tableTitle: "",
      currInvoice: null,
      currentIndex: -1,
      search: "",
      headers: [
        { text: "ID", value: "table_id", class: "success title" },
        { text: "CODE", value: "table_code", class: "success title" },
        {
          text: "Description",
          value: "description",
          class: "success title",
          groupable: false,
        },
        {
          text: "Act.",
          value: "actions",
          sortable: false,
          class: "success title",
          groupable: false,
        },
      ],
      isLoading: true,
      itemToEdit: "",
      tblFields: {
        id: "",
        code: "",
        description: "",
      },
      fldRules: [(v) => !!v || "Field is required"],
    };
  },

  methods: {
    deleteOne(id) {
      if (window.confirm("Are you sure you want to delete one item ?")) {
        apiService
          .deleteOne({ model: TABLE_MODEL, id })
          .then((response) => {
            console.log(response.data);
            this.refreshList();
          })
          .catch((e) => {
            console.log(e);
          });
      }
    },

    retrieveTables() {
      apiService
        .getMany({ model: TABLE_MODEL })
        .then((response) => {
          this.tables = response.data;
          this.tableID = response.data.filter((item) => item.table_id === 99);
        })
        .catch((e) => {
          console.log(e);
        });
    },

    refreshList() {
      this.retrieveTables();
      this.currInvoice = null;
      this.currentIndex = -1;
    },

    clearForm() {
      this.$refs.form.reset();
    },

    editOne(id) {
      this.$router.push({ name: "table-details", params: { id: id } });
    },

    updateOne(item) {
      apiService
        .update(item.id, item, { model: TABLE_MODEL })
        .then((response) => {
          console.log(response.data);
          this.message = "The updateOne() updated successfully!";
        })
        .catch((e) => {
          console.log(e);
        });
      this.itemToEdit = "";
    },

    setEdit(item) {
      this.itemToEdit = item.id;
      setTimeout(() => {
        document.getElementById(`itemEdit-${item.id}`).focus();
      }, 1);
    },

    addToTable() {
      var data = {
        table_id: this.tblFields.id,
        table_code: this.tblFields.code,
        description: this.tblFields.description,
      };
      apiService
        .create(data, { model: TABLE_MODEL })
        .then((response) => {
          this.tblFields.id = response.data.id;
          this.refreshList();
          this.clearForm();
        })
        .catch((e) => {
          console.log(e);
        });
    },

    filterTbl(row) {
      this.tableCode = this.tables.filter(
        (item) => item.table_id === row.table_code
      );
      this.tableTitle = row.description;
    },
  },

  computed: {},

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
}
.title {
  border: 3px solid blue;
  text-align: center;
  font-weight: bold;
  font-size: 16px;
}
</style>
