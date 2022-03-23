# The Adventurer's Spellbook
**An all purpose spellbook for D&D 5e players**

User Story: 
- As a user I want to open the app to a login/signup screen
- As a user I want to enter a username and password to login or create a new account
- As a user after logging in I want to see an index of my created characters and the ability to add or update characters
- As a user I want to create a character with a name, class, subclass, and level
- As a user I want to be able to view these characters individually and see their attributes as well as a spell list
- As a user I want to be able to select spells to add to my known spells list, remove spells from my known spells list, and mark spells as prepared or unprepared
- As a user I want to be able to create my own spells with forms for name, description, level, damage, requirements, and higher level effects

Route Tables:

### Authentication

| Verb   | URI Pattern            | Controller Action |
|--------|------------------------|-------------------|
| POST   | `/auth/signup`             | `users signup`    |
| POST   | `/auth/login`             | `users login`    |
| DELETE | `/auth/logout/`        | `users logout`   |

### Characters

| Verb   | URI Pattern            | Controller Action |
|--------|------------------------|-------------------|
| GET   | `/characters/mine`             | `index`    |
| GET   | `/characters/:id`             | `show`    |
| GET   | `/characters/new`             | `new`    |
| POST   | `/characters`             | `create`    |
| GET   | `/characters/:id/edit`             | `edit`    |
| PUT   | `/characters/:id`             | `update`    |
| DELETE | `/characters/:id`        | `destroy`   |

### Spells

| Verb   | URI Pattern            | Controller Action |
|--------|------------------------|-------------------|
| GET   | `/spells/:id/mine`             | `index`    |
| GET   | `/spells/:id`             | `index`    |
| GET   | `/spells/:id/:spellIndex`             | `show`    |
| GET   | `/spells/new`             | `new`    |
| POST   | `/spells`             | `create`    |
| GET   | `/spells/:id/:spellIndex/edit`             | `edit`    |
| PUT   | `/spells/:id/:spellIndex`             | `update`    |
| POST   | `/spells/:id/:spellIndex/add`             | `create`    |
| DELETE | `/spells/:id/:spellIndex`        | `destroy`   |


Technologies:

- Css
- Javascript
- Express
- Liquid express views
- Mongoose
- Bootstrap
- Spell and class info from: dnd5eapi (https://www.dnd5eapi.co/docs/#intro)
- Background patterns from Hero Patterns (https://heropatterns.com/)

Installation:
- Fork and clone this repo
- Create a .env file and add the following:
    DATABASE_URL=mongodb://localhost/<database name>
    PORT=3000
    SECRET=thiscanbeanythingaslongasitsinyourenvfileitsfine
- Run npm install to install all the necessary node packages

Whiteboard: https://miro.com/app/board/uXjVOF-fKPE=/?invite_link_id=869719621228

ERD: https://miro.com/app/board/uXjVOF8goJI=/?invite_link_id=60429802694