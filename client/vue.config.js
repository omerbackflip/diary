module.exports = {
  devServer: {
    port: 8084,
    proxy: 'http://localhost:8084'  // this row was added 26.04.25 to avoid the follwoing error in the console
                                    // GET http://192.168.1.233:8084/sockjs-node/info?t=1745648040218 net::ERR_CONNECTION_TIMED_OUT
  },

  transpileDependencies: [
    'vuetify'
  ]
}
