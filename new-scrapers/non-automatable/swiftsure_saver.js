const { Sequelize, DataTypes } = require('sequelize');
const {
    RAW_DATA_SERVER_API,
    createAndSendTempJsonFile,
} = require('../../utils/raw-data-server-utils');
const path = require('path');

require('dotenv').config({
    path: path.resolve(__dirname, '..', '..', 'tracker-schema', '.env'),
});

if (!RAW_DATA_SERVER_API) {
    console.log('Please set environment variable RAW_DATA_SERVER_API');
    process.exit();
}
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;
if (!DB_HOST || !DB_NAME || !DB_USERNAME || !DB_PASSWORD) {
    console.log(
        'No database configured. Please set environment variables DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD'
    );
    process.exit();
}
const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'postgres',
    logging: false,
});

const models = {};

models.SwiftsureBoat = sequelize.define(
    'SwiftsureBoat',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        boat_name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        api_2_id: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        team_name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        division: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        boat_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        yacht_club: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        make: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        loa: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        home_port: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        skipper: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        skipper_email: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fbib: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        race_sort: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        start_time: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        num_crew: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        scoring: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsureBoats',
        timestamps: false,
    }
);

models.SwiftsureLine = sequelize.define(
    'SwiftsureLine',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lat1: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lon1: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lat2: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lon2: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: 'SwiftsureLines',
        timestamps: false,
    }
);

models.SwiftsureLink = sequelize.define(
    'SwiftsureLink',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lat: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lon: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsureLinks',
        timestamps: false,
    }
);

models.SwiftsureMark = sequelize.define(
    'SwiftsureMark',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lat: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lon: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsureMarks',
        timestamps: false,
    }
);

models.SwiftsurePoint = sequelize.define(
    'SwiftsurePoint',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lat: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lon: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsurePoints',
        timestamps: false,
    }
);

models.SwiftsureSponsor = sequelize.define(
    'SwiftsureSponsor',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lat: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        lon: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsureSponsors',
        timestamps: false,
    }
);

models.SwiftsureRace = sequelize.define(
    'SwiftsureRace',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        welcome: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        race_start: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        course_bounds_n: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        course_bounds_s: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        course_bounds_e: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        course_bounds_w: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        home_bounds_n: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        home_bounds_s: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        home_bounds_e: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        home_bounds_w: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fin_bounds_n: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fin_bounds_s: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fin_bounds_e: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fin_bounds_w: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        timezone: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        track_type: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        event_type: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        update_interval: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        tag_interval: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        url: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        default_facebook: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsureRaces',
        timestamps: false,
    }
);

models.SwiftsurePosition = sequelize.define(
    'SwiftsurePosition',
    {
        id: {
            type: DataTypes.UUID,
            allowNull: false,
            primaryKey: true,
        },
        race: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        race_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        boat: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        boat_original_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        timestamp: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lat: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        lon: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        speed: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        heading: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        stat: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        dtg: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'SwiftsurePositions',
        timestamps: false,
    }
);

(async () => {
    const races = await models.SwiftsureRace.findAll();
    for (const race of races) {
        console.log(`Saving race url ${race.url}`);
        try {
            const where = { race: race.id };
            const objectsToSave = {
                SwiftsureRace: [race],
            };
            for (const key of Object.keys(models)) {
                if (key === 'SwiftsureRace') {
                    continue;
                }
                const m = models[key];
                const data = await m.findAll({ where });
                objectsToSave[key] = data;
            }

            try {
                await createAndSendTempJsonFile(objectsToSave);
            } catch (err) {
                console.log(
                    `Failed creating and sending temp json file for url ${race.url}`,
                    err
                );
                continue;
            }
        } catch (err) {
            console.log(`Failed saving race id ${race.id}`, err);
        }
    }
})();
