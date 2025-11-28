const mongoose = require("mongoose");
const Schema = mongoose.Schema


const Report = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Users',
    },
    bannersReport: [{
        _id: false,
        banner: {
            type: Schema.Types.ObjectId,
            ref: 'Banners',
        },
        recordedDates: [{ type: Date }],
        count: { type: Number }
    }],
    servicesReport: [{
        _id: false,
        service: {
            type: Schema.Types.ObjectId,
            ref: 'Services',
        },
        recordedDates: [{ type: Date }],
        count: { type: Number }
    }]
},
    {
        versionKey: false,
        timestamps: true
    }
)

module.exports = mongoose.model('Reports', Report)