// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')
const Spell = require('./spell')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const characterSchema = new Schema(
	{
		name: { type: String, required: true },
		class: { type: String, required: true },
        level: { type: Number, required: true, min: 1 },
		spells: [{type: Schema.Types.ObjectId, ref: 'Spell'}],
		// prepared_spells: [{type: Schema.Types.ObjectId, ref: 'Spell'}],
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		}
	},
	{ timestamps: true }
)

const Character = model('Character', characterSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Character
