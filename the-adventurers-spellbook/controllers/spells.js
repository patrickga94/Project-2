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
    res.render('spells/new')
})

//route to create a new spell
router.post('/', (req, res)=>{
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
			res.render('spells/edit', {spell, characterId})
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})

})

//update route updates the spell with new information
router.put('/:id/:spellIndex', (req, res)=>{
	const characterId = req.params.id
	const spellIndex = req.params.spellIndex
	req.body.concentration = req.body.concentration === "on" ? true : false 
	const { username, userId, loggedIn } = req.session
	Spell.findByIdAndUpdate(spellIndex, req.body, {new: true})
		.then(spell =>{
			console.log('the updated spell', spell)
			res.redirect(`/spells/${characterId}/${spell.id}`)
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
	Character.findById(characterId)
		.then(character =>{
			const characterClass = character.class.toLowerCase()
			fetch(`https://www.dnd5eapi.co/api/classes/${characterClass}/spells`)
				.then(responseData =>{
					return responseData.json()
				.then(jsonData =>{
					const spells = jsonData.results
					res.render('spells/index', {spells, username, loggedIn, character})
				})
				})
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
	//search the api for the spell details
	if(spellIndex.length < 20 && spellIndex.length > 0){
		fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`)
			.then(responseData =>{
				return responseData.json()
			.then(jsonData =>{
				const spell = jsonData
				res.render('spells/show', {spell, username, loggedIn, characterId, userId})
			})
			})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
	} else if(spellIndex.length > 20){
		Spell.findById(spellIndex)
			.then(spell =>{
				res.render('spells/show', {spell, username, loggedIn, characterId, userId})
			})
			.catch((error) => {
				res.redirect(`/error?error=${error}`)
			})
	}
})


// Export the Router
module.exports = router