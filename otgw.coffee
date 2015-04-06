module.exports = (env) ->

  Promise = env.require 'bluebird'
  assert = env.require 'cassert'
  _ = env.require 'lodash'
  OTGWConnection = require 'OTGW-Control'
  Promise.promisifyAll(OTGWConnection.prototype)
  M = env.matcher
  settled = (promise) -> Promise.settle([promise])

  class OTGWThermostatPlugin extends env.plugins.Plugin
 
    init: (app, @framework, @config) =>

      # Promise that is resolved when the connection is established
      @_lastAction = new Promise( (resolve, reject) =>
        @otgw = new OTGWConnection(@config.host, @config.port)
        @otgw.once("connected", resolve)
        @otgw.once('error', reject)
        return
      ).timeout(60000).catch( (error) ->
        env.logger.error "Error on connecting to OTGW relay: #{error.message}"
        env.logger.debug error.stack  
        return
      )

      @otgw.on('error', (error) =>
        env.logger.error "connection error: #{error}"
        env.logger.debug error.stack
      )

      @otgw.on("room_temperature", (data) =>
        env.logger.debug "got room_temperature: ", data
      )
      @otgw.on("remote_override_setpoint", (data) =>
        env.logger.debug "got remote_override_setpoint: ", data
      )
      @otgw.on("flame_status" , (data) =>
        env.logger.debug "Flame status: ", data
      )



      deviceConfigDef = require("./device-config-schema")
      @framework.deviceManager.registerDeviceClass("OTGWHeatingThermostat", {
        configDef: deviceConfigDef.OTGWHeatingThermostat,
        createCallback: (config, lastState) -> new OTGWHeatingThermostat(config, lastState)
      })

      @framework.deviceManager.registerDeviceClass("OTGWMainThermostat", {
        configDef: deviceConfigDef.OTGWMainThermostat,
        createCallback: (config, lastState) -> new OTGWMainThermostat(config, lastState)
      })

      @framework.deviceManager.registerDeviceClass("OTGWThermostat", {
        configDef: deviceConfigDef.OTGWThermostat,
        createCallback: (config) -> new OTGWThermostat(config)
      })

      # @framework.deviceManager.registerDeviceClass("MaxContactSensor", {
      #   configDef: deviceConfigDef.MaxContactSensor,
      #   createCallback: (config, lastState) -> new MaxContactSensor(config, lastState)
      # })

      # @framework.deviceManager.registerDeviceClass("MaxCube", {
      #   configDef: deviceConfigDef.MaxCube,
      #   createCallback: (config, lastState) -> new MaxCube(config, lastState)
      # })

      #setTemperatureSetpoint: (rfAddress, mode, value) ->
      #  setTemperatureSetpoint(mode,value)
    setTemperatureSetpoint: (mode, value) ->
      @_lastAction = settled(@_lastAction).then( => 
        @otgw.setTemperatureAsync(mode, value) 
      )
      return @_lastAction


  plugin = new OTGWThermostatPlugin
 
  class OTGWThermostat extends env.devices.Device
    _fault = false
    _chmode = false
    _dhwmode = false
    _flame = false
    _coolingstatus = false
    _ch2mode = false
    _diag = false
    _chenable = false
    _dhwenable = false
    _coolingenable = false
    _otcstate = false
    _ch2enable = false;

    attributes:
      Flame:
        description: "Flame status"
        type: "boolean" 
      CentralHeatingMode:
        description: "Central Heating Mode"
        type: "boolean"
      Fault:
        description: "Fault indication"
        type: "boolean"
      DomesticHotWaterMode:
        description: "Domestic Hot Water Mode"
        type: "boolean"
      CoolingStatus:
        description: "Cooling Status"
        type: "boolean"
      CentralHeating2Mode:
        description: "Central Heating 2 Mode"
        type: "boolean"
      Diagnostics:
        description: "Diagnostics"
        type: "boolean"
      CentralHeatingEnable:
        description: "Central Heating Enable"
        type: "boolean"
      DomesticHotWaterEnable:
        description: "Domestic Hot Water Enable"
        type: "boolean"
      CoolingEnable:
        description: "Cooling Enable"
        type: "boolean"
      OTCState:
        description: "OTC State"
        type: "boolean"
      CentralHeating2Enable:
        description: "Central Heating 2 Enable"
        type: "boolean"

    constructor: (@config) ->
      @id = @config.id
      @name = @config.name

      plugin.otgw.on("flame_status" , (data) =>
        if data.length = 16
          @_setFault(@_bitToBool(data.slice(15,16)))
          @_setCHMode(@_bitToBool(data.slice(14,15)))
          @_setDHWMode(@_bitToBool(data.slice(13,14)))
          @_setFlame(@_bitToBool(data.slice(12,13)))
          @_setCoolingStatus(@_bitToBool(data.slice(11,12)))
          @_setCH2Mode(@_bitToBool(data.slice(10,11)))
          @_setDiagnostics(@_bitToBool(data.slice(9,10)))
          @_setCHEnable(@_bitToBool(data.slice(8,9)))
          @_setDHWEnable(@_bitToBool(data.slice(7,8)))
          @_setCoolingEnable(@_bitToBool(data.slice(6,7)))
          @_setOTCState(@_bitToBool(data.slice(5,6)))
          @_setCH2Enable(@_bitToBool(data.slice(4,5)))
      )
      super()

#Getters
    getFlame: () -> return Promise.resolve @_flame
    getCentralHeatingMode: () -> return Promise.resolve @_chmode
    getFault: () -> return Promise.resolve @_fault
    getDomesticHotWaterMode: () -> return Promise.resolve @_dhwmode
    getCoolingStatus: () -> return Promise.resolve @_coolingstatus
    getCentralHeating2Mode: () -> return Promise.resolve @_ch2mode
    getDiagnostics: () -> return Promise.resolve @_diag
    getCentralHeatingEnable: () -> return Promise.resolve @_chenable
    getDomesticHotWaterEnable: () -> return Promise.resolve @_dhwenable
    getCoolingEnable: () -> return Promise.resolve @_coolingenable
    getOTCState: () -> return Promise.resolve @_otcstate
    getCentralHeating2Enable: () -> return Promise.resolve @_ch2enable

#Setters
    _setFlame: (state) ->
      if @_flame isnt state
        @_flame = state
        @emit 'Flame', state
    _setCHMode: (state) ->
      if @_chmode isnt state
        @_chmode = state
        @emit 'CentralHeatingMode', state
    _setFault: (state) ->
      if @_fault isnt state
        @_fault = state
        @emit 'Fault', state
    _setDHWMode: (state) ->
      if @_dhwmode isnt state
        @_dhwmode = state
        @emit 'DomesticHotWaterMode', state
    _setCoolingStatus: (state) ->
      if @_coolingstatus isnt state
        @_coolingstatus = state
        @emit 'CoolingStatus', state
    _setCH2Mode: (state) ->
      if @_ch2mode isnt state
        @_ch2mode = state
        @emit 'CentralHeating2Mode', state
    _setDiagnostics: (state) ->
      if @_diag isnt state
        @_diag = state
        @emit 'Diagnostics', state
    _setCHEnable: (state) ->
      if @_chenable isnt state
        @_chenable = state
        @emit 'CentralHeatingEnable', state
    _setDHWEnable: (state) ->
      if @_dhwenable isnt state
        @_dhwenable = state
        @emit 'DomesticHotWaterEnable', state
    _setCoolingEnable: (state) ->
      if @_coolingenable isnt state
        @_coolingenable = state
        @emit 'CoolingEnable', state
    _setOTCState: (state) ->
      if @_otcstate isnt state
        @_otcstate = state
        @emit 'OTCState', state
    _setCH2Enable: (state) ->
      if @_ch2enable isnt state
        @_ch2enable = state
        @emit 'CentralHeating2Enable', state
    
#Functions
    _bitToBool: (value) ->
      return (value is "1")
    
  class OTGWHeatingThermostat extends env.devices.HeatingThermostat

    constructor: (@config, lastState) ->
      @id = @config.id
      @name = @config.name
      @_temperatureSetpoint = lastState?.temperatureSetpoint?.value
      @_mode = lastState?.mode?.value or "auto"
      @_battery = lastState?.battery?.value or "ok"
      @_lastSendTime = 0

      plugin.otgw.on("room_setpoint", (data) =>
        if data?
          data = Number(data)
          now = new Date().getTime()
          ###
          Give the gateway some time to handle the changes. If we send new values to the cube
          we set _lastSendTime to the current time. We consider the values as succesfull set, when
          the command was not rejected. 

          In the case that the gateway did not react to our the send commands, the values will be 
          overwritten with the internal state (old ones) of the gateway after 30 seconds.
          ###
          if @_mode is "auto"
            @_setSetpoint(data)  #override from gateway
            @_setSynced(true)  

            ###
            if now - @_lastSendTime < 30*1000
              # only if values match, we are synced
              if data is @_temperatureSetpoint
                @_setSynced(true)
            else
              # more then 30 seconds passed, set the values anyway
              @_setSetpoint(data)  #override from gateway
              
              @_setSynced(true)
            ###
          
        return
      )
      plugin.otgw.on("remote_override_setpoint", (data) =>
        if data?
          data = Number(data)
          now = new Date().getTime()
          ###
          Give the gateway some time to handle the changes. If we send new values to the cube
          we set _lastSendTime to the current time. We consider the values as succesfull set, when
          the command was not rejected. 

          In the case that the gateway did not react to our the send commands, the values will be 
          overwritten with the internal state (old ones) of the gateway after 30 seconds.
          ###

          
          if @_mode is "manu"
            if data < 1
              env.logger.debug "setting to auto"
              @_setMode("auto")
            else           
              if now - @_lastSendTime < 30*1000
                # only if values match, we are synced
                if data is @_temperatureSetpoint
                  @_setSynced(true)
              else
                # more then 30 seconds passed, set the values anyway
                @_setSetpoint(data)
                @_setSynced(true)
          if @_mode is "auto" and data > 0.00
            @_setMode("manu")

        return
      )
      super()

    changeModeTo: (mode) ->
      temp = @_temperatureSetpoint
      if mode is "auto"
        temp = null
      return plugin.setTemperatureSetpoint(mode, temp).then( =>
        @_lastSendTime = new Date().getTime()
        @_setSynced(false)
        @_setMode(mode)
      )
        
    changeTemperatureTo: (temperatureSetpoint) ->
      if @temperatureSetpoint is temperatureSetpoint then return
      return plugin.setTemperatureSetpoint(@_mode, temperatureSetpoint).then( =>
        @_lastSendTime = new Date().getTime()
        @_setSynced(false)
        @_setSetpoint(temperatureSetpoint)
      )

  class OTGWMainThermostat extends env.devices.TemperatureSensor
    _temperature: null

    constructor: (@config, lastState) ->
      @id = @config.id
      @name = @config.name
      @_temperature = lastState?.temperature?.value
      super()
      
      plugin.otgw.on("room_temperature", (data) =>
        if data?
          @_temperature = Number(data)
          @emit 'temperature', @_temperature
      )

    getTemperature: -> Promise.resolve(@_temperature)

  return plugin