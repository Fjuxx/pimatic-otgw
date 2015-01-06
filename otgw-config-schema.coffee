module.exports = {
  title: "OTGW config"
  type: "object"
  properties:
    host:
      description: "The IP of the OTGW monitor"
      type: "string"
      default: "127.0.0.1"
    port:
      description: "The port of the OTGW monitor relay (Default: 7686)"
      type: "integer"
      default: 7686
}