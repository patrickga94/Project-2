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

// index that shows only spells the user created
router.get('/mine', (req, res) => {
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Spell.find({ owner: userId })
		.then(spells => {
			res.render('spells/index', { spells, username, loggedIn })
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
	// Character.findById(characterId)
	// 	.then(character =>{
			// const characterClass = character.class.toLowerCase()
			fetch(`https://www.dnd5eapi.co/api/spells/${spellIndex}`)
				.then(responseData =>{
					return responseData.json()
				.then(jsonData =>{
					const spell = jsonData
					res.render('spells/show', {spell, username, loggedIn, characterId})
				})
				})
		// })
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})


// Export the Router
module.exports = router