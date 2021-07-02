const { axios, uuidv4 } = require('../tracker-schema/utils.js');
const { launchBrowser } = require('../utils/puppeteerLauncher');
const { appendArray } = require('../utils/array');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
    getExistingUrls,
    registerFailedUrl,
} = require('../utils/raw-data-server-utils');

// WARNING: GEORACING HAS THE CHARTS http://player.georacing.com/?event=101887&race=97651
function peekUint8(bytes) {
    if (bytes.length < 1) {
        return 0;
    }
    return bytes[0];
}

function readInt8(bytes, index) {
    let v = bytes[index];
    if (v > 127) v = -(256 - v);
    return v;
}

function readUInt8(bytes, index) {
    return bytes[index];
}

function readUInt16(bytes, index) {
    return (bytes[index + 1] << 8) | bytes[index];
}

function peekInt16(bytes) {
    return peekUInt16(bytes) - ((1 << 15) - 1);
}

function peekUInt16(bytes) {
    if (bytes.length < 2) {
        return 0;
    }
    return (bytes[0] << 8) | bytes[1];
}

function readUInt32(bytes, index) {
    return (
        (bytes[index + 3] << 24) |
        (bytes[index + 2] << 16) |
        (bytes[index + 1] << 8) |
        bytes[index]
    );
}

function peekUInt32(bytes) {
    if (bytes.length < 4) {
        return 0;
    }
    return (bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3];
}

function readInt32(bytes, index) {
    let v =
        (bytes[index + 3] << 24) |
        (bytes[index + 2] << 16) |
        (bytes[index + 1] << 8) |
        bytes[index];
    if (v > 2147483648) v = -(4294967296 - v);
    return v;
}

function readInt64(bytes, index) {
    return (
        (bytes[index + 7] << 56) |
        (bytes[index + 6] << 48) |
        (bytes[index + 5] << 40) |
        (bytes[index + 4] << 32) |
        (bytes[index + 3] << 24) |
        (bytes[index + 2] << 16) |
        (bytes[index + 1] << 8) |
        bytes[index]
    );
}

function readFloat32(bytes, index) {
    const buffer = new ArrayBuffer(4);
    const arr8 = new Uint8Array(buffer);
    arr8.set(bytes.subarray(index, index + 4));
    const float32View = new Float32Array(buffer);
    return float32View[0];
}

function peekFloat32(bytes) {
    if (bytes.length < 4) {
        return 0;
    }
    const arrayTmp = new ArrayBuffer(8);
    const uInt8View = new Uint8Array(arrayTmp);
    uInt8View.set(bytes);
    const float32View = new Float32Array(arrayTmp);
    return float32View[0];
}

function peekFloat64(bytes) {
    if (bytes.length < 8) {
        return 0;
    }
    const arrayTmp = new ArrayBuffer(8);
    const uInt8View = new Uint8Array(arrayTmp);
    uInt8View.set(bytes);
    const float64View = new Float64Array(arrayTmp);
    return float64View[0];
}

function asCenti(val) {
    return val / 100.0;
}

function asDirection(val) {
    if (val === 65535) return 361;
    return (val * 360.0) / (65535 - 1);
}

function asDeci(val) {
    return val / 10.0;
}

function isNotEmpty(variable) {
    return variable !== null && variable !== undefined;
}

const NUM_VERSION_POSITION_WITHOUT_METEO = 101;
const NUM_VERSION_POSITION = 100;
const NUM_VERSION_POSITION_OLD = 3;

function loadBinaryV101RankingsHelper(bytes, index) {
    const rd = {};
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
    const result = {
        ActorsRankings: {},
        ActorsPositions: {},
    };
    const byteslen = bytes.length;
    while (index < byteslen) {
        const timestamp = readInt64(bytes, index);
        index += 8;
        let rankingSize = readUInt32(bytes, index);
        index += 4;
        const structSize = readUInt16(bytes, index);
        index += 2;
        rankingSize += index;
        while (index < rankingSize) {
            const id = readUInt32(bytes, index);
            index += 4;
            const rd = loadBinaryV101RankingsHelper(bytes, index);
            index += structSize - 4 - 1;
            const sid = id + '';
            if (!isNotEmpty(result.ActorsRankings[sid])) {
                result.ActorsRankings[sid] = [];
            }
            result.ActorsRankings[sid].push([timestamp, rd]);
            if (!isNotEmpty(result.ActorsPositions[sid])) {
                result.ActorsPositions[sid] = [];
            }
            const numLocations = readUInt8(bytes, index);
            index += 1;
            for (let l = 0; l < numLocations; l++) {
                const latbin = readUInt32(bytes, index);
                index += 4;
                const lngbin = readUInt32(bytes, index);
                index += 4;
                const offsetTimestamp = readInt32(bytes, index);
                index += 4;
                let latitude = 0;
                let longitude = 0;
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
                const finalTimestamp = timestamp + offsetTimestamp;
                result.ActorsPositions[sid].push({
                    at: finalTimestamp * 1000,
                    lng: longitude,
                    lat: latitude,
                });
            }
        }
    }
    return result;
}

function loadBinaryV100RankingsHelper(bytes, index) {
    const rd = {};
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
    const result = {
        ActorsRankings: {},
        ActorsPositions: {},
    };
    const byteslen = bytes.length;
    while (index < byteslen) {
        const timestamp = readInt64(bytes, index);
        index += 8;
        let rankingSize = readUInt32(bytes, index);
        index += 4;
        const structSize = readUInt16(bytes, index);
        index += 2;
        rankingSize += index;
        while (index < rankingSize) {
            const id = readUInt32(bytes, index);
            index += 4;
            const rd = loadBinaryV100RankingsHelper(bytes, index);
            index += structSize - 4 - 1;
            const sid = id + '';
            if (!isNotEmpty(result.ActorsRankings[sid])) {
                result.ActorsRankings[sid] = [];
            }
            result.ActorsRankings[sid].push([timestamp, rd]);
            if (!isNotEmpty(result.ActorsPositions[sid])) {
                result.ActorsPositions[sid] = [];
            }
            const numLocations = readUInt8(bytes, index);
            index += 1;
            for (let l = 0; l < numLocations; l++) {
                const latbin = readUInt32(bytes, index);
                index += 4;
                const lngbin = readUInt32(bytes, index);
                index += 4;
                const offsetTimestamp = readInt32(bytes, index);
                index += 4;
                let latitude = 0;
                let longitude = 0;
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
                const finalTimestamp = timestamp + offsetTimestamp;
                result.ActorsPositions[sid].push({
                    at: finalTimestamp * 1000,
                    lng: longitude,
                    lat: latitude,
                });
            }
        }
    }
    return result;
}

function loadBinaryV3RankingsHelper(bytes, index) {
    const rd = {};
    rd.rank = readUInt8(bytes, index);
    index += 1;
    rd.evolution = readInt8(bytes, index);
    index += 1;
    rd.status = readInt8(bytes, index);
    index += 1;
    rd.dtf = readFloat32(bytes, index);
    index += 4;
    rd.visible = rd.dtf !== -2;
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
    const result = {
        ActorsRankings: {},
        ActorsPositions: {},
    };
    const byteslen = bytes.length;
    while (index < byteslen) {
        const timestamp = readInt64(bytes, index);
        index += 8;
        let rankingSize = readUInt32(bytes, index);
        index += 4;
        rankingSize += index;
        while (index < rankingSize) {
            const id = readUInt16(bytes, index);
            index += 2;
            const rd = loadBinaryV3RankingsHelper(bytes, index);
            index += 54;
            const sid = id + '';
            if (!isNotEmpty(result.ActorsRankings[sid])) {
                result.ActorsRankings[sid] = [];
            }
            result.ActorsRankings[sid].push([timestamp, rd]);
            if (!isNotEmpty(result.ActorsPositions[sid])) {
                result.ActorsPositions[sid] = [];
            }
            const numLocations = readUInt8(bytes, index);
            index += 1;
            for (let l = 0; l < numLocations; l++) {
                const latbin = readUInt32(bytes, index);
                index += 4;
                const lngbin = readUInt32(bytes, index);
                index += 4;
                const offsetTimestamp = readInt32(bytes, index);
                index += 4;
                let latitude = 0;
                let longitude = 0;
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
                const finalTimestamp = timestamp + offsetTimestamp;
                result.ActorsPositions[sid].push({
                    at: finalTimestamp * 1000,
                    lng: longitude,
                    lat: latitude,
                });
            }
        }
    }
    return result;
}

function mergeActorsRankingsToActorsPositions(data) {
    const result = data.ActorsPositions;
    for (const actorId in data.ActorsRankings) {
        if (
            Object.prototype.hasOwnProperty.call(data.ActorsRankings, actorId)
        ) {
            if (!result[actorId]) {
                result[actorId] = [];
                for (
                    let i = 0, len = data.ActorsRankings[actorId].length;
                    i < len;
                    i++
                ) {
                    result[actorId].push({
                        at: result[actorId][i][0] * 1000, // Timestamp
                        other: result[actorId][i][1],
                    });
                }
            }

            const iLen = data.ActorsRankings[actorId].length;
            for (let i = 0; i < iLen; i++) {
                const ranking = data.ActorsRankings[actorId][i];
                const rankingTimestamp = ranking[0] * 1000;

                // Find pos
                let pos = -1;
                for (let j = 0; j < result[actorId].length; j++) {
                    if (result[actorId][j].at === rankingTimestamp) {
                        pos = j;
                        break;
                    }
                }

                if (pos !== -1) {
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
            });
        }
    }
    return result;
}

let DEBUG = false;
const DEFINITIONS_TYPE = {};
DEFINITIONS_TYPE.Uint8 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return daud(value);
    },
    fonction_FromByte: function (value) {
        return peekUint8(value);
    },
    nbOctets: 1,
};
DEFINITIONS_TYPE.Uint16 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return hdcx(value);
    },
    fonction_FromByte: function (value) {
        return peekUInt16(value);
    },
    nbOctets: 2,
};
DEFINITIONS_TYPE.Uint24 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return aiuw(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return tajk(value);
    },
    nbOctets: 3,
};
DEFINITIONS_TYPE.Uint32 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return lcvl(value);
    },
    fonction_FromByte: function (value) {
        return peekUInt32(value);
    },
    nbOctets: 4,
};
DEFINITIONS_TYPE.Uint64 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return convert_Uint64ToByte(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return convert_ByteToUint64(value);
    },
    nbOctets: 8,
};
DEFINITIONS_TYPE.Int8 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return ehxd(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return zcmk(value);
    },
    nbOctets: 1,
};
DEFINITIONS_TYPE.Int16 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return gnry(value);
    },
    fonction_FromByte: function (value) {
        return peekInt16(value);
    },
    nbOctets: 2,
};
DEFINITIONS_TYPE.Int24 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return gwcq(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return jyyj(value);
    },
    nbOctets: 3,
};
DEFINITIONS_TYPE.Int32 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return cgmc(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return efav(value);
    },
    nbOctets: 4,
};
DEFINITIONS_TYPE.Int64 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return hjsd(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return izmn(value);
    },
    nbOctets: 8,
};
DEFINITIONS_TYPE.Float32 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return swga(value);
    },
    fonction_FromByte: function (value) {
        // eslint-disable-next-line no-undef
        return peekFloat32(value);
    },
    nbOctets: 4,
};
DEFINITIONS_TYPE.Float64 = {
    fonction_ToByte: function (value) {
        // eslint-disable-next-line no-undef
        return jhdj(value);
    },
    fonction_FromByte: function (value) {
        return peekFloat64(value);
    },
    nbOctets: 8,
};
const DEFINITIONS = [];
DEFINITIONS[0] = {
    name: 'lg',
    type: 'Float64',
    bdd_name: 'lg',
    defaultValue: 1000000.0,
};
DEFINITIONS[1] = {
    name: 'lt',
    type: 'Float64',
    bdd_name: 'lt',
    defaultValue: 1000000.0,
};
DEFINITIONS[2] = {
    name: 'al',
    type: 'Float32',
    bdd_name: 'al',
    defaultValue: 1000000.0,
};
DEFINITIONS[3] = {
    name: 's',
    type: 'Float32',
    bdd_name: 'speed',
    defaultValue: 1000000.0,
};
DEFINITIONS[4] = {
    name: 'h',
    type: 'Uint16',
    bdd_name: 'heading',
    defaultValue: 65535,
};
DEFINITIONS[5] = {
    name: 'vmg',
    type: 'Float32',
    bdd_name: 'vmg',
    defaultValue: 1000000.0,
};
DEFINITIONS[6] = {
    name: 'status',
    type: 'Uint8',
    bdd_name: 'status',
    defaultValue: 127,
};
DEFINITIONS[7] = {
    name: 'cl',
    type: 'Uint8',
    bdd_name: 'cl',
    defaultValue: 127,
};
DEFINITIONS[8] = {
    name: 'd',
    type: 'Float32',
    bdd_name: 'd',
    defaultValue: -1.0,
};
DEFINITIONS[9] = {
    name: 'dtnm',
    type: 'Float32',
    bdd_name: 'dtnm',
    defaultValue: -1.0,
};
DEFINITIONS[10] = {
    name: 'r',
    type: 'Uint16',
    bdd_name: 'r',
    defaultValue: 9999,
};
DEFINITIONS[11] = {
    name: 'p',
    type: 'Int16',
    bdd_name: 'p',
    defaultValue: 9999,
};
DEFINITIONS[12] = {
    name: 'gps',
    type: 'Uint16',
    bdd_name: 'gps',
    defaultValue: 65535,
};
DEFINITIONS[13] = {
    name: 'gsm',
    type: 'Uint8',
    bdd_name: 'gsm',
    defaultValue: 127,
};
DEFINITIONS[14] = {
    name: 'bat',
    type: 'Uint8',
    bdd_name: 'bat',
    defaultValue: 127,
};
DEFINITIONS[15] = {
    name: 'ecart_d',
    type: 'Float32',
    bdd_name: 'ecart_d',
    defaultValue: 1000000.0,
};
DEFINITIONS[16] = {
    name: 'int_1',
    type: 'Uint16',
    bdd_name: 'int_1',
    defaultValue: 65535,
};
DEFINITIONS[17] = {
    name: 's_1',
    type: 'Float32',
    bdd_name: 's_1',
    defaultValue: 1000000.0,
};
DEFINITIONS[18] = {
    name: 'h_1',
    type: 'Uint16',
    bdd_name: 'h_1',
    defaultValue: 65535,
};
DEFINITIONS[19] = {
    name: 'vmg_1',
    type: 'Float32',
    bdd_name: 'vmg_1',
    defaultValue: 1000000.0,
};
DEFINITIONS[20] = {
    name: 'int_2',
    type: 'Uint16',
    bdd_name: 'int_2',
    defaultValue: 65535,
};
DEFINITIONS[21] = {
    name: 's_2',
    type: 'Float32',
    bdd_name: 's_2',
    defaultValue: 1000000.0,
};
DEFINITIONS[22] = {
    name: 'h_2',
    type: 'Uint16',
    bdd_name: 'h_2',
    defaultValue: 65535,
};
DEFINITIONS[23] = {
    name: 'vmg_2',
    type: 'Float32',
    bdd_name: 'vmg_2',
    defaultValue: 1000000.0,
};
DEFINITIONS[24] = {
    name: 'tws',
    type: 'Float32',
    bdd_name: 'tws',
    defaultValue: 1000000.0,
};
DEFINITIONS[25] = {
    name: 'twd',
    type: 'Uint16',
    bdd_name: 'twd',
    defaultValue: 65535,
};
DEFINITIONS[26] = {
    name: 'water_temp',
    type: 'Int16',
    bdd_name: 'water_temp',
    defaultValue: 65535,
};
DEFINITIONS[27] = {
    name: 'air_temp',
    type: 'Int16',
    bdd_name: 'air_temp',
    defaultValue: 65535,
};
DEFINITIONS[28] = {
    name: 'air_pression',
    type: 'Uint16',
    bdd_name: 'air_pression',
    defaultValue: 65535,
};
DEFINITIONS[29] = {
    name: 'dp_1',
    type: 'Float32',
    bdd_name: 'dp_1',
    defaultValue: 1000000.0,
};
DEFINITIONS[30] = {
    name: 'dp_2',
    type: 'Float32',
    bdd_name: 'dp_2',
    defaultValue: 1000000.0,
};

const yhny = { start_lg: -180, end_lg: 180, start_lt: 90, end_lt: -90 };

function wqwk(arrayVariables) {
    let isOk = true;
    for (const i in arrayVariables) {
        isOk =
            isOk &&
            arrayVariables[i] !== undefined &&
            arrayVariables[i] !== null;
        if (isOk === false) {
            return false;
        }
    }
    return isOk;
}

function readStruct(bytes, startOffset, structDef, geoDataStructureSize) {
    let indexOffset = startOffset;
    if (bytes.length < geoDataStructureSize || bytes[indexOffset] !== 1) {
        return null;
    }
    indexOffset++;
    const data = {};
    data.offset = bytes[indexOffset];
    indexOffset++;
    const nbDef = structDef.length;
    let def, defType, value;
    for (let i = 0; i < nbDef; i++) {
        def = DEFINITIONS[structDef[i]];
        defType = DEFINITIONS_TYPE[def.type];
        value = defType.fonction_FromByte(
            bytes.subarray(indexOffset, indexOffset + defType.nbOctets)
        );
        data[def.name] = value === def.defaultValue ? null : value;
        indexOffset += defType.nbOctets;
    }
    return data;
}

function mergeActors(result, subResult) {
    for (const iId in subResult) {
        if (Object.prototype.hasOwnProperty.call(subResult, iId)) {
            result[iId] = result[iId]
                ? result[iId].concat(subResult[iId])
                : subResult[iId];
        }
    }
}

function loadGeoracingOneBig(bytes, filename, availableTime) {
    const loadStat = {};
    const startTraitementTime = new Date().getTime();
    if (!isNotEmpty(bytes)) {
        return false;
    }
    const headerSize = 7;
    const nbOctets = bytes.length;
    let index = 0;
    let indexHeader = 0;
    const result = {};
    while (index + headerSize < bytes.length) {
        indexHeader = index;
        const dataSize = peekUInt32(
            bytes.subarray(indexHeader, indexHeader + 4)
        );
        indexHeader += 4;
        const year = (bytes[indexHeader] + 2000).toString();
        indexHeader++;
        let month = bytes[indexHeader].toString();
        indexHeader++;
        let day = bytes[indexHeader].toString();
        indexHeader++;
        if (month.length === 1) month = '0' + month;
        if (day.length === 1) day = '0' + day;
        const dataOfDayStr = year + '-' + month + '-' + day;
        if (index + headerSize + dataSize > bytes.length) {
            break;
        }
        mergeActors(
            result,
            readGeoracingDayOfOneBig(
                bytes,
                index + headerSize,
                dataSize,
                loadStat,
                filename,
                dataOfDayStr,
                availableTime
            )
        );
        index = index + headerSize + dataSize;
    }
    const endTraitementTime = new Date().getTime();
    if (DEBUG) {
        console.log(
            ' le fichier ' +
                filename +
                ': ' +
                (endTraitementTime - startTraitementTime) / 1000.0 +
                's pour ' +
                nbOctets +
                ' octets '
        );
    }
    return result;
}

function readGeoracingDayOfOneBig(
    bytes,
    startOffset,
    partSize,
    loadStat,
    filename,
    day,
    availableTime
) {
    const dateBeginTime = new Date(availableTime);
    const startTraitementTime = new Date().getTime();
    if (!isNotEmpty(bytes)) {
        return false;
    }
    let bytesStart = startOffset;
    const dateOfDay00h00 = new Date(day + 'T00:00:00Z');
    const availableTimeMinutesInDay = Math.floor(
        (dateBeginTime.getTime() - dateOfDay00h00.getTime()) / (1000 * 60)
    );
    let indexOffset,
        numVersion,
        minuteHeaderSize,
        nbActors,
        minuteInDay,
        structDef,
        indexOffsetTmp,
        nbChamps,
        idDef,
        def,
        defType,
        minuteSize,
        minuteInc;
    const endIndex = startOffset + partSize;
    const result = {};
    while (bytesStart + 5 < endIndex) {
        indexOffset = bytesStart;
        numVersion = bytes[indexOffset];
        indexOffset++;
        if (numVersion > 3) {
            console.log('Error Function : loadGeoracingPartial');
            return;
        }
        minuteHeaderSize = numVersion >= 2 ? (numVersion >= 3 ? 11 : 9) : 5;
        nbActors = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
        indexOffset += 2;
        minuteInDay = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
        indexOffset += 2;
        const HEADER_SIZE = 9;
        let GEODATA_STRUCTURE_SIZE = 39;
        structDef = [];
        if (numVersion >= 3) {
            indexOffsetTmp = indexOffset + 4;
            nbChamps = bytes[indexOffsetTmp];
            indexOffsetTmp++;
            minuteHeaderSize = 10 + nbChamps;
            GEODATA_STRUCTURE_SIZE = 2;
            for (let i = 0; i < nbChamps; i++) {
                idDef = bytes[indexOffsetTmp];
                indexOffsetTmp++;
                def = DEFINITIONS[idDef];
                defType = DEFINITIONS_TYPE[def.type];
                GEODATA_STRUCTURE_SIZE += defType.nbOctets;
                structDef.push(idDef);
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
        minuteSize =
            numVersion >= 2
                ? peekUInt32(bytes.subarray(indexOffset, indexOffset + 4))
                : minuteHeaderSize +
                  (HEADER_SIZE + GEODATA_STRUCTURE_SIZE * 60) * nbActors;
        indexOffset += 4;
        minuteInc = minuteInDay - availableTimeMinutesInDay;
        if (minuteInc >= 0) {
            // kvjc(bytes, bytes_start, loadStat, filename, minute_inc);
            mergeActors(
                result,
                loadBinaryOfGeoPlayer(
                    bytes,
                    dateBeginTime.getTime(),
                    bytesStart,
                    minuteInc
                )
            );
        }
        bytesStart += minuteSize;
    }
    const endTraitementTime = new Date().getTime();
    if (DEBUG) {
        console.log(
            ' le fichier ' +
                filename +
                ': ' +
                (endTraitementTime - startTraitementTime) / 1000.0 +
                's pour ' +
                partSize +
                ' octets '
        );
    }
    return result;
}

function loadGeoracingPartial(bytes, filename, day, availableTime) {
    const startOffset = 0;
    const dateBeginTime = new Date(availableTime);
    const startTraitementTime = new Date().getTime();
    let bytesStart = startOffset;
    const dateOfDay00h00 = new Date(day + 'T00:00:00Z');
    const availableTimeMinutesInDay = Math.floor(
        (dateBeginTime.getTime() - dateOfDay00h00.getTime()) / (1000 * 60)
    );
    let indexOffset,
        numVersion,
        minuteHeaderSize,
        nbActors,
        minuteInDay,
        indexOffsetTmp,
        nbChamps,
        idDef,
        def,
        defType,
        minuteSize,
        minuteInc;
    if (DEBUG) {
        console.log(
            '===================================================================================================='
        );
        console.log(
            'Octects : ' +
                bytes.length +
                ' StartOffset: ' +
                startOffset +
                ' Filename: ' +
                filename +
                ' du ' +
                day
        );
    }
    const result = {};
    while (bytesStart + 5 < bytes.length) {
        indexOffset = bytesStart;
        numVersion = bytes[indexOffset];
        indexOffset++;
        if (DEBUG) console.log('VERSION: ' + numVersion);
        if (DEBUG && numVersion === 0) console.log('ERROR VERSION!!');
        if (numVersion > 3) {
            console.log('Error Function : loadGeoracingPartial');
            return;
        }
        minuteHeaderSize = numVersion >= 2 ? (numVersion >= 3 ? 11 : 9) : 5;
        nbActors = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
        if (DEBUG) {
            console.log(
                'MinuteHeaderSize: ' +
                    minuteHeaderSize +
                    ' NbActors:' +
                    nbActors
            );
        }
        indexOffset += 2;
        minuteInDay = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
        indexOffset += 2;
        const HEADER_SIZE = 9;
        let GEODATA_STRUCTURE_SIZE = 39;
        if (numVersion >= 3) {
            indexOffsetTmp = indexOffset + 4;
            nbChamps = bytes[indexOffsetTmp];
            indexOffsetTmp++;
            minuteHeaderSize = 10 + nbChamps;
            GEODATA_STRUCTURE_SIZE = 2;
            for (let i = 0; i < nbChamps; i++) {
                idDef = bytes[indexOffsetTmp];
                indexOffsetTmp++;
                def = DEFINITIONS[idDef];
                defType = DEFINITIONS_TYPE[def.type];
                GEODATA_STRUCTURE_SIZE += defType.nbOctets;
            }
        }
        minuteSize =
            numVersion >= 2
                ? peekUInt32(bytes.subarray(indexOffset, indexOffset + 4))
                : minuteHeaderSize +
                  (HEADER_SIZE + GEODATA_STRUCTURE_SIZE * 60) * nbActors;
        indexOffset += 4;
        minuteInc = minuteInDay - availableTimeMinutesInDay;
        if (minuteInc >= 0) {
            // kvjc(bytes, bytes_start, loadStat, filename, minute_inc);
            mergeActors(
                result,
                loadBinaryOfGeoPlayer(
                    bytes,
                    dateBeginTime.getTime(),
                    bytesStart,
                    minuteInc
                )
            );
        }
        bytesStart += minuteSize;
        DEBUG = false;
    }
    const endTraitementTime = new Date().getTime();
    if (DEBUG) {
        console.log(
            ' le fichier ' +
                filename +
                ': ' +
                (endTraitementTime - startTraitementTime) / 1000.0 +
                's pour ' +
                bytes.length +
                ' octets '
        );
    }
    return result;
}

function loadBinaryOfGeoPlayer(
    bytes,
    dateBeginTime = 0,
    startOffset = 0,
    minuteInc = 0
) {
    // Ex-globals
    let cpls = 0;

    if (!isNotEmpty(bytes)) return false;
    let indexOffset = startOffset;
    const numVersion = bytes[indexOffset];
    indexOffset++;
    let minuteHeaderSize = numVersion >= 2 ? 9 : 5;
    const nbActors = peekUInt16(bytes.subarray(indexOffset, indexOffset + 2));
    indexOffset += 2;
    // const minuteInDay = peekUInt16(
    //     bytes.subarray(indexOffset, indexOffset + 2)
    // );
    indexOffset += 2;
    const HEADER_SIZE = 9;
    let GEODATA_STRUCTURE_SIZE = 39;
    const structDef = [];
    if (numVersion >= 3) {
        let indexOffsetTmp = indexOffset + 4;
        const nbChamps = bytes[indexOffsetTmp];
        indexOffsetTmp++;
        minuteHeaderSize = 10 + nbChamps;
        GEODATA_STRUCTURE_SIZE = 2;
        let idDef, def, defType;
        for (let i = 0; i < nbChamps; i++) {
            idDef = bytes[indexOffsetTmp];
            indexOffsetTmp++;
            def = DEFINITIONS[idDef];
            defType = DEFINITIONS_TYPE[def.type];
            GEODATA_STRUCTURE_SIZE += defType.nbOctets;
            structDef.push(idDef);
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
    const minuteSize =
        numVersion >= 2
            ? peekUInt32(bytes.subarray(indexOffset, indexOffset + 4))
            : minuteHeaderSize +
              (HEADER_SIZE + GEODATA_STRUCTURE_SIZE * 60) * nbActors;
    indexOffset += 4;
    if (bytes.length < minuteSize) return false;
    const headerStartOffset = startOffset + minuteHeaderSize;
    const datas = bytes.subarray(
        startOffset + minuteHeaderSize + HEADER_SIZE * nbActors,
        startOffset + minuteSize
    );
    const minute = [];
    minute.Actors = [];
    minute.Actors_byId = [];
    minute.Datas = datas;
    minute.Version = numVersion;
    minute.structDef = structDef;
    minute.GEODATA_STRUCTURE_SIZE = GEODATA_STRUCTURE_SIZE;
    let startActorIndex = 0;
    let actorInfoStartOffset,
        actorInfo,
        idxOffset,
        intervalBetweenDatas,
        nbDataForActor,
        actorIdStr,
        // startTime,
        // old_minutes,
        // old_actor_info,
        // old_interval_between_datas,
        // old_datas,
        haveData,
        secondTmp,
        structTmp,
        millisecondTmp,
        // firstDataTmp,
        // lastDataTmp,
        // positions_tmp,
        // time_array,
        // final_time,
        // index_time,
        actorDatasStartOffset;
    const result = {};
    for (let i = 0; i < nbActors; i++) {
        actorInfoStartOffset = headerStartOffset + HEADER_SIZE * i;
        actorInfo = {};
        idxOffset = actorInfoStartOffset;
        actorInfo.index = i;
        const actorId = peekUInt32(bytes.subarray(idxOffset, idxOffset + 4));
        actorInfo.id = actorId;
        idxOffset += 4;
        const actorType = bytes[idxOffset];
        actorInfo.type = actorType;
        idxOffset++;
        actorInfo.interval_between_datas = peekUInt16(
            bytes.subarray(idxOffset, idxOffset + 2)
        );
        idxOffset += 2;
        if (actorInfo.interval_between_datas > 4091) {
            actorInfo.interval_between_datas -= 65536;
        }
        actorInfo.firstdata = bytes[idxOffset];
        idxOffset++;
        actorInfo.lastdata = bytes[idxOffset];
        idxOffset++;
        actorInfo.indexStartDatas = startActorIndex * GEODATA_STRUCTURE_SIZE;
        intervalBetweenDatas = actorInfo.interval_between_datas;
        nbDataForActor = Math.ceil(
            60 *
                (intervalBetweenDatas > 0
                    ? 1.0 / intervalBetweenDatas
                    : -intervalBetweenDatas)
        );
        startActorIndex += nbDataForActor;
        actorInfo.firstdata_second =
            actorInfo.firstdata *
            (intervalBetweenDatas > 0
                ? intervalBetweenDatas
                : -1.0 / intervalBetweenDatas);
        actorInfo.lastdata_second =
            actorInfo.lastdata *
            (intervalBetweenDatas > 0
                ? intervalBetweenDatas
                : -1.0 / intervalBetweenDatas);
        actorIdStr = actorId.toString();
        minute.Actors.push(actorInfo);
        if (!isNotEmpty(minute.Actors_byId[actorType])) {
            minute.Actors_byId[actorType] = {};
        }
        minute.Actors_byId[actorType][actorIdStr] = actorInfo;
        if (cpls === -1 || actorInfo.firstdata_second < cpls) {
            cpls = Math.floor(actorInfo.firstdata_second);
        }
        // firstDataTmp = (actorInfo.firstdata_second + minuteInc * 60) * 1000;
        // lastDataTmp = (actorInfo.lastdata_second + minuteInc * 60) * 1000;
        actorDatasStartOffset = actorInfo.indexStartDatas;
        for (let j = actorInfo.firstdata; j <= actorInfo.lastdata; j++) {
            haveData =
                datas[actorDatasStartOffset + j * GEODATA_STRUCTURE_SIZE];
            if (haveData !== 1) continue;
            secondTmp =
                j *
                (intervalBetweenDatas > 0
                    ? intervalBetweenDatas
                    : -1.0 / intervalBetweenDatas);

            // ex struct_tmp = sskd(minute, id_str, actorType, second_tmp)
            structTmp = null;
            if (
                !(
                    secondTmp < 0 ||
                    secondTmp >= 60 ||
                    !isNotEmpty(minute.Actors_byId[actorType]) ||
                    !isNotEmpty(minute.Actors_byId[actorType][actorIdStr])
                )
            ) {
                const secondIndexed = Math.floor(
                    secondTmp *
                        (actorInfo.interval_between_datas > 0
                            ? 1.0 / actorInfo.interval_between_datas
                            : -actorInfo.interval_between_datas)
                );
                if (
                    !(
                        secondIndexed < actorInfo.firstdata ||
                        secondIndexed > actorInfo.lastdata
                    )
                ) {
                    const indexInDatas =
                        actorInfo.indexStartDatas +
                        secondIndexed * GEODATA_STRUCTURE_SIZE;
                    structTmp = readStruct(
                        minute.Datas,
                        indexInDatas,
                        minute.structDef,
                        GEODATA_STRUCTURE_SIZE
                    );
                }
            }

            secondTmp +=
                (isNotEmpty(structTmp) && isNotEmpty(structTmp.offset)
                    ? structTmp.offset
                    : 0) +
                minuteInc * 60;
            millisecondTmp = Math.floor(secondTmp * 1000.0);
            if (
                !(
                    // ex datas_checkDatas(struct_tmp)
                    (
                        isNotEmpty(structTmp) &&
                        wqwk([structTmp.lg, structTmp.lt]) &&
                        (structTmp.lg !== 0 || structTmp.lt !== 0) &&
                        structTmp.lg >= yhny.start_lg &&
                        structTmp.lg <= yhny.end_lg &&
                        structTmp.lt <= yhny.start_lt &&
                        structTmp.lt >= yhny.end_lt
                    )
                )
            ) {
                continue;
            }
            if (!result[actorIdStr]) {
                result[actorIdStr] = [];
            }
            result[actorIdStr].push({
                at: dateBeginTime + millisecondTmp,
                lng: structTmp.lg,
                lat: structTmp.lt,
                other: structTmp, // actor_info contains only data offsets
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
            return loadGeoracingOneBig(
                bytes,
                meta.filename,
                meta.available_time
            );
        }

        const filenameMatches = meta.filename.match(
            /(\d\d\d\d_\d\d_\d\d)__r\d+__positions\.bin$/
        );
        const day = filenameMatches
            ? filenameMatches[1].replace(/_/g, '-')
            : meta.available_time.substr(0, 10);

        return loadGeoracingPartial(
            bytes,
            meta.filename,
            day,
            meta.available_time
        );
    }

    let index = 0;
    const version = readUInt32(bytes, index);
    console.log({ positionBinVersion: version });
    index += 4;
    if (version === NUM_VERSION_POSITION_WITHOUT_METEO) {
        return mergeActorsRankingsToActorsPositions(
            loadBinaryV101(bytes, index)
        );
    } else if (version === NUM_VERSION_POSITION) {
        return mergeActorsRankingsToActorsPositions(
            loadBinaryV100(bytes, index)
        );
    } else if (version === NUM_VERSION_POSITION_OLD) {
        return mergeActorsRankingsToActorsPositions(loadBinaryV3(bytes, index));
    } else {
        throw new Error('invalid version binary file: ' + version);
    }
}

function getVirtualitiesGroundsData(grounds, raceObjSave) {
    if (grounds) {
        return grounds.map((g) => {
            return {
                id: uuidv4(),
                original_id: g.id,
                race: raceObjSave.id,
                race_original_id: raceObjSave.original_id,
                place_or_ground: 'ground',
                name: JSON.stringify(g.name),
                lon: g.lo,
                lat: g.la,
                size: g.size,
            };
        });
    }
    return null;
}

function getVirtualitiesPlacesData(places, raceObjSave) {
    if (places) {
        return places.map((p) => {
            return {
                id: uuidv4(),
                original_id: p.id,
                race: raceObjSave.id,
                race_original_id: raceObjSave.original_id,
                place_or_ground: 'place',
                name: JSON.stringify(p.name),
                lon: p.lo,
                lat: p.la,
                size: p.size,
            };
        });
    }
    return null;
}

function getVirtualitiesLinesData(lines, raceObjSave) {
    if (lines !== undefined) {
        return lines.map((l) => {
            return {
                id: uuidv4(),
                original_id: l.id,
                race: raceObjSave.id,
                race_original_id: raceObjSave.original_id,
                name: JSON.stringify(l.name),
                type: l.type,
                close: l.close,
                percent_factor: l.percent_factor,
                points: l.points,
                stroke_dasharray: l.stroke_dasharray,
            };
        });
    }
    return null;
}

function getWeatherData(weathers, raceObjSave) {
    if (weathers !== null && weathers !== undefined) {
        /**
         * { wind_direction: 260,
            wind_strength: null,
            wind_strength_unit: null,
            temperature: null,
            temperature_unit: null,
            type: 'none',
            time: '2020-09-03T22:04:46Z' }
            */
        return weathers.map((w) => {
            return {
                id: uuidv4(),
                race: raceObjSave.id,
                race_original_id: raceObjSave.original_id,
                wind_diraction: w.wind_direction,
                wind_strength: w.wind_strength,
                wind_strength_unit: w.wind_strength_unit,
                temperature: w.temperature,
                temperature_unit: w.temperature_unit,
                type: w.type,
                time: w.time,
            };
        });
    }
    return null;
}
function getActorsData(actors, raceObjSave) {
    if (!actors) {
        return null;
    }
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
    return actors.map((a) => {
        const actorObjSave = {};
        actorObjSave.id = uuidv4();
        actorObjSave.original_id = a.id;
        actorObjSave.race = raceObjSave.id;
        actorObjSave.race_original_id = raceObjSave.original_id;
        actorObjSave.event = raceObjSave.event;
        actorObjSave.event_original_id = raceObjSave.event_original_id;
        actorObjSave.tracker_id = a.tracker_id;
        actorObjSave.tracker2_id = a.tracker2_id;
        actorObjSave.id_provider_actor = a.id_provider_actor;
        actorObjSave.team_id = a.team_id;
        actorObjSave.profile_id = a.profile_id;
        actorObjSave.start_number = a.start_number;
        actorObjSave.first_name = a.first_name;
        actorObjSave.middle_name = a.middle_name;
        actorObjSave.last_name = a.last_name;
        actorObjSave.name = a.name;
        actorObjSave.big_name = a.big_name;
        actorObjSave.short_name = a.short_name;
        actorObjSave.members = a.members;
        actorObjSave.active = a.active;
        actorObjSave.visible = a.visible;
        actorObjSave.orientation_angle = a.orientation_angle;
        actorObjSave.start_time = a.start_time;
        actorObjSave.has_penality = a.has_penality;
        actorObjSave.sponsor_url = a.sponsor_url;
        actorObjSave.start_order = a.start_order;
        actorObjSave.rating = a.rating;
        actorObjSave.penality = a.penality;
        actorObjSave.penality_time = a.penality_time;
        actorObjSave.capital1 = a.capital1;
        actorObjSave.capital2 = a.capital2;
        actorObjSave.is_security = a.is_security;
        actorObjSave.full_name = a.full_name;
        actorObjSave.categories = a.categories;
        actorObjSave.categories_name = a.categories_name;
        actorObjSave.all_info = a.all_info;
        actorObjSave.nationality = a.nationality;
        actorObjSave.model = a.model;
        actorObjSave.size = a.size;
        actorObjSave.team = a.team;
        actorObjSave.type = a.type;
        actorObjSave.orientation_mode = a.orientation_mode;
        actorObjSave.id_provider_tracker = a.id_provider_tracker;
        actorObjSave.id_provider_tracker2 = a.id_provider_tracker2;
        actorObjSave.states = JSON.stringify(a.states);
        actorObjSave.person = JSON.stringify(a.person);

        actorObjSave.originalActorObject = a;

        return actorObjSave;
    });
}

function getSplittimesData(splittimes, actorsData, raceObjSave) {
    if (!splittimes) {
        return null;
    }

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

    const splittimesSave = [];
    const splittimeObjectsSave = [];
    splittimes.forEach((st) => {
        const splittime = {};
        splittime.id = uuidv4();
        splittime.original_id = st.id;
        splittime.race = raceObjSave.id;
        splittime.race_original_id = raceObjSave.original_id;
        splittime.event = raceObjSave.event;
        splittime.event_original_id = raceObjSave.event_original_id;
        splittime.name = st.name;
        splittime.short_name = st.short_name;
        splittime.splittimes_visible = st.splittimes_visible;
        splittime.hide_on_timeline = st.hide_on_timeline;
        splittime.lap_number = st.lap_number;
        splittime.role = st.role;

        splittimesSave.push(splittime);

        if (!st.splittimes) {
            return;
        }
        st.splittimes.forEach((s) => {
            const splittimeObject = {};
            splittimeObject.id = uuidv4();
            splittimeObject.original_id = s.id;
            splittimeObject.splittime = splittime.id;
            splittimeObject.splittime_original_id = splittime.original_id;
            splittimeObject.actor = actorsData.find(
                (a) => a.original_id === s.actor_id
            )?.id;
            splittimeObject.actor_original_id = s.actor_id;
            splittimeObject.capital = s.capital;
            splittimeObject.max_speed = s.max_speed;
            splittimeObject.duration = s.duration;
            splittimeObject.detection_method_id = s.detection_method_id;
            splittimeObject.is_pit_lap = s.is_pit_lap;
            splittimeObject.run = s.run;
            splittimeObject.value_in = s.value_in;
            splittimeObject.value_out = s.value_out;
            splittimeObject.official = s.official;
            splittimeObject.hours_mandatory_rest = s.hours_mandatory_rest;
            splittimeObject.rest_not_in_cp = s.rest_not_in_cp;
            splittimeObject.rank = s.rank;
            splittimeObject.rr = s.rr;
            splittimeObject.gap = s.gap;
            splittimeObject.time = s.time;
            splittimeObject.time_out = s.time_out;

            splittimeObjectsSave.push(splittimeObject);
        });
    });
    return {
        splittimesSave,
        splittimeObjectsSave,
    };
}

function getCoursesData(courses, raceObjSave) {
    if (!courses) {
        return null;
    }

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
    const coursesSave = [];
    const coursesObjectSave = [];
    const coursesElementSave = [];
    courses.forEach((c) => {
        const course = {};
        course.id = uuidv4();
        course.original_id = c.id;
        course.race = raceObjSave.id;
        course.race_original_id = raceObjSave.original_id;
        course.name = c.name;
        course.active = c.active;
        course.has_track = c.has_track;
        course.url = c.url;
        course.course_type = c.course_type;
        coursesSave.push(course);
        if (c.course_objects) {
            c.course_objects.forEach((co) => {
                const coSave = {};
                coSave.id = uuidv4();
                coSave.original_id = co.id;
                coSave.race = raceObjSave.id;
                coSave.race_original_id = raceObjSave.original_id;
                coSave.course = course.id;
                coSave.course_original_id = course.original_id;
                coSave.name = co.name;
                coSave.short_name = co.short_name;
                coSave.order = co.order;
                coSave.raise_event = co.raise_event;
                coSave.show_layline = co.show_layline;
                coSave.is_image_reverse = co.is_image_reverse;
                coSave.altitude_max = co.altitude_max;
                coSave.altitude_min = co.altitude_min;
                coSave.circle_size = co.circle_size;
                coSave.splittimes_visible = co.splittimes_visible;
                coSave.hide_on_timeline = co.hide_on_timeline;
                coSave.lap_number = co.lap_number;
                coSave.distance = co.distance;
                coSave.type = co.type;
                coSave.role = co.role;
                coSave.rounding = co.rounding;
                coSave.headline_orientation = co.headline_orientation;
                coursesObjectSave.push(coSave);
                if (co.course_elements) {
                    co.course_elements.forEach((ce) => {
                        const element = {
                            id: uuidv4(),
                            original_id: ce.id,
                            race: raceObjSave.id,
                            race_original_id: raceObjSave.original_id,
                            course: course.id,
                            course_original_id: course.original_id,
                            course_object: coSave.id,
                            course_object_original_id: coSave.original_id,
                            name: ce.name,
                            visible: ce.visible,
                            distance: ce.distance,
                            orientation_angle: ce.orientation_angle,
                            type: ce.type,
                            course_element_type: ce.course_element_type,
                            model: ce.model,
                            size: ce.size,
                            orientation_mode: ce.orientation_mode,
                            longitude: ce.longitude,
                            latitude: ce.latitude,
                            altitude: ce.altitude,
                        };
                        coursesElementSave.push(element);
                    });
                }
            });
        }
    });
    return {
        coursesSave,
        coursesObjectSave,
        coursesElementSave,
    };
}

async function fetchVirtualitiesData(dataUrl, raceObjSave) {
    const groundPlaces = [];
    const lines = [];
    try {
        console.log('Fetch virtualities: ' + dataUrl + 'virtualities.json');
        const virtualitiesRequest = await axios.get(
            dataUrl + 'virtualities.json'
        );
        console.log({
            virtualitiesRequestData: virtualitiesRequest.data,
        });
        const virtualitiesGrounds = getVirtualitiesGroundsData(
            virtualitiesRequest.data.virtualities.grounds,
            raceObjSave
        );
        appendArray(groundPlaces, virtualitiesGrounds);

        const virtualitiesPlaces = getVirtualitiesPlacesData(
            virtualitiesRequest.data.virtualities.places,
            raceObjSave
        );
        appendArray(groundPlaces, virtualitiesPlaces);

        const virtualitiesLines = getVirtualitiesLinesData(
            virtualitiesRequest.data.virtualities.lines,
            raceObjSave
        );
        appendArray(lines, virtualitiesLines);
    } catch (err) {
        // TODO: why do all virtualities requests 404?
        console.log('No virtualities', err.message);
    }
    return {
        groundPlaces,
        lines,
    };
}

async function fetchPositionsData(
    posUrl,
    raceObjSave,
    race,
    binary,
    trackables
) {
    console.log('Fetch position from binary ' + posUrl);
    const actorSave = [];
    const positionSave = [];
    const posFileRequest = await axios({
        method: 'get',
        responseType: 'arraybuffer',
        url: posUrl,
    });
    const bytes = new Uint8Array(posFileRequest.data);
    // Positions are keyed by boat id and valued by a list of positions
    const positionsData = getPositionsFromBinary(
        bytes,
        binary
            ? {
                  available_time: race.available_time,
                  filename: binary,
              }
            : null
    );
    const actors = Object.keys(positionsData);

    actors.forEach((aoid) => {
        let aid = trackables[aoid];

        if (aid === undefined) {
            const actorObjSave = {
                id: uuidv4(),
                original_id: aoid,
            };
            actorObjSave.race = raceObjSave.id;
            actorObjSave.race_original_id = raceObjSave.original_id;
            actorObjSave.event = raceObjSave.event;
            actorObjSave.event_original_id = raceObjSave.event_original_id;

            actorSave.push(actorObjSave);
            trackables[aoid] = {
                trackable_type: 'unknown_actor',
                id: actorObjSave.id,
                original_id: actorObjSave.original_id,
            };
            aid = trackables[aoid];
        }

        positionsData[aoid].forEach((p) => {
            let offset = null;
            let r = null;
            let d = null;
            let lg = null;
            let cl = null;
            let lt = null;
            let al = null;
            let s = null;
            let h = null;
            let dtnm = null;
            if (p.other !== null && p.other !== undefined) {
                offset = p.other.offset;
                r = p.other.r;
                cl = p.other.cl;
                d = p.other.d;
                lg = p.other.lg;
                lt = p.other.lt;
                al = p.other.al;
                s = p.other.s;
                h = p.other.h;
                dtnm = p.other.dtnm;
            }
            const pos = {
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
                offset: offset,
                r: r,
                cl: cl,
                d: d,
                lg: lg,
                lt: lt,
                al: al,
                s: s,
                h: h,
                dtnm: dtnm,
            };
            positionSave.push(pos);
        });
    });
    console.log('Successfully got positions.');
    return {
        actorSave,
        positionSave,
    };
}

function buildActorObject(a, raceObjSave) {
    return {
        id: uuidv4(),
        original_id: null,
        race: raceObjSave.id,
        race_original_id: raceObjSave.original_id,
        event: raceObjSave.event,
        event_original_id: raceObjSave.event_original_id,
        tracker_id: a.tracker_id,
        tracker2_id: a.tracker2_id,
        id_provider_actor: a.id_provider_actor,
        team_id: a.team_id,
        profile_id: a.profile_id,
        start_number: a.start_number,
        first_name: a.first_name,
        middle_name: a.middle_name,
        last_name: a.last_name,
        name: a.name,
        big_name: a.big_name,
        short_name: a.short_name,
        members: a.members,
        active: a.active,
        visible: a.visible,
        orientation_angle: a.orientation_angle,
        start_time: a.start_time,
        has_penality: a.has_penality,
        sponsor_url: a.sponsor_url,
        start_order: a.start_order,
        rating: a.rating,
        penality: a.penality,
        penality_time: a.penality_time,
        capital1: a.capital1,
        capital2: a.capital2,
        is_security: a.is_security,
        full_name: a.full_name,
        categories: a.categories,
        categories_name: a.categories_name,
        all_info: a.all_info,
        nationality: a.nationality,
        model: a.model,
        size: a.size,
        team: a.team,
        type: a.boat_type,
        orientation_mode: a.orientation_mode,
        id_provider_tracker: a.id_provider_tracker,
        id_provider_tracker2: a.id_provider_tracker2,
        states: JSON.stringify(a.states),
        person: JSON.stringify(a.person),
    };
}

async function waitPlayerPageLoadAndGetPlayerVersion(page, race) {
    try {
        await page.goto(race.player_name, {
            waitUntil: 'networkidle0',
            timeout: 600000,
        });
        await page.waitForFunction(() => 'PLAYER_VERSION' in window);

        await page.waitForFunction(
            'PLAYER_VERSION != null && PLAYER_VERSION.release > 0'
        );
        const playerVersion = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return PLAYER_VERSION.release;
        });
        return playerVersion;
    } catch (err) {
        throw new Error('Evaluate PLAYER_VERSION failed: ' + err.toString());
    }
}

async function waitAndGetUrlDataPlayerVersion3(page) {
    try {
        await page.waitForFunction(() => 'URL_DATA' in window);
        let dataUrl = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            return URL_DATA;
        });
        console.log({ dataUrl });
        if (!dataUrl) {
            throw new Error('URL_DATA has no value.');
        }

        if (!dataUrl.includes('player.georacing.com')) {
            dataUrl = 'https://player.georacing.com' + dataUrl;
        }
        return dataUrl;
    } catch (err) {
        throw new Error('Evaluate URL_DATA failed: ' + err.toString());
    }
}

async function waitForPlayerVersion2Ready(page) {
    const loadedTest =
        'ALL_DATAS_LOADED && ALLJSON_LOADED && URL_JSON_LOADED && URL_BIN_LOADED && BINARY_LOADED && PLAYER_ISREADYFORPLAY && ALL_DATAS_LOADED && BINARY_LOADED && (LOAD_PERCENT >= 90)';
    await page.waitForFunction(loadedTest, {
        timeout: 300000,
    });
    const loadedTest2 =
        '() => { var filtered = ACTORS_POSITIONS.filter(function(e1) { return e1 != null && e1.length > 0 }); return filtered.length > 0 }';
    await page.waitForFunction(loadedTest2, {
        timeout: 300000,
    });
}

function getRacePlayerNameURL(eventId, raceId) {
    return `http://player.georacing.com/?event=${eventId}&race=${raceId}`;
}

function getRaceDataURL(eventId, raceId) {
    return `https://player.georacing.com/datas/${eventId}/${raceId}/`;
}

const allRacesURL =
    'http://player.georacing.com/datas/applications/app_12.json';

(async () => {
    const SOURCE = 'georacing';
    let allRacesRequest, browser, page;

    if (!RAW_DATA_SERVER_API) {
        console.log('Please set environment variable RAW_DATA_SERVER_API');
        process.exit();
    }

    try {
        browser = await launchBrowser();
        page = await browser.newPage();
    } catch (err) {
        console.log('Failed in launching puppeteer.', err);
        process.exit();
    }

    let existingUrls;
    try {
        existingUrls = await getExistingUrls(SOURCE);
    } catch (err) {
        console.log('Error getting existing urls', err);
        process.exit();
    }

    try {
        allRacesRequest = await axios.get(allRacesURL);
    } catch (err) {
        console.log('Failed in getting all race urls.', err);
        process.exit();
    }
    const allEvents = allRacesRequest.data.events;

    for (const eventsIndex in allEvents) {
        const event = allEvents[eventsIndex];
        const startDateStamp = new Date(event.start_time).getTime();
        const endDateStamp = new Date(event.end_time).getTime();
        const nowStamp = new Date().getTime();

        if (existingUrls.includes(event.id)) {
            continue;
        }

        console.log(`Processing event with id ${event.id}`);
        if (startDateStamp > nowStamp || endDateStamp > nowStamp) {
            console.log('Future event so skipping');
            continue;
        }

        const races = event.races;

        try {
            const objectsToSave = {};
            const eventObjSave = {
                id: uuidv4(),
                original_id: event.id,
                name: event.name,
                short_name: event.short_name,
                time_zone: event.time_zone,
                description_en: event.description_en,
                description_fr: event.description_fr,
                start_time: event.start_time,
                end_time: event.end_time,
            };
            objectsToSave.GeoracingEvent = [eventObjSave];
            for (const raceIndex in races) {
                objectsToSave.GeoracingRace = [];
                objectsToSave.GeoracingActor = [];
                objectsToSave.GeoracingWeather = [];
                objectsToSave.GeoracingCourse = [];
                objectsToSave.GeoracingCourseObject = [];
                objectsToSave.GeoracingCourseElement = [];
                objectsToSave.GeoracingGroundPlace = [];
                objectsToSave.GeoracingPosition = [];
                objectsToSave.GeoracingLine = [];
                objectsToSave.GeoracingSplittime = [];
                objectsToSave.GeoracingSplittimeObject = [];
                const race = races[raceIndex];
                const raceStartDateStamp = new Date(race.start_time).getTime();
                const raceEndDateStamp = new Date(race.end_time).getTime();

                if (
                    raceStartDateStamp > nowStamp ||
                    raceEndDateStamp > nowStamp
                ) {
                    console.log('Future race so skipping');
                    continue;
                }

                if (!race.player_name) {
                    race.player_name = getRacePlayerNameURL(
                        eventObjSave.original_id,
                        race.id
                    );
                }
                if (existingUrls.includes(race.player_name)) {
                    console.log(
                        `Race url already saved in database ${race.player_name}. Skipping`
                    );
                    continue;
                }
                console.log(
                    `Scraping race ${raceIndex} of ${races.length} with url ${race.player_name}`
                );

                try {
                    const playerVersion = await waitPlayerPageLoadAndGetPlayerVersion(
                        page,
                        race
                    );

                    const raceObjSave = {
                        id: uuidv4(),
                        original_id: race.id,
                        event: eventObjSave.id,
                        event_original_id: eventObjSave.original_id,
                        name: race.name,
                        short_name: race.short_name,
                        short_description: race.short_description,
                        time_zone: race.time_zone,
                        available_time: race.available_time,
                        start_time: race.start_time,
                        end_time: race.end_time,
                        url: race.player_name,
                        player_version: playerVersion,
                    };

                    const lineSave = [];
                    const groundPlaceSave = [];
                    const positionSave = [];
                    const actorSave = [];
                    const courseSave = [];
                    const courseObjectSave = [];
                    const courseElementSave = [];
                    const splittimeSave = [];
                    const splittimeObjectSave = [];
                    const weatherSave = [];

                    const trackables = {};

                    if (playerVersion === 2) {
                        console.log('Version 2', {
                            playerName: race.player_name,
                        });
                        await waitForPlayerVersion2Ready(page);

                        // EXAMPLE RACE: http://player.georacing.com/?event=101837&race=97390&name=Course%205%20-%20Cancelled&location=Saint-Brieuc
                        const dataUrl = getRaceDataURL(
                            eventObjSave.original_id,
                            race.id
                        );
                        console.log(
                            'Request race data: ' + dataUrl + 'all.json'
                        );
                        const allRequest = await axios.get(
                            dataUrl + 'all.json'
                        );
                        /*
                        allRequest.data keys =  [ 'states',
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

                        const {
                            groundPlaces,
                            lines,
                        } = await fetchVirtualitiesData(dataUrl, eventObjSave);
                        appendArray(groundPlaceSave, groundPlaces);
                        appendArray(lineSave, lines);
                        /**

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
                        const weatherData = getWeatherData(
                            allRequest.data.weathers,
                            raceObjSave
                        );
                        appendArray(weatherSave, weatherData);

                        const actorsData = getActorsData(
                            allRequest.data.actors,
                            raceObjSave
                        );
                        if (actorsData) {
                            actorsData.forEach((actorObjSave) => {
                                const { originalActorObject } = actorObjSave;
                                delete actorObjSave.originalActorObject;
                                trackables[originalActorObject.id] = {
                                    trackable_type: 'actor',
                                    id: actorObjSave.id,
                                    original_id: originalActorObject.id,
                                };
                                actorSave.push(actorObjSave);
                            });
                        }

                        const splittimeData = getSplittimesData(
                            allRequest.data.splittimes,
                            actorsData,
                            raceObjSave
                        );
                        if (splittimeData) {
                            appendArray(
                                splittimeSave,
                                splittimeData.splittimesSave
                            );
                            appendArray(
                                splittimeObjectSave,
                                splittimeData.splittimeObjectsSave
                            );
                        }

                        const coursesData = getCoursesData(
                            allRequest.data.courses,
                            raceObjSave
                        );
                        if (coursesData) {
                            appendArray(courseSave, coursesData.coursesSave);
                            appendArray(
                                courseObjectSave,
                                coursesData.coursesObjectSave
                            );
                            coursesData.coursesElementSave.forEach((ce) => {
                                trackables[ce.original_id] = {
                                    trackable_type: 'course_element',
                                    id: ce.id,
                                    original_id: ce.original_id,
                                };
                                courseElementSave.push(ce);
                            });
                        }

                        const binaryUrls = await page.evaluate(() => {
                            // eslint-disable-next-line no-undef
                            return Object.keys(URL_BIN_LOADED);
                        });
                        for (const posIndex in binaryUrls) {
                            const posUrl =
                                'http://player.georacing.com/datas/' +
                                eventObjSave.original_id +
                                '/' +
                                race.id +
                                '/positions/' +
                                binaryUrls[posIndex];
                            try {
                                const positionData = await fetchPositionsData(
                                    posUrl,
                                    raceObjSave,
                                    race,
                                    binaryUrls[posIndex],
                                    trackables
                                );
                                appendArray(actorSave, positionData.actorSave);
                                appendArray(
                                    positionSave,
                                    positionData.positionSave
                                );
                            } catch (err) {
                                console.log(
                                    'Failed to fetch and parse positions! This happens in the web app too!',
                                    err.toString()
                                );
                            }
                        }
                    } else if (playerVersion === 3) {
                        console.log('Version 3!', {
                            playerName: race.player_name,
                        });
                        const dataUrl = await waitAndGetUrlDataPlayerVersion3(
                            page
                        );
                        const filesRequest = await axios.get(
                            dataUrl + 'files.json'
                        );
                        const configRequest = await axios.get(
                            dataUrl + 'config/' + filesRequest.data.file_config
                        );

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

                        const virtualitiesGrounds = getVirtualitiesGroundsData(
                            configRequest.data.virtualities.grounds,
                            raceObjSave
                        );
                        appendArray(groundPlaceSave, virtualitiesGrounds);
                        const virtualitiesPlaces = getVirtualitiesPlacesData(
                            configRequest.data.virtualities.places,
                            raceObjSave
                        );
                        appendArray(groundPlaceSave, virtualitiesPlaces);

                        const virtualitiesLines = getVirtualitiesLinesData(
                            configRequest.data.virtualities.lines,
                            raceObjSave
                        );
                        appendArray(lineSave, virtualitiesLines);

                        configRequest.data.actors.forEach((a) => {
                            const actorObjSave = buildActorObject(
                                a,
                                raceObjSave
                            );
                            trackables[a.id] = {
                                trackable_type: 'actor',
                                id: actorObjSave.id,
                                original_id: a.id,
                            };
                            actorSave.push(actorObjSave);
                        });

                        for (const positionsFilesIndex in filesRequest.data
                            .files_data) {
                            const url =
                                dataUrl +
                                'positions/' +
                                filesRequest.data.files_data[
                                    positionsFilesIndex
                                ];

                            try {
                                const positionData = await fetchPositionsData(
                                    url,
                                    raceObjSave,
                                    race,
                                    null,
                                    trackables
                                );
                                appendArray(actorSave, positionData.actorSave);
                                appendArray(
                                    positionSave,
                                    positionData.positionSave
                                );
                            } catch (err) {
                                console.log(
                                    'FAILURE VERSION 3, fetch and parse positions url: ' +
                                        url
                                );
                                console.log(err.toString());
                            }
                        }
                    } else {
                        console.log(
                            `Race player has version ${playerVersion} url is ${race.player_name}`
                        );
                    }

                    if (positionSave.length === 0) {
                        console.log('No positions. Skipping.');
                        continue;
                    }

                    objectsToSave.GeoracingRace.push(raceObjSave);
                    appendArray(objectsToSave.GeoracingActor, actorSave);
                    appendArray(objectsToSave.GeoracingWeather, weatherSave);
                    appendArray(objectsToSave.GeoracingCourse, courseSave);
                    appendArray(
                        objectsToSave.GeoracingCourseObject,
                        courseObjectSave
                    );
                    appendArray(
                        objectsToSave.GeoracingCourseElement,
                        courseElementSave
                    );
                    appendArray(
                        objectsToSave.GeoracingGroundPlace,
                        groundPlaceSave
                    );
                    appendArray(objectsToSave.GeoracingPosition, positionSave);
                    appendArray(objectsToSave.GeoracingLine, lineSave);
                    appendArray(
                        objectsToSave.GeoracingSplittime,
                        splittimeSave
                    );
                    appendArray(
                        objectsToSave.GeoracingSplittimeObject,
                        splittimeObjectSave
                    );

                    try {
                        await createAndSendTempJsonFile(objectsToSave);
                    } catch (err) {
                        console.log(
                            `Failed creating and sending temp json file for event id ${event.id}`
                        );
                        throw err;
                    }
                } catch (err) {
                    console.log('Failed scraping race', err);
                    await registerFailedUrl(
                        SOURCE,
                        race.player_name,
                        err.toString()
                    );
                }
            }
        } catch (err) {
            console.log(
                `Something went wrong with event ${event.id}`,
                err.toString()
            );
            await registerFailedUrl(SOURCE, event.id, err.toString());
        }
    }
    process.exit();
})();
