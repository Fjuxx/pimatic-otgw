module.exports = {
  title: "otgw-thermostat device config schemas"
  OTGWMainThermostat: {
    title: "OTGWMainThermostat config options"
    type: "object"
    properties: {}
  }
  OTGWHeatingThermostat: {
    title: "OTGWHeatingThermostat config options"
    type: "object"
    properties:
      guiShowModeControl: 
        description: "Show the mode buttons in the gui"
        type: "boolean"
        default: true
      guiShowPresetControl:
        description: "Show the preset temperatures in the gui"
        type: "boolean"
        default: true
      guiShowTemperatueInput:
        description: "Show the temperature input spinbox in the gui"
        type: "boolean"
        default: true   
      comfyTemp:
        description: "The defined comfy temperature"
        type: "number"
        default: 21
      ecoTemp:
        description: "The defined eco mode temperature"
        type: "number"
        default: 17
  }
  OTGWThermostat: {
    title: "OTGWThermostat config options"
    type: "object"
    properties: {}
  }
}