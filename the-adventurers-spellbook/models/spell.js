// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const spellSchema = new Schema(
    {
		name: { type: String, required: true },
		desc: { type: String, required: true },
		higher_level: {type: String},
        range: {type: String, required: true},
        duration: { type: String, required: true },
		components: {type: String, required: true},
		material: {type: String},
        concentration: { type: Boolean, required: true},
        casting_time: { type: String, required: true },
        level: { type: Number, min: 0, required: true },
        classes: [{type: String, required: true}],
		// index: {type: String},
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		}
	},
	{ timestamps: true }
)

const Spell = model('Spell', spellSchema)


/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Spell