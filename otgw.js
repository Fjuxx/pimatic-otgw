// Generated by CoffeeScript 1.9.1
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = function(env) {
  var M, OTGWConnection, OTGWHeatingThermostat, OTGWMainThermostat, OTGWThermostat, OTGWThermostatPlugin, Promise, _, assert, plugin, settled;
  Promise = env.require('bluebird');
  assert = env.require('cassert');
  _ = env.require('lodash');
  OTGWConnection = require('OTGW-Control');
  Promise.promisifyAll(OTGWConnection.prototype);
  M = env.matcher;
  settled = function(promise) {
    return Promise.settle([promise]);
  };
  OTGWThermostatPlugin = (function(superClass) {
    extend(OTGWThermostatPlugin, superClass);

    function OTGWThermostatPlugin() {
      this.init = bind(this.init, this);
      return OTGWThermostatPlugin.__super__.constructor.apply(this, arguments);
    }

    OTGWThermostatPlugin.prototype.init = function(app, framework, config1) {
      var deviceConfigDef;
      this.framework = framework;
      this.config = config1;
      this._lastAction = new Promise((function(_this) {
        return function(resolve, reject) {
          _this.otgw = new OTGWConnection(_this.config.host, _this.config.port);
          _this.otgw.once("connected", resolve);
          _this.otgw.once('error', reject);
        };
      })(this)).timeout(60000)["catch"](function(error) {
        env.logger.error("Error on connecting to OTGW relay: " + error.message);
        env.logger.debug(error.stack);
      });
      this.otgw.on('error', (function(_this) {
        return function(error) {
          env.logger.error("connection error: " + error);
          return env.logger.debug(error.stack);
        };
      })(this));
      this.otgw.on("room_temperature", (function(_this) {
        return function(data) {
          return env.logger.debug("got room_temperature: ", data);
        };
      })(this));
      this.otgw.on("remote_override_setpoint", (function(_this) {
        return function(data) {
          return env.logger.debug("got remote_override_setpoint: ", data);
        };
      })(this));
      this.otgw.on("flame_status", (function(_this) {
        return function(data) {
          return env.logger.debug("Flame status: ", data);
        };
      })(this));
      deviceConfigDef = require("./device-config-schema");
      this.framework.deviceManager.registerDeviceClass("OTGWHeatingThermostat", {
        configDef: deviceConfigDef.OTGWHeatingThermostat,
        createCallback: function(config, lastState) {
          return new OTGWHeatingThermostat(config, lastState);
        }
      });
      this.framework.deviceManager.registerDeviceClass("OTGWMainThermostat", {
        configDef: deviceConfigDef.OTGWMainThermostat,
        createCallback: function(config, lastState) {
          return new OTGWMainThermostat(config, lastState);
        }
      });
      return this.framework.deviceManager.registerDeviceClass("OTGWThermostat", {
        configDef: deviceConfigDef.OTGWThermostat,
        createCallback: function(config) {
          return new OTGWThermostat(config);
        }
      });
    };

    OTGWThermostatPlugin.prototype.setTemperatureSetpoint = function(mode, value) {
      this._lastAction = settled(this._lastAction).then((function(_this) {
        return function() {
          return _this.otgw.setTemperatureAsync(mode, value);
        };
      })(this));
      return this._lastAction;
    };

    return OTGWThermostatPlugin;

  })(env.plugins.Plugin);
  plugin = new OTGWThermostatPlugin;
  OTGWThermostat = (function(superClass) {
    var _ch2enable, _ch2mode, _chenable, _chmode, _coolingenable, _coolingstatus, _dhwenable, _dhwmode, _diag, _fault, _flame, _otcstate;

    extend(OTGWThermostat, superClass);

    _fault = false;

    _chmode = false;

    _dhwmode = false;

    _flame = false;

    _coolingstatus = false;

    _ch2mode = false;

    _diag = false;

    _chenable = false;

    _dhwenable = false;

    _coolingenable = false;

    _otcstate = false;

    _ch2enable = false;

    OTGWThermostat.prototype.attributes = {
      Flame: {
        description: "Flame status",
        type: "boolean"
      },
      CentralHeatingMode: {
        description: "Central Heating Mode",
        type: "boolean"
      },
      Fault: {
        description: "Fault indication",
        type: "boolean"
      },
      DomesticHotWaterMode: {
        description: "Domestic Hot Water Mode",
        type: "boolean"
      },
      CoolingStatus: {
        description: "Cooling Status",
        type: "boolean"
      },
      CentralHeating2Mode: {
        description: "Central Heating 2 Mode",
        type: "boolean"
      },
      Diagnostics: {
        description: "Diagnostics",
        type: "boolean"
      },
      CentralHeatingEnable: {
        description: "Central Heating Enable",
        type: "boolean"
      },
      DomesticHotWaterEnable: {
        description: "Domestic Hot Water Enable",
        type: "boolean"
      },
      CoolingEnable: {
        description: "Cooling Enable",
        type: "boolean"
      },
      OTCState: {
        description: "OTC State",
        type: "boolean"
      },
      CentralHeating2Enable: {
        description: "Central Heating 2 Enable",
        type: "boolean"
      }
    };

    function OTGWThermostat(config1) {
      this.config = config1;
      this.id = this.config.id;
      this.name = this.config.name;
      plugin.otgw.on("flame_status", (function(_this) {
        return function(data) {
          if (data.length = 16) {
            _this._setFault(_this._bitToBool(data.slice(15, 16)));
            _this._setCHMode(_this._bitToBool(data.slice(14, 15)));
            _this._setDHWMode(_this._bitToBool(data.slice(13, 14)));
            _this._setFlame(_this._bitToBool(data.slice(12, 13)));
            _this._setCoolingStatus(_this._bitToBool(data.slice(11, 12)));
            _this._setCH2Mode(_this._bitToBool(data.slice(10, 11)));
            _this._setDiagnostics(_this._bitToBool(data.slice(9, 10)));
            _this._setCHEnable(_this._bitToBool(data.slice(8, 9)));
            _this._setDHWEnable(_this._bitToBool(data.slice(7, 8)));
            _this._setCoolingEnable(_this._bitToBool(data.slice(6, 7)));
            _this._setOTCState(_this._bitToBool(data.slice(5, 6)));
            return _this._setCH2Enable(_this._bitToBool(data.slice(4, 5)));
          }
        };
      })(this));
      OTGWThermostat.__super__.constructor.call(this);
    }

    OTGWThermostat.prototype.getFlame = function() {
      return Promise.resolve(this._flame);
    };

    OTGWThermostat.prototype.getCentralHeatingMode = function() {
      return Promise.resolve(this._chmode);
    };

    OTGWThermostat.prototype.getFault = function() {
      return Promise.resolve(this._fault);
    };

    OTGWThermostat.prototype.getDomesticHotWaterMode = function() {
      return Promise.resolve(this._dhwmode);
    };

    OTGWThermostat.prototype.getCoolingStatus = function() {
      return Promise.resolve(this._coolingstatus);
    };

    OTGWThermostat.prototype.getCentralHeating2Mode = function() {
      return Promise.resolve(this._ch2mode);
    };

    OTGWThermostat.prototype.getDiagnostics = function() {
      return Promise.resolve(this._diag);
    };

    OTGWThermostat.prototype.getCentralHeatingEnable = function() {
      return Promise.resolve(this._chenable);
    };

    OTGWThermostat.prototype.getDomesticHotWaterEnable = function() {
      return Promise.resolve(this._dhwenable);
    };

    OTGWThermostat.prototype.getCoolingEnable = function() {
      return Promise.resolve(this._coolingenable);
    };

    OTGWThermostat.prototype.getOTCState = function() {
      return Promise.resolve(this._otcstate);
    };

    OTGWThermostat.prototype.getCentralHeating2Enable = function() {
      return Promise.resolve(this._ch2enable);
    };

    OTGWThermostat.prototype._setFlame = function(state) {
      if (this._flame !== state) {
        this._flame = state;
        return this.emit('Flame', state);
      }
    };

    OTGWThermostat.prototype._setCHMode = function(state) {
      if (this._chmode !== state) {
        this._chmode = state;
        return this.emit('CentralHeatingMode', state);
      }
    };

    OTGWThermostat.prototype._setFault = function(state) {
      if (this._fault !== state) {
        this._fault = state;
        return this.emit('Fault', state);
      }
    };

    OTGWThermostat.prototype._setDHWMode = function(state) {
      if (this._dhwmode !== state) {
        this._dhwmode = state;
        return this.emit('DomesticHotWaterMode', state);
      }
    };

    OTGWThermostat.prototype._setCoolingStatus = function(state) {
      if (this._coolingstatus !== state) {
        this._coolingstatus = state;
        return this.emit('CoolingStatus', state);
      }
    };

    OTGWThermostat.prototype._setCH2Mode = function(state) {
      if (this._ch2mode !== state) {
        this._ch2mode = state;
        return this.emit('CentralHeating2Mode', state);
      }
    };

    OTGWThermostat.prototype._setDiagnostics = function(state) {
      if (this._diag !== state) {
        this._diag = state;
        return this.emit('Diagnostics', state);
      }
    };

    OTGWThermostat.prototype._setCHEnable = function(state) {
      if (this._chenable !== state) {
        this._chenable = state;
        return this.emit('CentralHeatingEnable', state);
      }
    };

    OTGWThermostat.prototype._setDHWEnable = function(state) {
      if (this._dhwenable !== state) {
        this._dhwenable = state;
        return this.emit('DomesticHotWaterEnable', state);
      }
    };

    OTGWThermostat.prototype._setCoolingEnable = function(state) {
      if (this._coolingenable !== state) {
        this._coolingenable = state;
        return this.emit('CoolingEnable', state);
      }
    };

    OTGWThermostat.prototype._setOTCState = function(state) {
      if (this._otcstate !== state) {
        this._otcstate = state;
        return this.emit('OTCState', state);
      }
    };

    OTGWThermostat.prototype._setCH2Enable = function(state) {
      if (this._ch2enable !== state) {
        this._ch2enable = state;
        return this.emit('CentralHeating2Enable', state);
      }
    };

    OTGWThermostat.prototype._bitToBool = function(value) {
      return value === "1";
    };

    return OTGWThermostat;

  })(env.devices.Device);
  OTGWHeatingThermostat = (function(superClass) {
    extend(OTGWHeatingThermostat, superClass);

    function OTGWHeatingThermostat(config1, lastState) {
      var ref, ref1, ref2;
      this.config = config1;
      this.id = this.config.id;
      this.name = this.config.name;
      this._temperatureSetpoint = lastState != null ? (ref = lastState.temperatureSetpoint) != null ? ref.value : void 0 : void 0;
      this._mode = (lastState != null ? (ref1 = lastState.mode) != null ? ref1.value : void 0 : void 0) || "auto";
      this._battery = (lastState != null ? (ref2 = lastState.battery) != null ? ref2.value : void 0 : void 0) || "ok";
      this._lastSendTime = 0;
      plugin.otgw.on("room_setpoint", (function(_this) {
        return function(data) {
          var now;
          if (data != null) {
            data = Number(data);
            now = new Date().getTime();

            /*
            Give the gateway some time to handle the changes. If we send new values to the cube
            we set _lastSendTime to the current time. We consider the values as succesfull set, when
            the command was not rejected. 
            
            In the case that the gateway did not react to our the send commands, the values will be 
            overwritten with the internal state (old ones) of the gateway after 30 seconds.
             */
            if (_this._mode === "auto") {
              _this._setSetpoint(data);
              _this._setSynced(true);

              /*
              if now - @_lastSendTime < 30*1000
                 * only if values match, we are synced
                if data is @_temperatureSetpoint
                  @_setSynced(true)
              else
                 * more then 30 seconds passed, set the values anyway
                @_setSetpoint(data)  #override from gateway
                
                @_setSynced(true)
               */
            }
          }
        };
      })(this));
      plugin.otgw.on("remote_override_setpoint", (function(_this) {
        return function(data) {
          var now;
          if (data != null) {
            data = Number(data);
            now = new Date().getTime();

            /*
            Give the gateway some time to handle the changes. If we send new values to the cube
            we set _lastSendTime to the current time. We consider the values as succesfull set, when
            the command was not rejected. 
            
            In the case that the gateway did not react to our the send commands, the values will be 
            overwritten with the internal state (old ones) of the gateway after 30 seconds.
             */
            if (_this._mode === "manu") {
              if (data < 1) {
                env.logger.debug("setting to auto");
                _this._setMode("auto");
              } else {
                if (now - _this._lastSendTime < 30 * 1000) {
                  if (data === _this._temperatureSetpoint) {
                    _this._setSynced(true);
                  }
                } else {
                  _this._setSetpoint(data);
                  _this._setSynced(true);
                }
              }
            }
            if (_this._mode === "auto" && data > 0.00) {
              _this._setMode("manu");
            }
          }
        };
      })(this));
      OTGWHeatingThermostat.__super__.constructor.call(this);
    }

    OTGWHeatingThermostat.prototype.changeModeTo = function(mode) {
      var temp;
      temp = this._temperatureSetpoint;
      if (mode === "auto") {
        temp = null;
      }
      return plugin.setTemperatureSetpoint(mode, temp).then((function(_this) {
        return function() {
          _this._lastSendTime = new Date().getTime();
          _this._setSynced(false);
          return _this._setMode(mode);
        };
      })(this));
    };

    OTGWHeatingThermostat.prototype.changeTemperatureTo = function(temperatureSetpoint) {
      if (this.temperatureSetpoint === temperatureSetpoint) {
        return;
      }
      return plugin.setTemperatureSetpoint(this._mode, temperatureSetpoint).then((function(_this) {
        return function() {
          _this._lastSendTime = new Date().getTime();
          _this._setSynced(false);
          return _this._setSetpoint(temperatureSetpoint);
        };
      })(this));
    };

    return OTGWHeatingThermostat;

  })(env.devices.HeatingThermostat);
  OTGWMainThermostat = (function(superClass) {
    extend(OTGWMainThermostat, superClass);

    OTGWMainThermostat.prototype._temperature = null;

    function OTGWMainThermostat(config1, lastState) {
      var ref;
      this.config = config1;
      this.id = this.config.id;
      this.name = this.config.name;
      this._temperature = lastState != null ? (ref = lastState.temperature) != null ? ref.value : void 0 : void 0;
      OTGWMainThermostat.__super__.constructor.call(this);
      plugin.otgw.on("room_temperature", (function(_this) {
        return function(data) {
          if (data != null) {
            _this._temperature = Number(data);
            return _this.emit('temperature', _this._temperature);
          }
        };
      })(this));
    }

    OTGWMainThermostat.prototype.getTemperature = function() {
      return Promise.resolve(this._temperature);
    };

    return OTGWMainThermostat;

  })(env.devices.TemperatureSensor);
  return plugin;
};
