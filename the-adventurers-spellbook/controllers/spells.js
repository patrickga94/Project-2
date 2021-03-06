// Import Dependencies
const express = require('express')
const fetch = require('node-fetch')
const Character = require('../models/character')
const Spell = require('../models/spell')

// Create router
const router = express.Router()

// Router Middleware
// Authorization middleware
// If you have some resources that should be accessible to everyone regardless of loggedIn status, this middleware can be moved, commented out, or deleted. 
router.use((req, res, next) => {
	// checking the loggedIn boolean of our session
	if (req.session.loggedIn) {
		// if they're logged in, go to the next thing(thats the controller)
		next()
	} else {
		// if they're not logged in, send them to the login page
		res.redirect('/auth/login')
	}
})

//Routes

//new route to the create new spell form
router.get('/new', (req, res)=>{
	const { username, userId, loggedIn } = req.session
    res.render('spells/new', {username, loggedIn})
})

//route to create a new spell
router.post('/', (req, res)=>{
	//splits classes into an array
	req.body.classes = req.body.classes.split(" ")
	//checks for concentration
	req.body.concentration = req.body.concentration === "on" ? true : false 
	req.body.owner = req.session.userId
	Spell.create(req.body)
	.then(data =>{
		console.log('this is the new spell that was created', data)
		res.redirect('spells/new')
	})
})

//edit route takes you to the edit spell form
router.get('/:id/:spellIndex/edit', (req, res)=>{
	const characterId = req.params.id
	const spellIndex = req.params.spellIndex
	const { username, userId, loggedIn } = req.session
	Spell.findById(spellIndex)
		.then(spell =>{
			res.render('spells/edit', {spell, characterId, username, loggedIn})
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})

})

//update route updates the spell with new information
router.put('/:id/:spellIndex', (req, res)=>{
	const characterId = req.params.id
	const spellIndex = req.params.spellIndex
	req.body.classes = req.body.classes.split(" ")
	req.body.concentration = req.body.concentration === "on" ? true : false 
	const { username, userId, loggedIn } = req.session
	Spell.findByIdAndUpdate(spellIndex, req.body, {new: true})
		.then(spell =>{
			console.log('the updated spell', spell)
			res.redirect(`/spells/${characterId}/${spell.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

//delete route
router.delete('/:id/:spellIndex', (req, res)=>{
	const characterId = req.params.id
	const spellIndex = req.params.spellIndex
	Spell.findByIdAndRemove(spellIndex)
		.then(spell =>{
			console.log('this is the spell that was removed: ', spell)
			res.redirect(`/spells/${characterId}/mine`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// index that shows only spells the user created
router.get('/:id/mine', (req, res) => {
	const characterId = req.params.id
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Character.findById(characterId)
		.then(character =>{
			Spell.find({ owner: userId })
				.then(customSpells => {
					console.log('these are my spells', customSpells)
					res.render('spells/index', { customSpells, character, username, loggedIn })
				})
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})



//index that shows all spells of the character's class
router.get('/:id', (req, res)=>{
	const characterId =req.params.id
	const { username, userId, loggedIn } = req.session
	let spells
	let customSpells
	Character.findById(characterId)
		.then(character =>{
			const characterClass = character.class.toLowerCase()
			fetch(`https://www.dnd5eapi.co/api/classes/${characterClass}/spells`)
				.then(responseData =>{
					return responseData.json()
				.then(jsonData =>{
					spells = jsonData.results
					//finds all the custom spells that the character's class has access to
					Spell.find({$and: [{classes: {$in: [character.class]}}, {owner: userId}]})
						.then(spellList =>{
							customSpells = spellList
							res.render('spells/index', {spells, username, loggedIn, character, customSpells})
						})
				})
				})
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

//create a new spell from the spell returned by the api
router.post('/:id/:spellIndex/add', (req, res)=>{
	const characterId = req.params.id
	const spellIndex = req.params.spellIndex
	console.log(spellIndex)
	//checks the database to see if this spell has already been added from the API
	Spell.findOne({index: `${spellIndex}`})
		.then(object =>{
			if(object == undefined){
				//searches the API with the spell's index
				fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`)
				.then(responseData =>{
					return responseData.json()
				.then(jsonData =>{
					//if the spell isn't in the API it's a custom spell so we look it up by its id
					if(jsonData.error){
						Character.findById(characterId)
							.then(character=>{
								Spell.findById(spellIndex)
									.then(data =>{
										if(data.classes.includes(character.class)){
										character.spells.push(data)
										}
										return character.save()
									.then(character =>{
										res.redirect(`/spells/${characterId}/${spellIndex}`)
									})
									})
							})
					} else{
						jsonData.classes = jsonData.classes.map(({ name }) => name)
						//creates a spell from the jsonData returned by the fetch request
						Spell.create(jsonData)
							.then(spell =>{
								console.log('new spell made', spell)
								Character.findById(characterId)
									.then(character =>{
										character.spells.push(spell)
										return character.save()
									})
									.then(character =>{
										console.log(character)
										res.redirect(`/spells/${characterId}/${spellIndex}`)
									})
							})
					}
				})
		
				})
			} else{
				Character.findById(characterId)
					.then(character =>{
						character.spells.push(object)
						return character.save()
					})
					.then(character =>{
						res.redirect(`/spells/${characterId}/${spellIndex}`)
					})
			}
		})

		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})

})




//show the details of each spell
router.get('/:id/:spellIndex', (req, res)=>{
	const characterId =req.params.id
	const spellIndex = req.params.spellIndex
	const { username, userId, loggedIn } = req.session
		Character.findById(characterId)
			.then(character =>{
				//search the api for the spell details
					fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`)
						.then(responseData =>{
							return responseData.json()
						.then(jsonData =>{
							//if the spell is custom:
							if(jsonData.error){
								Spell.findById(spellIndex)
								.then(spell =>{
									res.render('spells/show', {spell, username, loggedIn, character, userId})
								})
								.catch((error) => {
									res.redirect(`/error?error=${error}`)
								})
			
							} else{
							const spell = jsonData
							res.render('spells/show', {spell, username, loggedIn, character, userId})
							}
						})
						})

			})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
	
})


// Export the Router
module.exports = router