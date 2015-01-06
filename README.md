pimatic-otgw
============

Pimatic plugin for the Opentherm gateway (http://otgw.tclcode.com/)

This plugin will connect to the OTMonitor Relay port.

In theory this plugin can also connect to the ethernet version of the gatway (UNTESTED!)

Configuration of OT Monitor
-------------

Download the Opentherm Monitor from: http://otgw.tclcode.com/download.html#utilities

For Raspberry take Linux-armhf as system.

Setup OT monitor to start with the relay server enabled AND relay OT messages to on.
This can be done with the following command:
````
./otmonitor-ahf --daemon -f /opt/otmonitor/otmonitor.conf"
````

contents of /opt/otmonitor/otmonitor.conf: (you can choose your own loaction ofcourse)
````ini
web {
  enable true
  port 8080
  nopass true
}
connection {
  device /dev/ttyUSB1
  type serial
  enable true
}
server {
  enable true
  port 7686
  relay true
}
````

Configuration of Pimatic
-------------

You can load the plugin by editing your `config.json` to include (host = OTmonitor IP port=Relay Port (default:7686)):

````json
{ 
   "plugin": "otgw",
   "host": "192.168.X.X",
   "port": 7686
}
````


There are currently 2 devices for this plugin:

Main thermostat (Temperature sensor from the Opentherm gateway):
```json
{
 "id": "RoomTemp",
 "class": "OTGWMainThermostat",
 "name": "Room Temp"
}
```

Heating thermostat:
```json
{
  "id": "HeatingThermostat",
  "class": "OTGWHeatingThermostat",
  "name": "Heating Thermostat",
  "comfyTemp": 21.0,
  "ecoTemp": 16.5,
  "guiShowModeControl" : true,
  "guiShowPresetControl" : true,
  "guiShowTemperatueInput" : true
}
```

