const {Georacing, sequelize, connect, keyInDictionary, findExistingObjects, instantiateOrReturnExisting, getUUIDForOriginalId, bulkSave} = require('../../tracker-schema/schema.js')
const {axios, uuidv4} = require('../../tracker-schema/utils.js')
const puppeteer = require('puppeteer');
const { get } = require('request');

// WARNING: GEORACING HAS THE CHARTS http://player.georacing.com/?event=101887&race=97651
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

    await connect()
    var existingObjects = await findExistingObjects(Georacing)

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    var allRacesRequest = await axios.get('http://player.georacing.com/datas/applications/app_12.json')
    var allEvents = allRacesRequest.data.events
    var count = 0

    for(eventsIndex in allEvents){
        var event = allEvents[eventsIndex]

        // TODO: Check if this event was already indexed.

        var startDateStamp = new Date(event.start_time).getTime()
        var endDateStamp = new Date(event.end_time).getTime()
     
        var nowStamp = new Date().getTime()

        if(startDateStamp > nowStamp || endDateStamp > nowStamp){
            console.log('Future event so skipping')
            continue
        }

        var races = event.races
        count = count + races.length

        try{
          let eventObj = instantiateOrReturnExisting(existingObjects, Georacing.Event, event.id)

          if( !eventObj.shouldSave){
            console.log('Already saved this event so skipping.')
            continue
          }

          let eventObjSave = eventObj.obj
          eventObjSave.name = event.name, 
          eventObjSave.short_name = event.short_name
          eventObjSave.time_zone = event.time_zone
          eventObjSave.description_en = event.description_en
          eventObjSave.description_fr = event.description_fr
          eventObjSave.short_description = event.short_description
          eventObjSave.start_time = event.start_time
          eventObjSave.end_time = event.end_time

          for(raceIndex in races){
            let race = races[raceIndex]

            let raceStartDateStamp = new Date(race.start_time).getTime()
            let raceEndDateStamp = new Date(race.end_time).getTime()

            if(raceStartDateStamp > nowStamp || raceEndDateStamp > nowStamp){
                console.log('Future race so skipping')
                continue
            }
           // console.log(race.player_name)
            if(race.player_name === ""  || race.player_name === null){
              //  EMPTY PLAYER
                  race.player_name = 'http://player.georacing.com/?event=' + eventObjSave.original_id + '&race=' + race.id
            }

           

            let keepGoing = true;
            try{
              await page.goto(race.player_name, {waitUntil: "networkidle0", timeout: 600000}).catch(err => {
                keepGoing = false
              })

            
              await page.waitForFunction(() => 'PLAYER_VERSION' in window).catch((err)=>{
                  keepGoing = false;
              })

              if(keepGoing){

                await page.waitForFunction("PLAYER_VERSION != null && PLAYER_VERSION.release > 0")
                let playerVersion = await page.evaluate(() => { return PLAYER_VERSION.release })
                let raceObj = instantiateOrReturnExisting(existingObjects, Georacing.Race, race.id)
                if(! raceObj.shouldSave){
                  console.log('Already saved this race so skipping.')
                  continue
                }

                let raceObjSave = raceObj.obj
                raceObjSave.event = eventObjSave.id
                raceObjSave.event_original_id = eventObjSave.original_id
                raceObjSave.name = race.name
                raceObjSave.short_name = race.short_name
                raceObjSave.short_description = race.short_description
                raceObjSave.time_zone = race.time_zone
                raceObjSave.available_time = race.available_time
                raceObjSave.start_time = race.start_time
                raceObjSave.end_time = race.end_time
                raceObjSave.url = race.player_name
                raceObjSave.player_version = playerVersion
   
                let raceSave = [raceObjSave]
                let lineSave = []
                let groundPlaceSave = []
                let positionSave = []
                let actorSave = []
                let courseSave = []
                let courseObjectSave = []
                let courseElementSave = []
                let splittimeSave = []
                let splittimeObjectSave = []
                let weatherSave = []

                let trackables = {}
              
                if(playerVersion === 4){
               
                  console.log(race.player_name)
                  var loaded_test = "ALL_DATAS_LOADED && ALLJSON_LOADED && URL_JSON_LOADED && URL_BIN_LOADED && BINARY_LOADED && PLAYER_ISREADYFORPLAY && ALL_DATAS_LOADED && BINARY_LOADED && (LOAD_PERCENT >= 90)"
                  await page.waitForFunction(loaded_test, {timeout: 300000});
                  var loaded_test2 = "() => { var filtered = ACTORS_POSITIONS.filter(function(e1) { return e1 != null && e1.length > 0 }); return filtered.length > 0 }"
                  await page.waitForFunction(loaded_test2, {timeout: 300000});

                  // EXAMPLE RACE: http://player.georacing.com/?event=101837&race=97390&name=Course%205%20-%20Cancelled&location=Saint-Brieuc
                  var dataUrl = 'https://player.georacing.com/datas/'+ eventObjSave.original_id + '/' + race.id + '/'
                  var allRequest = await axios.get(dataUrl + 'all.json')
                  try{
                    var virtualitiesRequest = await axios.get( dataUrl + 'virtualities.json')
                    console.log(virtualitiesRequest.data)
                    if(virtualitiesRequest.data.virtualities.grounds !== undefined){
                      virtualitiesRequest.data.virtualities.grounds.forEach(g => {
                       
                        let groundObjSave = {
                          id:uuidv4(),
                          original_id:g.id,
                          race:raceObjSave.id,
                          race_original_id :raceObjSave.original_id,
                          place_or_ground:'ground',
                          name:JSON.stringify(g.name),
                          lon:g.lo,
                          lat:g.la,
                          size:g.size,
                        }
                       
                        
                        groundPlaceSave.push(groundObjSave)
                      })
                    }
                    if(virtualitiesRequest.data.virtualities.places !== undefined){
                      virtualitiesRequest.data.virtualities.places.forEach(p => {
                       
                        let placeObjSave = {
                          id:uuidv4(),
                          original_id: p.id,
                          race:raceObjSave.id,
                          race_original_id:raceObjSave.original_id,
                          place_or_ground:'place',
                          name:JSON.stringify(p.name),
                          lon:p.lo,
                          lat:p.la,
                          size:p.size
                        }
                       
      
                        groundPlaceSave.push(placeObjSave)
                      })
                    }
                    if(virtualitiesRequest.data.virtualities.lines !== undefined){
                      virtualitiesRequest.data.virtualities.lines.forEach(l => {
                        let line = {
                          id:uuidv4(),
                          original_id: l.id,
                          race: raceObjSave.id,
                          race_original_id: raceObjSave.original_id,
                          name: JSON.stringify(l.name),
                          type: l.type,
                          close: l.close,
                          percent_factor: l.percent_factor,
                          points: l.points,
                          stroke_dasharray: l.stroke_dasharray
                        }
                        lineSave.push(line)
                      })
                    }

                  }catch(err){
                    // TODO: why do all virtualities requests 404?
                    console.log('No virtualities')
                  }
                  /**
                   * allRequest.data keys =  [ 'states',
'message',
'news',
'race',
'options',
'actors',
'courses',
'weathers',
'splittimes',
'track',
'event',
'categories' ]

                   */
                 
                /**
                 * TODO: What is all of this?
                 * /" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/weathers.json",
                      news.json
                      "/" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/splittimes.json",
                      "/" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/courses.json",
                      "/" + CURRENT_EVENT.id + "/categories.json",
                      "/" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/categories.json",
                              done: function(json) {

                      "/" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/race.json",
                      "/" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/options.json",
                      \pyxt + "/" + CURRENT_EVENT.id + "/event.json",

                      event.json"]["update_date"] = new Date();
                          jxwu["race.json"]["update_date"] = new Date();
                          jxwu["categories.json"]["update_date"] = new Date();
                          jxwu["actors.json"]["update_date"] = new Date();
                          jxwu["courses.json"]["update_date"] = new Date();
                          jxwu["splittimes.json"]["update_date"] = new Date();
                          jxwu["weathers.json"]["update_date"] = new Date();
                          jxwu["meteo.json"]["update_date"] = new Date();
                          jxwu["states.json"]["update_date"] = new Date();
                          jxwu["message.json"]["update_date"] = new Date();
                          jxwu["news.json"]["update_date"] = new Date();
                      /positions/positions__r.json",
http://player.georacing.com/raw_datas"
                      hcun + "/" + CURRENT_EVENT.id + "/" + gmrk.id + "/positions/" + index + "__r.json",
                      pyxt + "/" + CURRENT_EVENT.id + "/" + CURRENT_RACE_ID + "/track_prod.xml",

                 */
          
                  
                  // console.log('states')
                  // console.log(allRequest.data.states)

                  // console.log('message')
                  // console.log(allRequest.data.message)

                  // console.log('news')
                  // console.log(allRequest.data.news)

                  // console.log('options')
                  // console.log(allRequest.data.options)

                  // console.log('categories')
                  // console.log(allRequest.data.categories)

                  // console.log('track')
                  // console.log(allRequest.data.track)

                  // console.log('weathers')
                  // console.log(allRequest.data.weathers)
                  if(allRequest.data.weathers !== null && allRequest.data.weathers !== undefined){
                    allRequest.data.weathers.forEach(w => {
                      let weather = {
                        id:uuidv4(),
                        race: raceObjSave.id,
                        race_original_id: raceObjSave.original_id,
                        wind_diraction: w.wind_direction,
                        wind_strength: w.wind_strength,
                        wind_strength_unit: w.wind_strength_unit,
                        temperature: w.temperature,
                        temperature_unit: w.temperature_unit,
                        type: w.type,
                        time: w.time
                      }
                      weatherSave.push(weather)
                    })
                  }
                  
                  /**
                   * { wind_direction: 260,
                      wind_strength: null,
                      wind_strength_unit: null,
                      temperature: null,
                      temperature_unit: null,
                      type: 'none',
                      time: '2020-09-03T22:04:46Z' }
                   */
                  

                  //     console.log('actors')
                   // console.log(allRequest.data.actors[0])
                   allRequest.data.actors.forEach(a => {
                     
                     let actorObj = instantiateOrReturnExisting(existingObjects, Georacing.Actor, a.id)
                     let actorObjSave = actorObj.obj
                    
                      trackables[a.id] = {trackable_type:'actor', id:actorObjSave.id, original_id:a.id}

                      actorObjSave.race = raceObjSave.id                 
                      actorObjSave.race_original_id = raceObjSave.original_id
                      actorObjSave.event = raceObjSave.event
                      actorObjSave.event_original_id = raceObjSave.event_original_id
                      actorObjSave.tracker_id = a.tracker_id
                      actorObjSave.tracker2_id = a.tracker2_id
                      actorObjSave.id_provider_actor = a.id_provider_actor
                      actorObjSave.team_id = a.team_id
                      actorObjSave.profile_id = a.profile_id
                      actorObjSave.start_number = a.start_number
                      actorObjSave.first_name = a.first_name
                      actorObjSave.middle_name = a.middle_name
                      actorObjSave.last_name = a.last_name
                      actorObjSave.name = a.name
                      actorObjSave.big_name = a.big_name
                      actorObjSave.short_name = a.short_name
                      actorObjSave.members = a.members
                      actorObjSave.active = a.active
                      actorObjSave.visible = a.visible
                      actorObjSave.orientation_angle = a.orientation_angle
                      actorObjSave.start_time = a.start_time
                      actorObjSave.has_penality = a.has_penality
                      actorObjSave.sponsor_url = a.sponsor_url
                      actorObjSave.start_order = a.start_order
                      actorObjSave.rating = a.rating
                      actorObjSave.penality = a.penality
                      actorObjSave.penality_time = a.penality_time
                      actorObjSave.capital1 = a.capital1
                      actorObjSave.capital2 = a.capital2
                      actorObjSave.is_security = a.is_security
                      actorObjSave.full_name = a.full_name
                      actorObjSave.categories = a.categories
                      actorObjSave.categories_name = a.categories_name
                      actorObjSave.all_info = a.all_info
                      actorObjSave.nationality = a.nationality
                      actorObjSave.model = a.model
                      actorObjSave.size = a.size
                      actorObjSave.team = a.team
                      actorObjSave.type = a.type 
                      actorObjSave.orientation_mode = a.orientation_mode
                      actorObjSave.id_provider_tracker = a.id_provider_tracker
                      actorObjSave.id_provider_tracker2 = a.id_provider_tracker2
                      actorObjSave.states = JSON.stringify(a.states)
                      actorObjSave.person = JSON.stringify(a.person)

                      actorSave.push(actorObjSave)
                   })
                  /**
                   * allRequest.data.actors is array with each element has keys:
                   * 
                   * 'id',
                    'tracker_id',
                    'tracker2_id',
                    'id_provider_actor',
                    'race_id',
                    'event_id',
                    'team_id',
                    'profile_id',
                    'start_number',
                    'first_name',
                    'middle_name',
                    'last_name',
                    'name',
                    'big_name',
                    'short_name',
                    'members',
                    'color',
                    'color1',
                    'color2',
                    'color3',
                    'logo1',
                    'logo2',
                    'logo3',
                    'logo4',
                    'active',
                    'visible',
                    'photo',
                    'orientation_angle',
                    'start_time',
                    'battery_percent_lost_minute',
                    'battery_note',
                    'has_penality',
                    'sponsor_url',
                    'sponsor_image',
                    'start_order',
                    'rating',
                    'penality',
                    'penality_time',
                    'is_recording',
                    'capital1',
                    'capital2',
                    'is_security',
                    'full_name',
                    'categories',
                    'categories_name',
                    'all_info',
                    'nationality',
                    'model',
                    'size',
                    'team',
                    'type',
                    'orientation_mode',
                    'id_provider_tracker',
                    'id_provider_tracker2',
                    'states',
                    'person'

                    states and person are arrays of something.
                   * 
                   */


                  // console.log('splittimes')
                  // console.log(allRequest.data.splittimes[0].splittimes[0])

                  allRequest.data.splittimes.forEach(st => {
                    let splittime = instantiateOrReturnExisting(existingObjects, Georacing.Splittime, st.id)
                    
                    splittime.obj.race = raceObjSave.id
                    splittime.obj.race_original_id = raceObjSave.original_id
                    splittime.obj.event = raceObjSave.event
                    splittime.obj.event_original_id = raceObjSave.event_original_id
                    splittime.obj.name = st.name
                    splittime.obj.short_name = st.short_name
                    splittime.obj.splittimes_visible = st.splittimes_visible
                    splittime.obj.hide_on_timeline = st.hide_on_timeline
                    splittime.obj.lap_number = st.lap_number
                    splittime.obj.role = st.role
                    splittimeSave.push(splittime.obj)

                    st.splittimes.forEach(s => {
                      let splittimeObject = instantiateOrReturnExisting(existingObjects, Georacing.SplittimeObject, s.id)
                      
                      splittimeObject.obj.splittime = splittime.obj.id
                      splittimeObject.obj.splittime_original_id = splittime.obj.original_id
                      splittimeObject.obj.actor = getUUIDForOriginalId(existingObjects, Georacing.Actor, s.actor_id)
                      splittimeObject.obj.actor_original_id = s.actor_id
                      splittimeObject.obj.capital = s.capital
                      splittimeObject.obj.max_speed = s.max_speed
                      splittimeObject.obj.duration = s.duration
                      splittimeObject.obj.detection_method_id = s.detection_method_id
                      splittimeObject.obj.is_pit_lap = s.is_pit_lap
                      splittimeObject.obj.run = s.run
                      splittimeObject.obj.value_in = s.value_in
                      splittimeObject.obj.value_out = s.value_out
                      splittimeObject.obj.official = s.official
                      splittimeObject.obj.hours_mandatory_rest = s.hours_mandatory_rest
                      splittimeObject.obj.rest_not_in_cp = s.rest_not_in_cp
                      splittimeObject.obj.rank = s.rank
                      splittimeObject.obj.rr = s.rr
                      splittimeObject.obj.gap = s.gap
                      splittimeObject.obj.time = s.time
                      splittimeObject.obj.time_out = s.time_out
                      splittimeObjectSave.push(splittimeObject.obj)
                    })
                  })

                  /**
                   * [ { id: 280393,
                        name: 'Départ',
                        short_name: '',
                        splittimes_visible: 0,
                        hide_on_timeline: 0,
                        lap_number: 0,
                        role: 'start',
                        splittimes: [ [Object], [Object], [Object], [Object], [Object] ] },
                      { id: 280394,
                        name: 'Bouée 1 (1)',
                        short_name: '',
                        splittimes_visible: 1,
                        hide_on_timeline: 0,
                        lap_number: 0,
                        role: 'none',
                        splittimes: [ [Object], [Object], [Object], [Object], [Object] ] },

                        splittime object: { id: 2048345,
                              actor_id: 10145602,
                              capital: null,
                              max_speed: 0,
                              duration: 0,
                              detection_method_id: -1,
                              is_pit_lap: 0,
                              run: 1,
                              value_in: null,
                              value_out: null,
                              official: 0,
                              hours_mandatory_rest: 0,
                              rest_not_in_cp: 0,
                              rank: 1,
                              rr: 1599908280,
                              gap: 0,
                              time: '2020-09-12T10:58:00.000Z',
                              time_out: null }
                   */

                   // console.log('courses)
                 //  console.log(allRequest.data.courses)
                    allRequest.data.courses.forEach(c => {
                      let courseObj = instantiateOrReturnExisting(existingObjects, Georacing.Course, c.id)
                      let course = courseObj.obj
                      course.race = raceObjSave.id
                      course.race_original_id = raceObjSave.original_id
                      course.name = c.name
                      course.active = c.active
                      course.has_track = c.has_track
                      course.url = c.url
                      course.course_type = c.course_type
                      courseSave.push(course)
                      if(c.course_objects !== undefined){
                        c.course_objects.forEach(co => {
                          let courseObjectObj = instantiateOrReturnExisting(existingObjects, Georacing.CourseObject, co.id)
                          let coSave = courseObjectObj.obj
                          coSave.race = raceObjSave.id
                          coSave.race_original_id = raceObjSave.original_id
                          coSave.course = course.id
                          coSave.course_original_id = course.original_id
                          coSave.name = co.name
                          coSave.short_name = co.short_name
                          coSave.order = co.order
                          coSave.raise_event = co.raise_event
                          coSave.show_layline = co.show_layline
                          coSave.is_image_reverse = co.is_image_reverse
                          coSave.altitude_max = co.altitude_max
                          coSave.altitude_min = co.altitude_min
                          coSave.circle_size = co.circle_size
                          coSave.splittimes_visible = co.splittimes_visible
                          coSave.hide_on_timeline = co.hide_on_timeline
                          coSave.lap_number = co.lap_number
                          coSave.distance = co.distance
                          coSave.type = co.type
                          coSave.role = co.role
                          coSave.rounding = co.rounding
                          coSave.headline_orientation = co.headline_orientation
                          courseObjectSave.push(coSave)
                          if(co.course_elements !== undefined){
                            co.course_elements.forEach(ce => {
                            
                              let ceSave = {
                                id: uuidv4(),
                                original_id: ce.id,
                                race:raceObjSave.id,
                                race_original_id:raceObjSave.original_id,
                                course:course.id,
                                course_original_id:course.original_id,
                                course_object:coSave.id,
                                course_object_original_id:coSave.original_id,
                                name:ce.name,
                                visible:ce.visible,
                                distance:ce.distance,
                                orientation_angle:ce.orientation_angle,
                                type:ce.type,
                                course_element_type:ce.course_element_type,
                                model:ce.model,
                                size:ce.size,
                                orientation_mode:ce.orientation_mode,
                                longitude:ce.longitude,
                                latitude:ce.latitude,
                                altitude:ce.altitude
                              }
                              trackables[ceSave.original_id] = {trackable_type:'course_element', id:ceSave.id, original_id:ce.id}
                              
                              
                              courseElementSave.push(ceSave)
                            })
                          }
                         
                        })
                      }
                     
                    })
                  /**
                   * Courses is array of
                   * 
                   *  id: 120257,
                      name: 'Parcours',
                      active: 1,
                      has_track: 0,
                      url: null,
                      course_type: null,
                      course_objects:[]
                   * 
                   * 
                   */
                  /**
                   * Course Objects is array of
                   * { id: 280398,
                        name: 'Bouée 2 (2)',
                        short_name: '',
                        order: 6,
                        raise_event: 1,
                        show_layline: 0,
                        is_image_reverse: 0,
                        altitude_max: -999,
                        altitude_min: -999,
                        circle_size: -1,
                        splittimes_visible: 0,
                        hide_on_timeline: 0,
                        lap_number: 0,
                        distance: 0,
                        type: 'mark',
                        role: 'none',
                        rounding: 'port',
                        headline_orientation: 'leg',
                        course_elements: [ [Object] ] }
                   */
                  /** Course Elements is array of 
                   * { id: 1063667,
                        name: 'S1',
                        visible: 1,
                        distance: 0,
                        color: '#ff8700',
                        logo1: null,
                        logo2: null,
                        orientation_angle: 0,
                        type: 'course_element',
                        course_element_type: 'fixed_latitude_longitude',
                        model: 'BoueeGonflable',
                        size: 1.52,
                        orientation_mode: 'Fixed',
                        longitude: 8.7594294548035,
                        latitude: 42.566214372864,
                        altitude: null },
                   */
                 
                  var binaryUrls = await page.evaluate(()=>{
                    return Object.keys(URL_BIN_LOADED)
                  })
                  for(posIndex in binaryUrls){
                      var posUrl = 'http://player.georacing.com/datas/'+ eventObjSave.original_id + '/' + race.id + '/positions/' + binaryUrls[posIndex]
                      try{
                          var posFileRequest = await axios({
                              method: 'get',
                              responseType: 'arraybuffer',
                              url: posUrl
                          })
                          var bytes = new Uint8Array(posFileRequest.data);
                          // Positions are keyed by boat id and valued by a list of positions
                          var positionsData = getPositionsFromBinary(bytes, { available_time: race.available_time, filename: binaryUrls[posIndex] })
                          var actors = Object.keys(positionsData)
                     
                          actors.forEach(a_oid => {
                            let aid = trackables[a_oid]
                     
                            if(aid === undefined){
                              console.log('TODO: why is this undefined?')
                              let unknownActor = instantiateOrReturnExisting(existingObjects, Georacing.Actor, a_oid)
                              let actorObjSave = unknownActor.obj
                              if(unknownActor.shouldSave){
                                actorObjSave.race = raceObjSave.id                 
                                actorObjSave.race_original_id = raceObjSave.original_id
                                actorObjSave.event = raceObjSave.event
                                actorObjSave.event_original_id = raceObjSave.event_original_id

                                actorSave.push(actorObjSave)
                              }
                              trackables[a_oid] = {trackable_type:'unknown_actor', id:unknownActor.obj.id, original_id:unknownActor.obj.original_id}
                              aid = trackables[a_oid]
                            }
                            
                            positionsData[a_oid].forEach(p => {
                              let offset = null
                              let r = null
                              let d = null
                              let lg = null
                              let cl = null
                              let lt = null
                              let al = null
                              let s = null
                              let h = null
                              let dtnm = null
                              if(p.other !== null && p.other !== undefined){
                                offset = p.other.offset
                                r = p.other.r
                                cl = p.other.cl
                                d = p.other.d
                                lg = p.other.lg
                                lt = p.other.lt
                                al = p.other.al
                                s = p.other.s
                                h = p.other.h
                                dtnm = p.other.dtnm
                              }
                              let pos = {
                                id: uuidv4(),
                                trackable_type: aid.trackable_type,
                                trackable_id: aid.id,
                                trackable_original_id: aid.original_id,
                                race: raceObjSave.id,
                                race_original_id: raceObjSave.original_id,
                                event: raceObjSave.event,
                                event_original_id: raceObjSave.event_original_id,
                                timestamp: p.at,
                                lon: p.lng,
                                lat: p.lat,
                                offset:offset,
                                r:r,
                                cl:cl,
                                d:d,
                                lg:lg,
                                lt:lt,
                                al:al,
                                s:s,
                                h:h,
                                dtnm:dtnm
                              }
                              positionSave.push(pos)
                            })
                          }) 
                          console.log('Successfully got positions.')
                          console.log(posUrl)
                          
                      }catch(err){
                         
                        
                          console.log('Failed to parse positions! This happens in the web app too!')
                          console.log(posUrl)
                         
                         
                      }
                  }
                }else if(playerVersion === 3){
                  console.log('Version 3!')
           
                  console.log(race.player_name)
                  // EXAMPLE RACE: https://player.georacing.com/player_tjv/index.html
                  var dataUrl = await page.evaluate(()=>{
                      return URL_DATA
                  }).catch((err) => {
                      keepGoing = false
                  })
                  console.log(dataUrl)
                  await page.waitForFunction(() => 'URL_DATA' in window).catch((err)=>{
                      console.log('NO URL DATA')
                      //TODO Handle this.
                  })
                  if(!dataUrl.includes('player.georacing.com')){
                    dataUrl = 'https://player.georacing.com' + dataUrl
                  }
                 var filesRequest = await axios.get(dataUrl + 'files.json')
                 var configRequest = await axios.get(dataUrl + 'config/' + filesRequest.data.file_config)
                  
                 configRequest.data.virtualities.grounds.forEach(g => {
                  let groundObjSave = {
                    id:uuidv4(),
                    original_id:g.id,
                    race:raceObjSave.id,
                    race_original_id :raceObjSave.original_id,
                    place_or_ground:'ground',
                    name:JSON.stringify(g.name),
                    lon:g.lo,
                    lat:g.la,
                    size:g.size,
                  }

                   groundPlaceSave.push(groundObjSave)
                 })

                 configRequest.data.virtualities.places.forEach(p => {
                  let placeObjSave = {
                    id:uuidv4(),
                    original_id: p.id,
                    race:raceObjSave.id,
                    race_original_id:raceObjSave.original_id,
                    place_or_ground:'place',
                    name:JSON.stringify(p.name),
                    lon:p.lo,
                    lat:p.la,
                    size:p.size
                  }

                  groundPlaceSave.push(placeObjSave)
                })

                configRequest.data.virtualities.lines.forEach(l => {
                  let line = {
                    id:uuidv4(),
                    original_id: l.id,
                    race: raceObjSave.id,
                    race_original_id: raceObjSave.original_id,
                    name: JSON.stringify(l.name),
                    type: l.type,
                    close: l.close,
                    percent_factor: l.percent_factor,
                    points: l.points,
                    stroke_dasharray: l.stroke_dasharray
                  }
                  lineSave.push(line)
                })

                configRequest.data.actors.forEach(a => {
                  
                     let actorObjSave = {
                       id:uuidv4(),
                       original_id: null,
                       race:raceObjSave.id,                 
                        race_original_id:raceObjSave.original_id,
                        event:raceObjSave.event,
                        event_original_id:raceObjSave.event_original_id,
                        tracker_id:a.tracker_id,
                        tracker2_id:a.tracker2_id,
                        id_provider_actor:a.id_provider_actor,
                        team_id:a.team_id,
                        profile_id:a.profile_id,
                        start_number:a.start_number,
                        first_name:a.first_name,
                        middle_name:a.middle_name,
                        last_name:a.last_name,
                        name:a.name,
                        big_name:a.big_name,
                        short_name:a.short_name,
                        members:a.members,
                        active:a.active,
                        visible:a.visible,
                        orientation_angle:a.orientation_angle,
                        start_time:a.start_time,
                        has_penality:a.has_penality,
                        sponsor_url:a.sponsor_url,
                        start_order:a.start_order,
                        rating:a.rating,
                        penality:a.penality,
                        penality_time:a.penality_time,
                        capital1:a.capital1,
                        capital2:a.capital2,
                        is_security:a.is_security,
                        full_name:a.full_name,
                        categories:a.categories,
                        categories_name:a.categories_name,
                        all_info:a.all_info,
                        nationality:a.nationality,
                        model:a.model,
                        size:a.size,
                        team:a.team,
                        type:a.boat_type ,
                        orientation_mode:a.orientation_mode,
                        id_provider_tracker:a.id_provider_tracker,
                        id_provider_tracker2:a.id_provider_tracker2,
                        states:JSON.stringify(a.states),
                        person:JSON.stringify(a.person)
                     }
                     
            
                    trackables[a.id] = {trackable_type:'actor', id:actorObjSave.id, original_id:a.id}
                    actorSave.push(actorObjSave)
                })

                 /** Config request data has these keys:
                  * [ 'race',
                    'options',
                    'actors',
                    'categories',
                    'virtualities',
                    'message',
                    'sponsors',
                    'ghosts' ]


                    Race has these keys: [ 'name',
                    'available_time',
                    'start_time',
                    'end_time',
                    'start_longitude',
                    'start_latitude',
                    'end_longitude',
                    'end_latitude',
                    'background_color',
                    'logo_color' ]


                    Virtualities has these keys:
                    [ 'grounds', 'places', 'lines', 'images' ]


                    Grounds is array of:

                    'id',
                    'name',
                    'lo',
                    'la',
                    'color',
                    'size',
                    'undefined',
                    'zoom_min',
                    'zoom_max'

                    Places is array of [ 'id',
                  'name',
                  'lo',
                  'la',
                  'color',
                  'size',
                  'zomm_min',
                  'zomm_max',
                  'zoom_min',
                  'zoom_max' ]

                  Lines is array of [ 'id',
                      'name',
                      'color',
                      'type',
                      'close',
                      'percent_factor',
                      'stroke_dasharray',
                      'points' ]
                  */
                 for(positionsFilesIndex in filesRequest.data.files_data){
                     var url = dataUrl + 'positions/' + filesRequest.data.files_data[positionsFilesIndex]
                      
                     var posFileRequest = await axios({
                      method: 'get',
                      responseType: 'arraybuffer',
                      url: url
                     })

                     var bytes = new Uint8Array(posFileRequest.data);
                     try{
                        var positionsData = getPositionsFromBinary(bytes, null)

                        var actors = Object.keys(positionsData)
          
                        actors.forEach(a_oid => {
                          let aid = trackables[a_oid]
                      
                          if(aid === undefined){
                            console.log('TODO: why is this undefined?')
                            
                            let actorObjSave = {
                              id:uuidv4(),
                              original_id:null,
                              race:raceObjSave.id,
                              race_original_id:raceObjSave.original_id,
                              event: raceObjSave.event,
                              event_original_id: raceObjSave.event_original_id
                            }
                            actorSave.push(actorObjSave)
                            trackables[a_oid] = {trackable_type:'unknown_actor', id:actorObjSave.id, original_id:actorObjSave.original_id}
                            aid = trackables[a_oid]
                          }
                          
                          positionsData[a_oid].forEach(p => {
                            let offset = null
                            let r = null
                            let d = null
                            let lg = null
                            let cl = null
                            let lt = null
                            let al = null
                            let s = null
                            let h = null
                            let dtnm = null
                            if(p.other !== null && p.other !== undefined){
                              offset = p.other.offset
                              r = p.other.r
                              cl = p.other.cl
                              d = p.other.d
                              lg = p.other.lg
                              lt = p.other.lt
                              al = p.other.al
                              s = p.other.s
                              h = p.other.h
                              dtnm = p.other.dtnm
                            }
                            let pos = {
                              id: uuidv4(),
                              trackable_type: aid.trackable_type,
                              trackable_id: aid.id,
                              trackable_original_id: aid.original_id,
                              race: raceObjSave.id,
                              race_original_id: raceObjSave.original_id,
                              event: raceObjSave.event,
                              event_original_id: raceObjSave.event_original_id,
                              timestamp: p.at,
                              lon: p.lng,
                              lat: p.lat,
                              offset:offset,
                              r:r,
                              cl:cl,
                              d:d,
                              lg:lg,
                              lt:lt,
                              al:al,
                              s:s,
                              h:h,
                              dtnm:dtnm
                            }
                            positionSave.push(pos)
                          })
                        }) 
                        console.log('Successfully got positions.')
                        
                     }catch(err){
                        console.log('FAILURE VERSION 3' + race.player_name)
                        console.log(err)
                     }
                 }
                }else{
                    console.log('WHAT VERSION ' + race.player_name)
                    console.log(playerVersion)
                }
                let newObjectsToSave = [
                  
                  { objectType:Georacing.Actor, objects:actorSave},
                  { objectType:Georacing.Race, objects:raceSave},
                  { objectType:Georacing.Line, objects:lineSave},
                  { objectType:Georacing.Course, objects:courseSave},
                  { objectType:Georacing.CourseElement, objects:courseElementSave},
                  { objectType:Georacing.CourseObject, objects:courseObjectSave},
                  { objectType:Georacing.GroundPlace, objects:groundPlaceSave},
                  { objectType:Georacing.Position, objects:positionSave},
                  { objectType:Georacing.Splittime, objects:splittimeSave},
                  { objectType:Georacing.SplittimeObject, objects:splittimeObjectSave},
                  { objectType:Georacing.Weather, objects:weatherSave}]
                console.log('Bulk saving objects.')
                try{
                    await bulkSave(newObjectsToSave, Georacing.FailedUrl, race.player_name)
                }catch(err){
                    console.log(err)
                    await Georacing.FailedUrl.create({id:uuidv4(), error: JSON.stringify(err.toString()), url: JSON.stringify(race.player_name)})
                }
              }else{
                //TODO Log failed url. Don't keep going.
                console.log('Shouldnt keep going.')
                console.log(race.player_name)
              }
  
            }catch(err){
              //TODO Log failed url.
              console.log(err)
            }
          }

          await Georacing.Event.create(eventObjSave)
        }catch(err){
          console.log(err)
          //TODO Log failed url.
        }
    }
 

    process.exit()
})();


