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

// Routes

// index ALL
// router.get('/', (req, res) => {
// 	Character.find({})
// 		.then(characters => {
// 			const username = req.session.username
// 			const loggedIn = req.session.loggedIn
			
// 			res.render('characters/index', { characters, username, loggedIn })
// 		})
// 		.catch(error => {
// 			res.redirect(`/error?error=${error}`)
// 		})
// })

// index that shows only the user's characters
router.get('/mine', (req, res) => {
    // destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Character.find({ owner: userId })
		.then(characters => {
			res.render('characters/index', { characters, username, loggedIn })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// new route -> GET route that renders our page with the form
router.get('/new', (req, res) => {
	const { username, userId, loggedIn } = req.session
	res.render('characters/new', { username, loggedIn })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	if(req.body.class == 1){
		req.body.class = "Bard"
	}else if(req.body.class == 2){
		req.body.class = "Cleric"
	}else if(req.body.class == 3){
		req.body.class = "Druid"
	} else if(req.body.class == 4){
		req.body.class = "Palladin"
	} else if(req.body.class == 5){
		req.body.class = "Ranger"
	} else if(req.body.class == 6){
		req.body.class = "Sorcerer"
	} else if(req.body.class == 7){
		req.body.class = "Warlock"
	} else if(req.body.class == 8){
		req.body.class = "Wizard"
	}
	req.body.owner = req.session.userId
	Character.create(req.body)
		.then(character => {
			console.log('this was returned from create', character)
			res.redirect('/characters/mine')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const characterId = req.params.id
	Character.findById(characterId)
		.then(character => {
			res.render('characters/edit', { character })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

//remove spell from spellbook
router.put('/:id/:spellId/remove', (req, res)=>{
	const characterId = req.params.id
	const spellId = req.params.spellId
	Character.findById(characterId)
		.then(character =>{
			character.spells.pull(spellId)
			return character.save()
		})
		.then(character =>{
			res.redirect(`/characters/${characterId}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})



// update route
router.put('/:id', (req, res) => {
	const characterId = req.params.id
	if(req.body.class == 1){
		req.body.class = "Bard"
	}else if(req.body.class == 2){
		req.body.class = "Cleric"
	}else if(req.body.class == 3){
		req.body.class = "Druid"
	} else if(req.body.class == 4){
		req.body.class = "Palladin"
	} else if(req.body.class == 5){
		req.body.class = "Ranger"
	} else if(req.body.class == 6){
		req.body.class = "Sorcerer"
	} else if(req.body.class == 7){
		req.body.class = "Warlock"
	} else if(req.body.class == 8){
		req.body.class = "Wizard"
	}
	Character.findByIdAndUpdate(characterId, req.body, { new: true })

		.then(character => {

			res.redirect(`/characters/${character.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// show route
router.get('/:id', (req, res) => {
	const characterId = req.params.id
	Character.findById(characterId)
		.populate('spells')
		.then(character => {
            const {username, loggedIn, userId} = req.session
			character.spells.sort(function (a, b) {
				return a.level - b.level
			  })
			console.log('this is the character', character)
			res.render('characters/show', { character, username, loggedIn, userId })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/:id', (req, res) => {
	const characterId = req.params.id
	Character.findByIdAndRemove(characterId)
		.then(character => {
			res.redirect('/characters/mine')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
