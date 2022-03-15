// Import Dependencies
const express = require('express')
const fetch = require('node-fetch')
const Character = require('../models/character')

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

//new route to create a new spell
router.get('/new', (req, res)=>{
    res.render('spells/new')
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