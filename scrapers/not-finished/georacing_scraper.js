const {Georacing, sequelize, connect} = require('../tracker-schema/schema.js')
const {axios, uuidv4} = require('../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');

function peekUint8(bytes) {
    if (bytes.length < 1)
      return 0;
    return bytes[0];
  }
  
  function readInt8(bytes, index) {
    var v = bytes[index];
    if (v > 127) v = -(256 - v);
    return v;
  }
  
  function readUInt8(bytes, index) {
    return (bytes[index]);
  }
  
  function readUInt16(bytes, index) {
    return ((bytes[index + 1] << 8) | bytes[index]);
  }
  
  function peekInt16(bytes) {
    return peekUInt16(bytes) - ((1 << 15) - 1);
  }
  
  function peekUInt16(bytes) {
    if (bytes.length < 2)
      return 0;
    return ((bytes[0] << 8) | bytes[1]);
  }
  
  function readUInt32(bytes, index) {
    return ((bytes[index + 3] << 24) | (bytes[index + 2] << 16) | (bytes[index + 1] << 8) | bytes[index]);
  }
  
  function peekUInt32(bytes) {
    if (bytes.length < 4)
      return 0;
    return ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]);
  }
  
  function readInt32(bytes, index) {
    var v = ((bytes[index + 3] << 24) | (bytes[index + 2] << 16) | (bytes[index + 1] << 8) | bytes[index]);
    if (v > 2147483648) v = -(4294967296 - v);
    return v;
  }
  
  function readInt64(bytes, index) {
    return ((bytes[index + 7] << 56) | (bytes[index + 6] << 48) | (bytes[index + 5] << 40) | (bytes[index + 4] << 32) | (bytes[index + 3] << 24) | (bytes[index + 2] << 16) | (bytes[index + 1] << 8) | bytes[index]);
  }
  
  function readFloat32(bytes, index) {
    var buffer = new ArrayBuffer(4);
    var arr8 = new Uint8Array(buffer);
    arr8.set(bytes.subarray(index, index + 4));
    var float32View = new Float32Array(buffer);
    return float32View[0];
  }
  
  function peekFloat32(bytes) {
    if (bytes.length < 4)
      return 0;
    var array_tmp = new ArrayBuffer(8);
    var uInt8View = new Uint8Array(array_tmp);
    uInt8View.set(bytes);
    var float32View = new Float32Array(array_tmp);
    return float32View[0];
  }
  
  function peekFloat64(bytes) {
    if (bytes.length < 8)
      return 0;
    var array_tmp = new ArrayBuffer(8);
    var uInt8View = new Uint8Array(array_tmp);
    uInt8View.set(bytes);
    var float64View = new Float64Array(array_tmp);
    return float64View[0];
  }
  
  function asCenti(val) {
    return val / 100.0;
  }
  
  function asDirection(val) {
    if (val == 65535) return 361;
    return (val * 360.0) / (65535 - 1);
  }
  
  function asDeci(val) {
    return val / 10.0;
  }
  
  function isNotEmpty(variable) {
    return variable != null;
  }
  
  const NUM_VERSION_POSITION_WITHOUT_METEO = 101;
  const NUM_VERSION_POSITION = 100;
  const NUM_VERSION_POSITION_OLD = 3;
  
  function loadBinaryV101RankingsHelper(bytes, index) {
    var rd = {};
    rd.rank = readUInt8(bytes, index);
    index += 1;
    rd.evolution = readInt8(bytes, index);
    index += 1;
    rd.status = readInt8(bytes, index);
    index += 1;
    rd.visible = readInt8(bytes, index);
    index += 1;
    rd.dtf = readFloat32(bytes, index);
    index += 4;
    rd.dtl = readFloat32(bytes, index);
    index += 4;
    rd.speed = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg = readFloat32(bytes, index);
    index += 4;
    rd.speed4h = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading4h = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg4h = readFloat32(bytes, index);
    index += 4;
    rd.distance4h = readFloat32(bytes, index);
    index += 4;
    rd.speed24h = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading24h = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg24h = readFloat32(bytes, index);
    index += 4;
    rd.distance24h = readFloat32(bytes, index);
    index += 4;
    return rd;
  }
  
  function loadBinaryV101(bytes, index) {
    var result = {
      ActorsRankings: {},
      ActorsPositions: {},
    };
    var byteslen = bytes.length;
    while (index < byteslen) {
      var timestamp = readInt64(bytes, index);
      index += 8;
      var rankingSize = readUInt32(bytes, index);
      index += 4;
      var structSize = readUInt16(bytes, index);
      index += 2;
      rankingSize += index;
      while (index < rankingSize) {
        var id = readUInt32(bytes, index);
        index += 4;
        var rd = loadBinaryV101RankingsHelper(bytes, index);
        index += structSize - 4 - 1;
        var sid = id + "";
        if (!isNotEmpty(result.ActorsRankings[sid])) {
          result.ActorsRankings[sid] = [];
        }
        result.ActorsRankings[sid].push([timestamp, rd]);
        if (!isNotEmpty(result.ActorsPositions[sid])) {
          result.ActorsPositions[sid] = [];
        }
        var numLocations = readUInt8(bytes, index);
        index += 1;
        for (var l = 0; l < numLocations; l++) {
          var latbin = readUInt32(bytes, index);
          index += 4;
          var lngbin = readUInt32(bytes, index);
          index += 4;
          var offsetTimestamp = readInt32(bytes, index);
          index += 4;
          var latitude = 0;
          var longitude = 0;
          if (latbin >= 0) {
            latitude = (latbin * 180.0) / (4294967295 - 1) - 90.0;
          } else {
            latitude = 90.0 + (latbin * 180.0) / (4294967295 - 1);
          }
          if (lngbin >= 0) {
            longitude = (lngbin * 360.0) / (4294967295 - 1) - 180.0;
          } else {
            longitude = 180.0 + (lngbin * 360.0) / (4294967295 - 1);
          }
          var finalTimestamp = timestamp + offsetTimestamp;
          result.ActorsPositions[sid].push({
            "at": finalTimestamp * 1000,
            "lng": longitude,
            "lat": latitude,
          });
        }
      }
    }
    return result;
  }
  
  function loadBinaryV100RankingsHelper(bytes, index) {
    var rd = {};
    rd.rank = readUInt8(bytes, index);
    index += 1;
    rd.evolution = readInt8(bytes, index);
    index += 1;
    rd.status = readInt8(bytes, index);
    index += 1;
    rd.visible = readInt8(bytes, index);
    index += 1;
    rd.dtf = readFloat32(bytes, index);
    index += 4;
    rd.dtl = readFloat32(bytes, index);
    index += 4;
    rd.speed = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg = readFloat32(bytes, index);
    index += 4;
    rd.speed4h = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading4h = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg4h = readFloat32(bytes, index);
    index += 4;
    rd.distance4h = readFloat32(bytes, index);
    index += 4;
    rd.speed24h = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading24h = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg24h = readFloat32(bytes, index);
    index += 4;
    rd.distance24h = readFloat32(bytes, index);
    index += 4;
    rd.wind10mDirection = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.wind10mSpeed = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.cloudCover = readUInt8(bytes, index);
    index += 1;
    rd.accumulatedPrecipitation = asDeci(readUInt16(bytes, index));
    index += 2;
    rd.temperature = readInt8(bytes, index);
    index += 1;
    rd.waveHeight = asDeci(readUInt16(bytes, index));
    index += 2;
    rd.primaryWaveDirection = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.seaSurfaceTemperature = readInt8(bytes, index);
    index += 1;
    rd.meanSeaLevelPressure = readUInt16(bytes, index);
    return rd;
  }
  
  function loadBinaryV100(bytes, index) {
    var result = {
      ActorsRankings: {},
      ActorsPositions: {},
    };
    var byteslen = bytes.length;
    while (index < byteslen) {
      var timestamp = readInt64(bytes, index);
      index += 8;
      var rankingSize = readUInt32(bytes, index);
      index += 4;
      var structSize = readUInt16(bytes, index);
      index += 2;
      rankingSize += index;
      while (index < rankingSize) {
        var id = readUInt32(bytes, index);
        index += 4;
        var rd = loadBinaryV100RankingsHelper(bytes, index);
        index += structSize - 4 - 1;
        var sid = id + "";
        if (!isNotEmpty(result.ActorsRankings[sid])) {
          result.ActorsRankings[sid] = [];
        }
        result.ActorsRankings[sid].push([timestamp, rd]);
        if (!isNotEmpty(result.ActorsPositions[sid])) {
          result.ActorsPositions[sid] = [];
        }
        var numLocations = readUInt8(bytes, index);
        index += 1;
        for (var l = 0; l < numLocations; l++) {
          var latbin = readUInt32(bytes, index);
          index += 4;
          var lngbin = readUInt32(bytes, index);
          index += 4;
          var offsetTimestamp = readInt32(bytes, index);
          index += 4;
          var latitude = 0;
          var longitude = 0;
          if (latbin >= 0) {
            latitude = (latbin * 180.0) / (4294967295 - 1) - 90.0;
          } else {
            latitude = 90.0 + (latbin * 180.0) / (4294967295 - 1);
          }
          if (lngbin >= 0) {
            longitude = (lngbin * 360.0) / (4294967295 - 1) - 180.0;
          } else {
            longitude = 180.0 + (lngbin * 360.0) / (4294967295 - 1);
          }
          var finalTimestamp = timestamp + offsetTimestamp;
          result.ActorsPositions[sid].push({
            "at": finalTimestamp * 1000,
            "lng": longitude,
            "lat": latitude,
          });
        }
      }
    }
    return result;
  }
  
  function loadBinaryV3RankingsHelper(bytes, index) {
    var rd = {};
    rd.rank = readUInt8(bytes, index);
    index += 1;
    rd.evolution = readInt8(bytes, index);
    index += 1;
    rd.status = readInt8(bytes, index);
    index += 1;
    rd.dtf = readFloat32(bytes, index);
    index += 4;
    rd.visible = (rd.dtf == -2) ? false : true;
    rd.speed = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg = readFloat32(bytes, index);
    index += 4;
    rd.speed4h = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading4h = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg4h = readFloat32(bytes, index);
    index += 4;
    rd.distance4h = readFloat32(bytes, index);
    index += 4;
    rd.speed24h = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.heading24h = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.vmg24h = readFloat32(bytes, index);
    index += 4;
    rd.distance24h = readFloat32(bytes, index);
    index += 4;
    rd.wind10mDirection = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.wind10mSpeed = asCenti(readUInt16(bytes, index));
    index += 2;
    rd.cloudCover = readUInt8(bytes, index);
    index += 1;
    rd.accumulatedPrecipitation = asDeci(readUInt16(bytes, index));
    index += 2;
    rd.temperature = readInt8(bytes, index);
    index += 1;
    rd.waveHeight = asDeci(readUInt16(bytes, index));
    index += 2;
    rd.primaryWaveDirection = asDirection(readUInt16(bytes, index));
    index += 2;
    rd.seaSurfaceTemperature = readInt8(bytes, index);
    index += 1;
    rd.meanSeaLevelPressure = readUInt16(bytes, index);
    return rd;
  }
  
  function loadBinaryV3(bytes, index) {
    var result = {
      ActorsRankings: {},
      ActorsPositions: {},
    };
    var byteslen = bytes.length;
    while (index < byteslen) {
      var timestamp = readInt64(bytes, index);
      index += 8;
      var rankingSize = readUInt32(bytes, index);
      index += 4;
      rankingSize += index;
      while (index < rankingSize) {
        var id = readUInt16(bytes, index);
        index += 2;
        var rd = loadBinaryV3RankingsHelper(bytes, index);
        index += 54;
        var sid = id + "";
        if (!isNotEmpty(result.ActorsRankings[sid])) {
          result.ActorsRankings[sid] = [];
        }
        result.ActorsRankings[sid].push([timestamp, rd]);
        if (!isNotEmpty(result.ActorsPositions[sid])) {
          result.ActorsPositions[sid] = [];
        }
        var numLocations = readUInt8(bytes, index);
        index += 1;
        for (var l = 0; l < numLocations; l++) {
          var latbin = readUInt32(bytes, index);
          index += 4;
          var lngbin = readUInt32(bytes, index);
          index += 4;
          var offsetTimestamp = readInt32(bytes, index);
          index += 4;
          var latitude = 0;
          var longitude = 0;
          if (latbin >= 0) {
            latitude = (latbin * 180.0) / (4294967295 - 1) - 90.0;
          } else {
            latitude = 90.0 + (latbin * 180.0) / (4294967295 - 1);
          }
          if (lngbin >= 0) {
            longitude = (lngbin * 360.0) / (4294967295 - 1) - 180.0;
          } else {
            longitude = 180.0 + (lngbin * 360.0) / (4294967295 - 1);
          }
          var finalTimestamp = timestamp + offsetTimestamp;
          result.ActorsPositions[sid].push({
            "at": finalTimestamp * 1000,
            "lng": longitude,
            "lat": latitude,
          });
        }
      }
    }
    return result;
  }
  
  function mergeActorsRankingsToActorsPositions(data) {
    var result = data.ActorsPositions;
    for (var actorId in data.ActorsRankings) if (data.ActorsRankings.hasOwnProperty(actorId)) {
      if (!result[actorId]) {
        result[actorId] = [];
        for (var i = 0, len = data.ActorsRankings[actorId].length; i < len; i++) {
          result[actorId].push({
            at: result[actorId][i][0] * 1000, // Timestamp
            other: result[actorId][i][1],
          });
        }
      }
  
      var iLen = data.ActorsRankings[actorId].length;
      for (var i = 0; i < iLen; i++) {
        var ranking = data.ActorsRankings[actorId][i];
        var rankingTimestamp = ranking[0] * 1000;
  
        // Find pos
        var pos = -1;
        for (var j = 0; j < result[actorId].length; j++) {
          if (result[actorId][j].at == rankingTimestamp) {
            pos = j;
            break;
          }
        }
  
        if (pos != -1) {
          result[actorId][pos].other = ranking[1];
        } else {
          result[actorId].push({
            at: rankingTimestamp,
            other: ranking[1],
          });
        }
      }
      // Order by timestamp
      result[actorId].sort(function (a, b) {
        return a.at - b.at;
      })
    }
    return result;
  }
  
  var DEBUG = false;
  var DEFINITIONS_Type = {};
  DEFINITIONS_Type["Uint8"] = {
    "fonction_ToByte": function (value) {
      return daud(value);
    }, "fonction_FromByte": function (value) {
      return peekUint8(value);
    }, "nbOctets": 1,
  };
  DEFINITIONS_Type["Uint16"] = {
    "fonction_ToByte": function (value) {
      return hdcx(value);
    }, "fonction_FromByte": function (value) {
      return peekUInt16(value);
    }, "nbOctets": 2,
  };
  DEFINITIONS_Type["Uint24"] = {
    "fonction_ToByte": function (value) {
      return aiuw(value);
    }, "fonction_FromByte": function (value) {
      return tajk(value);
    }, "nbOctets": 3,
  };
  DEFINITIONS_Type["Uint32"] = {
    "fonction_ToByte": function (value) {
      return lcvl(value);
    }, "fonction_FromByte": function (value) {
      return peekUInt32(value);
    }, "nbOctets": 4,
  };
  DEFINITIONS_Type["Uint64"] = {
    "fonction_ToByte": function (value) {
      return convert_Uint64ToByte(value);
    }, "fonction_FromByte": function (value) {
      return convert_ByteToUint64(value);
    }, "nbOctets": 8,
  };
  DEFINITIONS_Type["Int8"] = {
    "fonction_ToByte": function (value) {
      return ehxd(value);
    }, "fonction_FromByte": function (value) {
      return zcmk(value);
    }, "nbOctets": 1,
  };
  DEFINITIONS_Type["Int16"] = {
    "fonction_ToByte": function (value) {
      return gnry(value);
    }, "fonction_FromByte": function (value) {
      return peekInt16(value);
    }, "nbOctets": 2,
  };
  DEFINITIONS_Type["Int24"] = {
    "fonction_ToByte": function (value) {
      return gwcq(value);
    }, "fonction_FromByte": function (value) {
      return jyyj(value);
    }, "nbOctets": 3,
  };
  DEFINITIONS_Type["Int32"] = {
    "fonction_ToByte": function (value) {
      return cgmc(value);
    }, "fonction_FromByte": function (value) {
      return efav(value);
    }, "nbOctets": 4,
  };
  DEFINITIONS_Type["Int64"] = {
    "fonction_ToByte": function (value) {
      return hjsd(value);
    }, "fonction_FromByte": function (value) {
      return izmn(value);
    }, "nbOctets": 8,
  };
  DEFINITIONS_Type["Float32"] = {
    "fonction_ToByte": function (value) {
      return swga(value);
    }, "fonction_FromByte": function (value) {
      return peekFloat32(value);
    }, "nbOctets": 4,
  };
  DEFINITIONS_Type["Float64"] = {
    "fonction_ToByte": function (value) {
      return jhdj(value);
    }, "fonction_FromByte": function (value) {
      return peekFloat64(value);
    }, "nbOctets": 8,
  };
  var DEFINITIONS = new Array();
  DEFINITIONS[0] = {"name": "lg", "type": "Float64", "bdd_name": "lg", "defaultValue": 1000000.0};
  DEFINITIONS[1] = {"name": "lt", "type": "Float64", "bdd_name": "lt", "defaultValue": 1000000.0};
  DEFINITIONS[2] = {"name": "al", "type": "Float32", "bdd_name": "al", "defaultValue": 1000000.0};
  DEFINITIONS[3] = {"name": "s", "type": "Float32", "bdd_name": "speed", "defaultValue": 1000000.0};
  DEFINITIONS[4] = {"name": "h", "type": "Uint16", "bdd_name": "heading", "defaultValue": 65535};
  DEFINITIONS[5] = {"name": "vmg", "type": "Float32", "bdd_name": "vmg", "defaultValue": 1000000.0};
  DEFINITIONS[6] = {"name": "status", "type": "Uint8", "bdd_name": "status", "defaultValue": 127};
  DEFINITIONS[7] = {"name": "cl", "type": "Uint8", "bdd_name": "cl", "defaultValue": 127};
  DEFINITIONS[8] = {"name": "d", "type": "Float32", "bdd_name": "d", "defaultValue": -1.0};
  DEFINITIONS[9] = {"name": "dtnm", "type": "Float32", "bdd_name": "dtnm", "defaultValue": -1.0};
  DEFINITIONS[10] = {"name": "r", "type": "Uint16", "bdd_name": "r", "defaultValue": 9999};
  DEFINITIONS[11] = {"name": "p", "type": "Int16", "bdd_name": "p", "defaultValue": 9999};
  DEFINITIONS[12] = {"name": "gps", "type": "Uint16", "bdd_name": "gps", "defaultValue": 65535};
  DEFINITIONS[13] = {"name": "gsm", "type": "Uint8", "bdd_name": "gsm", "defaultValue": 127};
  DEFINITIONS[14] = {"name": "bat", "type": "Uint8", "bdd_name": "bat", "defaultValue": 127};
  DEFINITIONS[15] = {"name": "ecart_d", "type": "Float32", "bdd_name": "ecart_d", "defaultValue": 1000000.0};
  DEFINITIONS[16] = {"name": "int_1", "type": "Uint16", "bdd_name": "int_1", "defaultValue": 65535};
  DEFINITIONS[17] = {"name": "s_1", "type": "Float32", "bdd_name": "s_1", "defaultValue": 1000000.0};
  DEFINITIONS[18] = {"name": "h_1", "type": "Uint16", "bdd_name": "h_1", "defaultValue": 65535};
  DEFINITIONS[19] = {"name": "vmg_1", "type": "Float32", "bdd_name": "vmg_1", "defaultValue": 1000000.0};
  DEFINITIONS[20] = {"name": "int_2", "type": "Uint16", "bdd_name": "int_2", "defaultValue": 65535};
  DEFINITIONS[21] = {"name": "s_2", "type": "Float32", "bdd_name": "s_2", "defaultValue": 1000000.0};
  DEFINITIONS[22] = {"name": "h_2", "type": "Uint16", "bdd_name": "h_2", "defaultValue": 65535};
  DEFINITIONS[23] = {"name": "vmg_2", "type": "Float32", "bdd_name": "vmg_2", "defaultValue": 1000000.0};
  DEFINITIONS[24] = {"name": "tws", "type": "Float32", "bdd_name": "tws", "defaultValue": 1000000.0};
  DEFINITIONS[25] = {"name": "twd", "type": "Uint16", "bdd_name": "twd", "defaultValue": 65535};
  DEFINITIONS[26] = {"name": "water_temp", "type": "Int16", "bdd_name": "water_temp", "defaultValue": 65535};
  DEFINITIONS[27] = {"name": "air_temp", "type": "Int16", "bdd_name": "air_temp", "defaultValue": 65535};
  DEFINITIONS[28] = {"name": "air_pression", "type": "Uint16", "bdd_name": "air_pression", "defaultValue": 65535};
  DEFINITIONS[29] = {"name": "dp_1", "type": "Float32", "bdd_name": "dp_1", "defaultValue": 1000000.0};
  DEFINITIONS[30] = {"name": "dp_2", "type": "Float32", "bdd_name": "dp_2", "defaultValue": 1000000.0};
  


  var yhny = {"start_lg": -180, "end_lg": 180, "start_lt": 90, "end_lt": -90};
  
  function wqwk(array_variables) {
    var isOk = true;
    for (var i in array_variables) {
      isOk = ((isOk) && (array_variables[i] != undefined) && (array_variables[i] != null));
      if (isOk == false)
        return false;
    }
    return isOk;
  }
  
  function readStruct(bytes, startOffset, structDef, geoData_StructureSize) {
    var indexOffset = startOffset;
    if ((bytes.length < geoData_StructureSize) || (bytes[indexOffset] != 1))
      return null;
    indexOffset++;
    var data = {};
    data.offset = bytes[indexOffset];
    indexOffset++;
    var nbDef = structDef.length;
    var def, def_type, value;
    for (var i = 0; i < nbDef; i++) {
      def = DEFINITIONS[structDef[i]];
      def_type = DEFINITIONS_Type[def["type"]];
      value = def_type["fonction_FromByte"](bytes.subarray(indexOffset, indexOffset + def_type["nbOctets"]));
      data[def["name"]] = (value == def["defaultValue"]) ? null : value;
      indexOffset += def_type["nbOctets"];
    }
    return data;
  }
  
  function mergeActors(result, subResult) {
    for (var iId in subResult) if (subResult.hasOwnProperty(iId)) {
      result[iId] = result[iId] ? result[iId].concat(subResult[iId]) : subResult[iId];
    }
  }
  
  function loadGeoracingOneBig(bytes, filename, available_time) {
    var loadStat = {};
    var startTraitementTime = new Date().getTime();
    if (!isNotEmpty(bytes))
      return false;
    var headerSize = 7;
    var nbOctets = bytes.length;
    var index = 0;
    var indexHeader = 0;
    var result = {};
    while (index + headerSize < bytes.length) {
      indexHeader = index;
      var dataSize = peekUInt32(bytes.subarray(indexHeader, indexHeader + 4));
      indexHeader += 4;
      var year = (bytes[indexHeader] + 2000).toString();
      indexHeader++;
      var month = bytes[indexHeader].toString();
      indexHeader++;
      var day = bytes[indexHeader].toString();
      indexHeader++;
      if (month.length == 1)
        month = "0" + month;
      if (day.length == 1)
        day = "0" + day;
      var dataOfDay_str = year + "-" + month + "-" + day;
      if (index + headerSize + dataSize > bytes.length)
        break;
      mergeActors(
        result,
        readGeoracingDayOfOneBig(bytes, index + headerSize, dataSize, loadStat, filename, dataOfDay_str, available_time)
      );
      index = index + headerSize + dataSize;
    }
    var endTraitementTime = new Date().getTime();
    if (DEBUG) {
      console.log(" le fichier " + filename + ": " + ((endTraitementTime - startTraitementTime) / 1000.0) + "s pour " + nbOctets + " octets ");
    }
    return result;
  }
  
  function readGeoracingDayOfOneBig(bytes, startOffset, partSize, loadStat, filename, day, available_time) {
    var date_begin_time = new Date(available_time);
    var startTraitementTime = new Date().getTime();
    if (!isNotEmpty(bytes))
      return false;
    var bytes_start = startOffset;
    var dateOfDay_00h00 = new Date(day + "T00:00:00Z");
    var availableTime_minutesInDay = Math.floor((date_begin_time.getTime() - dateOfDay_00h00.getTime()) / (1000 * 60));
    var indexOffset, numVersion, minuteHeaderSize, nbActors, minuteInDay, structDef, indexOffset_tmp, nbChamps, id_def,
      def, def_type, minuteSize, minute_inc;
    var endIndex = startOffset + partSize;
    var result = {};
    while (bytes_start + 5 < endIndex) {
      indexOffset = bytes_start;
      numVersion = bytes[indexOffset];
      indexOffset++;
      if (numVersion > 3) {
        console.log("Error Function : loadGeoracingPartial");
        return;
      }
      minuteHeaderSize = ((numVersion >= 2) ? ((numVersion >= 3) ? 11 : 9) : 5);
      nbActors = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
      indexOffset += 2;
      minuteInDay = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
      indexOffset += 2;
      HEADER_SIZE = 9;
      GEODATA_STRUCTURE_SIZE = 39;
      structDef = new Array();
      if (numVersion >= 3) {
        indexOffset_tmp = indexOffset + 4;
        nbChamps = bytes[indexOffset_tmp];
        indexOffset_tmp++;
        minuteHeaderSize = 10 + nbChamps;
        GEODATA_STRUCTURE_SIZE = 2;
        for (var i = 0; i < nbChamps; i++) {
          id_def = bytes[indexOffset_tmp];
          indexOffset_tmp++;
          def = DEFINITIONS[id_def];
          def_type = DEFINITIONS_Type[def["type"]];
          GEODATA_STRUCTURE_SIZE += def_type["nbOctets"];
          structDef.push(id_def);
        }
      } else {
        structDef.push(10);
        structDef.push(7);
        structDef.push(8);
        structDef.push(0);
        structDef.push(1);
        structDef.push(2);
        structDef.push(3);
        structDef.push(4);
        structDef.push(9);
      }
      minuteSize = ((numVersion >= 2) ? (peekUInt32(bytes.subarray(indexOffset, indexOffset + 4))) : (minuteHeaderSize + (HEADER_SIZE + GEODATA_STRUCTURE_SIZE * 60) * nbActors));
      indexOffset += 4;
      minute_inc = minuteInDay - availableTime_minutesInDay;
      if (minute_inc >= 0) {
        // kvjc(bytes, bytes_start, loadStat, filename, minute_inc);
        mergeActors(
          result,
          loadBinaryOfGeoPlayer(bytes, date_begin_time.getTime(), bytes_start, minute_inc)
        );
      }
      bytes_start += minuteSize;
    }
    var endTraitementTime = new Date().getTime();
    if (DEBUG) {
      console.log(" le fichier " + filename + ": " + ((endTraitementTime - startTraitementTime) / 1000.0) + "s pour " + partSize + " octets ");
    }
    return result;
  }
  
  function loadGeoracingPartial(bytes, filename, day, available_time) {
    var startOffset = 0;
    var date_begin_time = new Date(available_time);
    var startTraitementTime = new Date().getTime();
    var bytes_start = startOffset;
    var dateOfDay_00h00 = new Date(day + "T00:00:00Z");
    var availableTime_minutesInDay = Math.floor((date_begin_time.getTime() - dateOfDay_00h00.getTime()) / (1000 * 60));
    var indexOffset, numVersion, minuteHeaderSize, nbActors, minuteInDay, indexOffset_tmp, nbChamps, id_def, def, def_type, minuteSize, minute_inc;
    if (DEBUG) {
      console.log("====================================================================================================");
      console.log("Octects : " + bytes.length + " StartOffset: " + startOffset + " Filename: " + filename + " du " + day);
    }
    var result = {};
    while (bytes_start + 5 < bytes.length) {
      indexOffset = bytes_start;
      numVersion = bytes[indexOffset];
      indexOffset++;
      if (DEBUG)
        console.log("VERSION: " + numVersion);
      if (DEBUG && numVersion == 0)
        console.log("ERROR VERSION!!");
      if (numVersion > 3) {
        console.log("Error Function : loadGeoracingPartial");
        return;
      }
      minuteHeaderSize = ((numVersion >= 2) ? ((numVersion >= 3) ? 11 : 9) : 5);
      nbActors = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
      if (DEBUG)
        console.log("MinuteHeaderSize: " + minuteHeaderSize + " NbActors:" + nbActors);
      indexOffset += 2;
      minuteInDay = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
      indexOffset += 2;
      HEADER_SIZE = 9;
      GEODATA_STRUCTURE_SIZE = 39;
      if (numVersion >= 3) {
        indexOffset_tmp = indexOffset + 4;
        nbChamps = bytes[indexOffset_tmp];
        indexOffset_tmp++;
        minuteHeaderSize = 10 + nbChamps;
        GEODATA_STRUCTURE_SIZE = 2;
        for (var i = 0; i < nbChamps; i++) {
          id_def = bytes[indexOffset_tmp];
          indexOffset_tmp++;
          def = DEFINITIONS[id_def];
          def_type = DEFINITIONS_Type[def["type"]];
          GEODATA_STRUCTURE_SIZE += def_type["nbOctets"];
        }
      }
      minuteSize = ((numVersion >= 2) ? (peekUInt32(bytes.subarray(indexOffset, indexOffset + 4))) : (minuteHeaderSize + (HEADER_SIZE + GEODATA_STRUCTURE_SIZE * 60) * nbActors));
      indexOffset += 4;
      minute_inc = minuteInDay - availableTime_minutesInDay;
      if (minute_inc >= 0) {
        // kvjc(bytes, bytes_start, loadStat, filename, minute_inc);
        mergeActors(
          result,
          loadBinaryOfGeoPlayer(bytes, date_begin_time.getTime(), bytes_start, minute_inc)
        );
      }
      bytes_start += minuteSize;
      DEBUG = false;
    }
    var endTraitementTime = new Date().getTime();
    if (DEBUG) {
      console.log(" le fichier " + filename + ": " + ((endTraitementTime - startTraitementTime) / 1000.0) + "s pour " + bytes.length + " octets ");
    }
    return result;
  }
  
  function loadBinaryOfGeoPlayer(bytes, date_begin_time = 0, startOffset = 0, minute_inc = 0) {
    // Ex-globals
    var cpls = 0;
  
    if (!isNotEmpty(bytes)) return false;
    var indexOffset = startOffset;
    var numVersion = bytes[indexOffset];
    indexOffset++;
    var minuteHeaderSize = ((numVersion >= 2) ? 9 : 5);
    var nbActors = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
    indexOffset += 2;
    var minuteInDay = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
    indexOffset += 2;
    HEADER_SIZE = 9;
    GEODATA_STRUCTURE_SIZE = 39;
    var structDef = new Array();
    if (numVersion >= 3) {
      var indexOffset_tmp = indexOffset + 4;
      var nbChamps = bytes[indexOffset_tmp];
      indexOffset_tmp++;
      minuteHeaderSize = 10 + nbChamps;
      GEODATA_STRUCTURE_SIZE = 2;
      var id_def, def, def_type;
      for (var i = 0; i < nbChamps; i++) {
        id_def = bytes[indexOffset_tmp];
        indexOffset_tmp++;
        def = DEFINITIONS[id_def];
        def_type = DEFINITIONS_Type[def["type"]];
        GEODATA_STRUCTURE_SIZE += def_type["nbOctets"];
        structDef.push(id_def);
      }
    } else {
      structDef.push(10);
      structDef.push(7);
      structDef.push(8);
      structDef.push(0);
      structDef.push(1);
      structDef.push(2);
      structDef.push(3);
      structDef.push(4);
      structDef.push(9);
    }
    var minuteSize = ((numVersion >= 2) ? (peekUInt32(bytes.subarray(indexOffset, indexOffset + 4))) : (minuteHeaderSize + (HEADER_SIZE + GEODATA_STRUCTURE_SIZE * 60) * nbActors));
    indexOffset += 4;
    if (bytes.length < minuteSize) return false;
    var header_startOffset = startOffset + minuteHeaderSize;
    var datas = bytes.subarray(startOffset + minuteHeaderSize + HEADER_SIZE * nbActors, startOffset + minuteSize);
    var minute = new Array();
    minute["Actors"] = new Array();
    minute["Actors_byId"] = new Array();
    minute["Datas"] = datas;
    minute["Version"] = numVersion;
    minute["structDef"] = structDef;
    minute["GEODATA_STRUCTURE_SIZE"] = GEODATA_STRUCTURE_SIZE;
    var startActorIndex = 0;
    var actor_info_startOffset, actor_info, indexOffset, interval_between_datas, nbDataForActor, actorIdStr, startTime,
        old_minutes, old_actor_info, old_interval_between_datas, old_datas, haveData, second_tmp, struct_tmp,
        millisecond_tmp, firstData_tmp, lastData_tmp, positions_tmp, time_array, actor_datas_startOffset, final_time,
        index_time;
    var result = {};
    for (var i = 0; i < nbActors; i++) {
      actor_info_startOffset = header_startOffset + HEADER_SIZE * i;
      actor_info = {};
      indexOffset = actor_info_startOffset;
      actor_info["index"] = i;
      var actorId = peekUInt32(bytes.subarray(indexOffset, indexOffset + 4));
      actor_info["id"] = actorId;
      indexOffset += 4;
      var actorType = bytes[indexOffset];
      actor_info["type"] = actorType;
      indexOffset++;
      actor_info["interval_between_datas"] = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
      indexOffset += 2;
      if (actor_info["interval_between_datas"] > 4091)
        actor_info["interval_between_datas"] -= 65536;
      actor_info["firstdata"] = bytes[indexOffset];
      indexOffset++;
      actor_info["lastdata"] = bytes[indexOffset];
      indexOffset++;
      actor_info["indexStartDatas"] = startActorIndex * GEODATA_STRUCTURE_SIZE;
      interval_between_datas = actor_info["interval_between_datas"];
      nbDataForActor = Math.ceil(60 * ((interval_between_datas > 0) ? (1.0 / interval_between_datas) : (-interval_between_datas)));
      startActorIndex += nbDataForActor;
      actor_info["firstdata_second"] = actor_info["firstdata"] * ((interval_between_datas > 0) ? (interval_between_datas) : (-1.0 / interval_between_datas));
      actor_info["lastdata_second"] = actor_info["lastdata"] * ((interval_between_datas > 0) ? (interval_between_datas) : (-1.0 / interval_between_datas));
      actorIdStr = actorId.toString();
      minute["Actors"].push(actor_info);
      if (!isNotEmpty(minute["Actors_byId"][actorType]))
        minute["Actors_byId"][actorType] = {};
      minute["Actors_byId"][actorType][actorIdStr] = actor_info;
      if ((cpls == -1) || (actor_info["firstdata_second"] < cpls))
        cpls = Math.floor(actor_info["firstdata_second"]);
      firstData_tmp = (actor_info["firstdata_second"] + minute_inc * 60) * 1000;
      lastData_tmp = (actor_info["lastdata_second"] + minute_inc * 60) * 1000;
      actor_datas_startOffset = actor_info["indexStartDatas"];
      for (var j = actor_info["firstdata"]; j <= actor_info["lastdata"]; j++) {
        haveData = datas[actor_datas_startOffset + j * GEODATA_STRUCTURE_SIZE];
        if (haveData != 1) continue;
        second_tmp = j * ((interval_between_datas > 0) ? (interval_between_datas) : (-1.0 / interval_between_datas));
        { // ex struct_tmp = sskd(minute, id_str, actorType, second_tmp)
          struct_tmp = null;
          if (!((second_tmp < 0) || (second_tmp >= 60) || (!isNotEmpty(minute["Actors_byId"][actorType])) || (!isNotEmpty(minute["Actors_byId"][actorType][actorIdStr])))) {
            var second_indexed = Math.floor(second_tmp * ((actor_info["interval_between_datas"] > 0)
                ? (1.0 / actor_info["interval_between_datas"])
                : (-actor_info["interval_between_datas"])));
            if (!((second_indexed < actor_info["firstdata"]) || (second_indexed > actor_info["lastdata"]))) {
              var indexInDatas = actor_info["indexStartDatas"] + second_indexed * GEODATA_STRUCTURE_SIZE;
              struct_tmp = readStruct(minute["Datas"], indexInDatas, minute["structDef"], GEODATA_STRUCTURE_SIZE);
            }
          }
        }
        second_tmp += (((isNotEmpty(struct_tmp)) && (isNotEmpty(struct_tmp.offset))) ? struct_tmp.offset : 0) + minute_inc * 60;
        millisecond_tmp = Math.floor(second_tmp * 1000.0);
        if (!( // ex datas_checkDatas(struct_tmp)
            (isNotEmpty(struct_tmp)) && (wqwk([struct_tmp.lg, struct_tmp.lt]))
            && ((struct_tmp.lg != 0) || (struct_tmp.lt != 0))
            && (struct_tmp.lg >= yhny.start_lg) && (struct_tmp.lg <= yhny.end_lg)
            && (struct_tmp.lt <= yhny.start_lt) && (struct_tmp.lt >= yhny.end_lt)
        )) continue;
        if (!result[actorIdStr]) {
          result[actorIdStr] = [];
        }
        result[actorIdStr].push({
          at: date_begin_time + millisecond_tmp,
          lng: struct_tmp.lt,
          lat: struct_tmp.lg,
          other: struct_tmp, // actor_info contains only data offsets
        });
      }
    }
    return result;
  }
  
  
  /**
   * @param {Uint8Array} bytes
   * @param {Object | null} meta
   * @returns {{ActorsPositions: { [actorId]: Array }, ActorsRankings: { [actorId]: Array }}}
   */
  function getPositionsFromBinary(bytes, meta = null) {
    if (meta) {
      if (/OneBigFile__r__positions\.bin$/.test(meta.filename)) {
        return loadGeoracingOneBig(bytes, meta.filename, meta.available_time)
      }
  
      var filenameMatches = meta.filename.match(/(\d\d\d\d_\d\d_\d\d)__r\d+__positions\.bin$/);
      var day = filenameMatches
          ? filenameMatches[1].replace(/_/g, '-')
          : meta.available_time.substr(0, 10);
  
      return loadGeoracingPartial(bytes, meta.filename, day, meta.available_time);
    }
  
    var index = 0;
    var version = readUInt32(bytes, index);
    index += 4;
    if (version == NUM_VERSION_POSITION_WITHOUT_METEO) {
      return mergeActorsRankingsToActorsPositions(loadBinaryV101(bytes, index));
    } else if (version == NUM_VERSION_POSITION) {
      return mergeActorsRankingsToActorsPositions(loadBinaryV100(bytes, index));
    } else if (version == NUM_VERSION_POSITION_OLD) {
      return mergeActorsRankingsToActorsPositions(loadBinaryV3(bytes, index));
    } else {
      throw new Error("invalid version binary file: " + version);
    }
  }
  
(async ()=>{
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var allRacesRequest = await axios.get('http://player.georacing.com/datas/applications/app_12.json')
    var allEvents = allRacesRequest.data.events

    for(eventsIndex in allEvents){
        var event = allEvents[eventsIndex]

        // TODO: Check if this event was already indexed.

        var currentEventSave = {
            id:uuidv4(),
            original_id: event.id,
            name: event.name,
            time_zone: event.time_zone,
            description_en: event.description_en,
            description_fr: event.description_fr,
            short_description: event.short_description,
            start_time:event.start_time,
            end_time: event.end_time
        }

        var startDateStamp = new Date(event.start_time).getTime()
        var endDateStamp = new Date(event.end_time).getTime()
     
        var nowStamp = new Date().getTime()

        if(startDateStamp > nowStamp || endDateStamp > nowStamp){
            console.log('Future race so skipping')
            continue
        }

        var races = event.races

        for(raceIndex in races){
            var race = races[raceIndex]

             // TODO: Check if this race was already indexed.

            var currentRaceSave = {
                id: uuidv4(),
                original_id: race.id,
                event: currentEventSave.id,
                event_original_id: currentEventSave.original_id,
                name: race.name,
                short_name: race.short_name,
                short_description: race.short_description,
                time_zone: race.time_zone,
                available_time: race.available_time,
                start_time: race.start_time,
                end_time: race.end_time
            }

            var raceStartDateStamp = new Date(race.start_time).getTime()
            var raceEndDateStamp = new Date(race.end_time).getTime()

            if(raceStartDateStamp > nowStamp || raceEndDateStamp > nowStamp){
                console.log('Future race so skipping')
                continue
            }

        
            if(race.player_name === ""  || race.player_name === null){
                //  console.log('EMPTY PLAYER ' + race.name)
                    race.player_name = 'http://player.georacing.com/?event=' + currentEventSave.original_id + '&race=' + race.id
            }

            var keepGoing = true;
            
            await page.goto(race.player_name, {waitUntil: "networkidle0", timeout: 600000}).catch(err => {
                keepGoing = false
            })

            
            await page.waitForFunction(() => 'PLAYER_VERSION' in window).catch((err)=>{
                keepGoing = false;
            })

            if(keepGoing){
                await page.waitForFunction("PLAYER_VERSION != null && PLAYER_VERSION.release > 0")
                var playerVersion = await page.evaluate(() => { return PLAYER_VERSION.release })

                if(playerVersion === 4){
                    var loaded_test = "ALL_DATAS_LOADED && ALLJSON_LOADED && URL_JSON_LOADED && URL_BIN_LOADED && BINARY_LOADED && PLAYER_ISREADYFORPLAY && ALL_DATAS_LOADED && BINARY_LOADED && (LOAD_PERCENT >= 90)"
                    await page.waitForFunction(loaded_test, {timeout: 300000});
                    var loaded_test2 = "() => { var filtered = ACTORS_POSITIONS.filter(function(e1) { return e1 != null && e1.length > 0 }); return filtered.length > 0 }"
                    await page.waitForFunction(loaded_test2, {timeout: 300000});

                    // EXAMPLE RACE: http://player.georacing.com/?event=101837&race=97390&name=Course%205%20-%20Cancelled&location=Saint-Brieuc
                    var allRequest = await axios.get('https://player.georacing.com/datas/'+ currentEventSave.original_id + '/' + race.id + '/' + 'all.json')
                    console.log(' VERSION 4 ' + race.player_name)

                    console.log(allRequest.data)
                    var binaryUrls = await page.evaluate(()=>{
                        return Object.keys(URL_BIN_LOADED)
                    })
                    
                    console.log(binaryUrls)
                    for(posIndex in binaryUrls){
                        var posUrl = 'http://player.georacing.com/datas/'+ currentEventSave.original_id + '/' + race.id + '/positions/' + binaryUrls[posIndex]
                        console.log(posUrl)
                        try{
                            var posFileRequest = await axios({
                                method: 'get',
                                responseType: 'arraybuffer',
                                url: posUrl
                            })
                            var bytes = new Uint8Array(posFileRequest.data);
                            console.log(getPositionsFromBinary(bytes, { available_time: race.available_time, filename: binaryUrls[posIndex] }))
                        }catch(err){
                            // TODO: Why do some of these fail?
                        }
                        
                    }
                }else if(playerVersion === 3){
                    // EXAMPLE RACE: https://player.georacing.com/player_tjv/index.html
                    var dataUrl = await page.evaluate(()=>{
                        return URL_DATA
                    }).catch((err) => {
                        keepGoing = false
                    })
                    await page.waitForFunction(() => 'URL_DATA' in window).catch((err)=>{
                        console.log('NO URL DATA')
                        //TODO Handle this.
                    })
                //    var filesRequest = await axios.get('https://player.georacing.com' + dataUrl + 'files.json')
                //    var configRequest = await axios.get('https://player.georacing.com' + dataUrl + 'config/' + filesRequest.data.file_config)

                //    for(positionsFilesIndex in filesRequest.data.files_data){
                //        var url = 'https://player.georacing.com' + dataUrl + 'positions/' + filesRequest.data.files_data[positionsFilesIndex]
                        
                //        var posFileRequest = await axios({
                //         method: 'get',
                //         responseType: 'arraybuffer',
                //         url: url
                //        })
                //        var bytes = new Uint8Array(posFileRequest.data);
                //        try{
                //           var positionsData = getPositionsFromBinary(bytes, null)
                //        }catch(err){
                //           console.log('FAILURE VERSION 3' + race.player_name)
                //        }
                //        // SAVE posFile
                //    }

                    
                }else{
                    console.log('WHAT VERSION ' + race.player_name)
                    console.log(playerVersion)
                }
            }else{
                // Don't keep going.
                console.log(race.player_name)
            }
        }


    }

})();


